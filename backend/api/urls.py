from django.urls import path, include
from rest_framework.routers import DefaultRouter # type:ignore

from .views import (
    RegisterView,
    CurrentUserView,
    UserViewSet,
    GroupViewSet,
    ExpenseViewSet,
    SettlementViewSet,
    UserViewSet,
)

router = DefaultRouter()
router.register(r"groups", GroupViewSet, basename="group")
router.register(r"expenses", ExpenseViewSet, basename="expense")
router.register(r"settlements", SettlementViewSet, basename="settlement")
router.register("users", UserViewSet, basename="users")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/me/", CurrentUserView.as_view(), name="current_user"),
    path("", include(router.urls)),
]
