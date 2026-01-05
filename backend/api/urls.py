from django.urls import path, include
from rest_framework.routers import DefaultRouter #type:ignore
from rest_framework_simplejwt.views import ( #type:ignore
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView,
    CurrentUserView,
    UserViewSet,
    GroupViewSet,
    ExpenseViewSet,
    SettlementViewSet,
)

router = DefaultRouter()
router.register(r"groups", GroupViewSet, basename="group")
router.register(r"expenses", ExpenseViewSet, basename="expense")
router.register(r"settlements", SettlementViewSet, basename="settlement")
router.register(r"users", UserViewSet, basename="users")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", CurrentUserView.as_view(), name="current_user"),
    path("", include(router.urls)),
]
