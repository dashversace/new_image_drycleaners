from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    UserProfileView, UserViewSet, CustomerViewSet, ServiceViewSet,
    OrderViewSet, PaymentViewSet, DashboardStatsView, ReportView, AuditLogViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'audit-logs', AuditLogViewSet)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('reports/', ReportView.as_view(), name='reports'),
    path('', include(router.urls)),
]