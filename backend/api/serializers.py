from dataclasses import field
from rest_framework import serializers # type:ignore
from django.contrib.auth.models import User
from .models import Group, Expense, Split, Settlement

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True, min_length = 6)

    class Meta:
        model =User
        fields = ['username', 'email','password']

    def create(self, validated_data):
        # used create_user instead of create because create stores password in plain text i.e unsafe and create_user store password in hashes
        user = User.objects.create_user(
            username= validated_data["username"],
            email= validated_data["email"],
            password= validated_data['password']
        )
        return user
    
class SplitSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset = User.objects.all(), source="user", write_only=True
    )
    
    class Meta:
        model = Split
        fields=['id','user','user_id','amount']

class ExpenseSerializer(serializers.ModelSerializer):
    paid_by = UserSerializer(read_only=True)
    paid_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="paid_by", write_only=True
    )
    splits = SplitSerializer(many=True)

    class Meta:
        model = Expense
        fields = [
            "id",
            "group",
            "amount",
            "description",
            "paid_by",
            "paid_by_id",
            "created_at",
            "splits",
        ]
        read_only_fields = ["created_at"]

    def create(self, validated_data):
        splits_data = validated_data.pop("splits", [])
        expense = Expense.objects.create(**validated_data)
        for split_data in splits_data:
            Split.objects.create(expense=expense, **split_data)
        return expense
    
class GroupSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True,
        required=False,
    )

    class Meta:
        model = Group
        fields = ["id", "name", "created_by", "members", "member_ids", "created_at"]
        read_only_fields = ["created_at"]

    def create(self, validated_data):
        member_ids = validated_data.pop("member_ids", [])

        # 🔥 SAFE: request MUST exist
        request = self.context["request"]

        group = Group.objects.create(
            name=validated_data["name"],
            created_by=request.user,
        )

        # creator is always a member
        group.members.add(request.user)

        for user in member_ids:
            group.members.add(user)

        return group


class SettlementSerializer(serializers.ModelSerializer):
    paid_by = UserSerializer(read_only=True)
    paid_to = UserSerializer(read_only=True)
    paid_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="paid_by", write_only=True
    )
    paid_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="paid_to", write_only=True
    )

    class Meta:
        model = Settlement
        fields = [
            "id",
            "group",
            "paid_by",
            "paid_by_id",
            "paid_to",
            "paid_to_id",
            "amount",
            "date",
        ]
        read_only_fields = ["date"]