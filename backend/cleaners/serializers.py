from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Customer, Service, Order, OrderItem, Payment, StatusHistory, AuditLog

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone']

class UserManagementSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role')
    phone = serializers.CharField(source='profile.phone', required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'role', 'phone']

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', 'Password123!')
        user = User.objects.create_user(**validated_data, password=password)
        UserProfile.objects.update_or_create(user=user, defaults=profile_data)
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if profile_data:
            UserProfile.objects.update_or_create(user=instance, defaults=profile_data)
        return instance

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service_name_snapshot', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'service', 'service_name', 'unit_price', 'quantity', 'subtotal']

class PaymentSerializer(serializers.ModelSerializer):
    received_by_name = serializers.CharField(source='received_by.username', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'payment_method', 'reference_number', 'received_by', 'received_by_name', 'created_at']
        read_only_fields = ['received_by']

class StatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model = StatusHistory
        fields = ['id', 'status', 'changed_by_name', 'timestamp']

class OrderSerializer(serializers.ModelSerializer):
    customer_details = CustomerSerializer(source='customer', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    status_history = StatusHistorySerializer(many=True, read_only=True)
    received_by_name = serializers.CharField(source='received_by.username', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'customer_details', 'received_by', 
            'received_by_name', 'status', 'special_instructions', 'collection_date',
            'total_amount', 'paid_amount', 'balance_amount', 'is_fully_paid',
            'created_at', 'updated_at', 'items', 'payments', 'status_history'
        ]
        read_only_fields = ['order_number', 'total_amount', 'paid_amount', 'balance_amount', 'is_fully_paid', 'received_by']

class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'