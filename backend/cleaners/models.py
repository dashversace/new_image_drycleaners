import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('Admin', 'Admin'),
        ('Manager', 'Manager'),
        ('Receptionist', 'Receptionist'),
        ('Cleaning Staff', 'Cleaning Staff'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='Receptionist')
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

class Customer(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50, unique=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.phone}"

class Service(models.Model):
    name = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2) # Default/Base price
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} (${self.price})"

class Order(models.Model):
    STATUS_CHOICES = (
        ('RECEIVED', 'Received'),
        ('PROCESSING', 'Processing'),
        ('CLEANING', 'Cleaning'),
        ('PRESSING', 'Pressing'),
        ('QUALITY CHECK', 'Quality Check'),
        ('READY', 'Ready'),
        ('COLLECTED', 'Collected'),
    )

    order_number = models.CharField(max_length=50, unique=True, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='received_orders')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='RECEIVED')
    special_instructions = models.TextField(blank=True, null=True)
    collection_date = models.DateField()
    
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    balance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_fully_paid = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            date_str = timezone.now().strftime('%Y%m%d')
            unique_suffix = str(uuid.uuid4())[:4].upper()
            self.order_number = f"NIDC-{date_str}-{unique_suffix}"
        
        self.balance_amount = self.total_amount - self.paid_amount
        self.is_fully_paid = self.balance_amount <= 0
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_number} - {self.customer.name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    service = models.ForeignKey(Service, on_delete=models.PROTECT)
    service_name_snapshot = models.CharField(max_length=100)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2) # Supports custom/flexible pricing
    quantity = models.PositiveIntegerField(default=1)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        if not self.service_name_snapshot:
            self.service_name_snapshot = self.service.name
        if self.unit_price is None or self.unit_price == 0:
            self.unit_price = self.service.price
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity}x {self.service_name_snapshot} for {self.order.order_number}"

class Payment(models.Model):
    PAYMENT_METHODS = (
        ('Cash', 'Cash'),
        ('EcoCash', 'EcoCash'),
        ('Bank Transfer', 'Bank Transfer'),
        ('Other', 'Other'),
    )
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHODS, default='Cash')
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"${self.amount} via {self.payment_method} for {self.order.order_number}"

class StatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=30)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.order.order_number} -> {self.status} at {self.timestamp}"

class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    details = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        username = self.user.username if self.user else "System"
        return f"[{self.timestamp}] {username}: {self.action}"