from django.urls import path, include
from rest_framework.routers import DefaultRouter #type:ignore
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView #type:ignore

from .views import (
    RegisterView,
    CurrentUserView,
    UserViewSet,
    GroupViewSet,
    ExpenseViewSet,
    SettlementViewSet,
    UserViewSet
)

router = DefaultRouter()
router.register(r"groups", GroupViewSet, basename="group")
router.register(r"expenses", ExpenseViewSet, basename="expense")
router.register(r"settlements", SettlementViewSet, basename="settlement")
router.register(r"users", UserViewSet, basename="users")

urlpatterns = [
    # 🔓 AUTH (PUBLIC)
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # 🔐 AUTHENTICATED
    path("auth/me/", CurrentUserView.as_view(), name="current_user"),

    path("", include(router.urls)),
]
