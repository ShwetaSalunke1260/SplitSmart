from django.shortcuts import render
from django.contrib.auth.models import User
from django.db import models

from rest_framework import generics, viewsets, permissions, status # type:ignore
# DRF generics provide built-in views like: CreateAPIView, ListAPIView, RetrieveUpdate, DestroyAPIView
from rest_framework.decorators import action # type:ignore
from rest_framework.response import Response # type:ignore
from rest_framework.exceptions import PermissionDenied # type:ignore
from rest_framework.viewsets import ReadOnlyModelViewSet # type:ignore

from .models import Group, Expense, Split, Settlement
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    GroupSerializer,
    ExpenseSerializer,
    SettlementSerializer,
)

# ---------------------- AUTH / USERS -----------------------
class RegisterView(generics.CreateAPIView): # handle POST method
    queryset = User.objects.all()
    serializer_class = RegisterSerializer # password validation
    permission_classes = [permissions.AllowAny]

class CurrentUserView(generics.RetrieveAPIView): # handle GET method
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
class UserViewSet(ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

# -------------------- GROUPS -----------------------
class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only groups where user is a member
        return Group.objects.filter(members=self.request.user)


    @action(detail=True, methods=["post"])
    def add_member(self, request, pk=None):
        group = self.get_object()
        if request.user != group.created_by:
            raise PermissionDenied("Only admin can add members")
        user_id = request.data.get("user_id")
        try:
            user = User.objects.get(id=user_id)
            group.members.add(user)
            return Response({"detail": "Member added."})
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def remove_member(self, request, pk=None):
        group = self.get_object()
        if request.user != group.created_by:
            raise PermissionDenied("Only admin can remove members")
        user_id = request.data.get("user_id")
        try:
            user = User.objects.get(id=user_id)
            group.members.remove(user)
            return Response({"detail": "Member removed."})
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["get"])
    def balances(self, request, pk=None):
        """
        Returns net balance per user in this group.
        Positive = others owe this user.
        Negative = this user owes others.
        """
        group = self.get_object()
        users = group.members.all()

        # Initialize balances
        balances = {user.id: 0.0 for user in users}

        # Process expenses
        for expense in group.expenses.all():
            paid_by = expense.paid_by_id
            amount = expense.amount

            # Everyone's shares:
            for split in expense.splits.all():
                user_id = split.user_id
                share = split.amount

                # user owes 'share'
                balances[user_id] -= share
                # payer is credited
                balances[paid_by] += share

        # Apply settlements (manual payments)
        for s in group.settlements.all():
            balances[s.paid_by_id] += s.amount
            balances[s.paid_to_id] -= s.amount

        # Build readable response
        data = []
        for user in users:
            data.append(
                {
                    "user_id": user.id,
                    "username": user.username,
                    "net_balance": round(balances[user.id], 2),
                }
            )

        return Response(data)
    
    @action(detail=False, methods=["get"])
    def report(self, request):
        user = request.user
        group_id = request.query_params.get("group")

        expenses = Expense.objects.filter(group__members=user)
        settlements = Settlement.objects.filter(group__members=user)

        if group_id:
          expenses = expenses.filter(group_id=group_id)
          settlements = settlements.filter(group_id=group_id)

        total_paid = expenses.filter(paid_by=user).aggregate(
        total=models.Sum("amount"))["total"] or 0

        total_received = settlements.filter(paid_to=user).aggregate(
        total=models.Sum("amount")
    )["total"] or 0

        total_given = settlements.filter(paid_by=user).aggregate(
        total=models.Sum("amount")
    )["total"] or 0

        return Response({
        "total_paid": total_paid,
        "total_received": total_received,
        "total_given": total_given,
        "net_balance": total_received - total_given
    })

    

# ---------- EXPENSES ----------

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().select_related("group", "paid_by").prefetch_related(
        "splits"
    )
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(
            group__members=self.request.user
        )

        group_id = self.request.query_params.get("group")
        if group_id:
            queryset = queryset.filter(group_id=group_id)

        return queryset

    def perform_create(self, serializer):
        # Ensure user is in the group
        group = serializer.validated_data["group"]
        if self.request.user not in group.members.all():
            raise PermissionError("You are not a member of this group.")
        serializer.save(paid_by=self.request.user)


# ---------- SETTLEMENTS ----------

class SettlementViewSet(viewsets.ModelViewSet):
    queryset = Settlement.objects.all().select_related("group", "paid_by", "paid_to")
    serializer_class = SettlementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Settlement.objects.filter(
            group__members=self.request.user
        )

        group_id = self.request.query_params.get("group")
        if group_id:
            queryset = queryset.filter(group_id=group_id)

        return queryset
