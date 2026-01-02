from django.db import models
from django.contrib.auth.models import User

class Group(models.Model):
    name = models.CharField(max_length=100)
    created_by= models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_groups")
    # each group is created by one user but one user can created multiple groups
    members = models.ManyToManyField(User, related_name = "expense_group")
    # A group can have many users, and A user can be a part of many groups.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class Expense(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="expenses")
    amount = models.FloatField()
    description = models.CharField(max_length=255)
    paid_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="paid_expenses"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} - {self.amount}"
    
class Split(models.Model):
    expense = models.ForeignKey(
        Expense, on_delete=models.CASCADE, related_name="splits"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="splits")
    amount = models.FloatField()  # How much this user owes for this expense

    def __str__(self):
        return f"{self.user.username} owes {self.amount} for {self.expense.id}"
    
class Settlement(models.Model):
    group = models.ForeignKey(
        Group, on_delete=models.CASCADE, related_name="settlements"
    )
    paid_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="settlements_made"
    )
    paid_to = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="settlements_received"
    )
    amount = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.paid_by} -> {self.paid_to}: {self.amount}"