from django.contrib import admin
from .models import UserProfile, Customer, Service, Order, OrderItem, Payment, StatusHistory, AuditLog

admin.site.register(UserProfile)
admin.site.register(Customer)
admin.site.register(Service)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)
admin.site.register(StatusHistory)
admin.site.register(AuditLog)