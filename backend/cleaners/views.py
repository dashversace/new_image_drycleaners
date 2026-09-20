from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count, Q
from .models import UserProfile, Customer, Service, Order, OrderItem, Payment, StatusHistory, AuditLog
from .serializers import (
    UserProfileSerializer, UserManagementSerializer, CustomerSerializer,
    ServiceSerializer, OrderSerializer, PaymentSerializer, AuditLogSerializer
)

def log_audit(user, action, details, request):
    ip = request.META.get('REMOTE_ADDR') if request else None
    AuditLog.objects.create(user=user if user and user.is_authenticated else None, action=action, details=details, ip_address=ip)

class IsAdminOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role in ['Admin', 'Manager']

class UserProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserManagementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = serializer.save()
        log_audit(self.request.user, "CREATE_USER", f"Created user {user.username}", self.request)

    def perform_update(self, serializer):
        user = serializer.save()
        log_audit(self.request.user, "UPDATE_USER", f"Updated user {user.username}", self.request)

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        phone = request.data.get('phone')
        name = request.data.get('name')
        if phone:
            customer, created = Customer.objects.get_or_create(
                phone=phone,
                defaults={
                    'name': name or 'Valued Customer',
                    'email': request.data.get('email', ''),
                    'address': request.data.get('address', '')
                }
            )
            if not created and name:
                customer.name = name
                customer.email = request.data.get('email', customer.email)
                customer.address = request.data.get('address', customer.address)
                customer.save()
            serializer = self.get_serializer(customer)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        cust = serializer.save()
        log_audit(self.request.user, "CREATE_CUSTOMER", f"Created customer {cust.name}", self.request)

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by('name')
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        name = request.data.get('name')
        price = request.data.get('price')
        description = request.data.get('description', '')
        
        if not name or price is None:
            return Response({"error": "Name and price are required."}, status=status.HTTP_400_BAD_REQUEST)

        service = Service.objects.filter(name__iexact=name.strip()).first()
        if service:
            service.price = float(price)
            service.description = description
            service.is_active = True
            service.save()
            serializer = self.get_serializer(service)
            log_audit(request.user, "UPDATE_SERVICE", f"Updated service {service.name} price to ${service.price}", request)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            service = Service.objects.create(name=name.strip(), price=float(price), description=description, is_active=True)
            serializer = self.get_serializer(service)
            log_audit(request.user, "CREATE_SERVICE", f"Created service {service.name} at ${service.price}", request)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Order.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search')
        status_filter = self.request.query_params.get('status')
        uncollected = self.request.query_params.get('uncollected')

        if search:
            qs = qs.filter(
                Q(order_number__icontains=search) |
                Q(customer__name__icontains=search) |
                Q(customer__phone__icontains=search)
            )
        if status_filter:
            qs = qs.filter(status=status_filter)
        if uncollected == 'true':
            ninety_days_ago = timezone.now().date() - timedelta(days=90)
            qs = qs.filter(status__in=['READY', 'PROCESSING', 'CLEANING', 'PRESSING', 'QUALITY CHECK', 'RECEIVED'], created_at__date__lte=ninety_days_ago)
        return qs

    def create(self, request, *args, **kwargs):
        data = request.data
        customer_id = data.get('customer')
        items_data = data.get('items', [])
        special_instructions = data.get('special_instructions', '')
        collection_date = data.get('collection_date')

        if not customer_id or not items_data or not collection_date:
            return Response({"error": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            customer = Customer.objects.get(pk=customer_id)
        except Customer.DoesNotExist:
            return Response({"error": "Customer not found."}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(
            customer=customer,
            received_by=request.user,
            special_instructions=special_instructions,
            collection_date=collection_date,
            status='RECEIVED'
        )

        total = 0
        for item in items_data:
            service_id = item.get('service')
            quantity = int(item.get('quantity', 1))
            custom_price = item.get('unit_price')
            
            try:
                service = Service.objects.get(pk=service_id)
            except Service.DoesNotExist:
                continue
            
            unit_price = float(custom_price) if custom_price is not None and custom_price != '' else float(service.price)

            order_item = OrderItem.objects.create(
                order=order,
                service=service,
                unit_price=unit_price,
                quantity=quantity
            )
            total += order_item.subtotal

        order.total_amount = total
        order.save()

        StatusHistory.objects.create(order=order, status='RECEIVED', changed_by=request.user)

        initial_payment = data.get('initial_payment')
        if initial_payment and float(initial_payment) > 0:
            pay_amount = float(initial_payment)
            Payment.objects.create(
                order=order,
                amount=pay_amount,
                payment_method=data.get('payment_method', 'Cash'),
                reference_number=data.get('reference_number', ''),
                received_by=request.user
            )
            order.paid_amount += pay_amount
            order.save()

        log_audit(request.user, "CREATE_ORDER", f"Created order {order.order_number} for {customer.name}", request)
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        new_status = request.data.get('status')

        if new_status and new_status != instance.status:
            instance.status = new_status
            StatusHistory.objects.create(order=instance, status=new_status, changed_by=request.user)
            log_audit(request.user, "UPDATE_ORDER_STATUS", f"Updated order {instance.order_number} status to {new_status}", request)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_destroy(self, instance):
        log_audit(self.request.user, "DELETE_ORDER", f"Deleted order {instance.order_number}", self.request)
        instance.delete()

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-created_at')
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        payment = serializer.save(received_by=self.request.user)
        order = payment.order
        order.paid_amount += payment.amount
        order.save()
        log_audit(self.request.user, "RECORD_PAYMENT", f"Recorded payment of ${payment.amount} for order {order.order_number}", self.request)

class DashboardStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_orders = Order.objects.count()
        today = timezone.now().date()
        todays_orders = Order.objects.filter(created_at__date=today).count()
        
        sales_agg = Payment.objects.aggregate(total=Sum('amount'))
        total_sales = sales_agg['total'] or 0

        todays_sales_agg = Payment.objects.filter(created_at__date=today).aggregate(total=Sum('amount'))
        todays_sales = todays_sales_agg['total'] or 0

        balances_agg = Order.objects.aggregate(total=Sum('balance_amount'))
        total_outstanding = balances_agg['total'] or 0

        status_counts = Order.objects.values('status').annotate(count=Count('id'))
        
        ninety_days_ago = today - timedelta(days=90)
        uncollected_count = Order.objects.filter(
            status__in=['READY', 'PROCESSING', 'CLEANING', 'PRESSING', 'QUALITY CHECK', 'RECEIVED'],
            created_at__date__lte=ninety_days_ago
        ).count()

        return Response({
            'total_orders': total_orders,
            'todays_orders': todays_orders,
            'total_sales': total_sales,
            'todays_sales': todays_sales,
            'total_outstanding': total_outstanding,
            'status_counts': list(status_counts),
            'uncollected_count': uncollected_count,
        })

class ReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        orders_qs = Order.objects.all().order_by('-created_at')
        payments_qs = Payment.objects.all().order_by('-created_at')

        if start_date and end_date:
            orders_qs = orders_qs.filter(created_at__date__range=[start_date, end_date])
            payments_qs = payments_qs.filter(created_at__date__range=[start_date, end_date])

        total_sales = payments_qs.aggregate(total=Sum('amount'))['total'] or 0
        total_orders_count = orders_qs.count()
        total_balance = orders_qs.aggregate(total=Sum('balance_amount'))['total'] or 0

        return Response({
            'total_sales': total_sales,
            'total_orders_count': total_orders_count,
            'total_balance': total_balance,
            'orders': OrderSerializer(orders_qs, many=True).data,
            'payments': PaymentSerializer(payments_qs, many=True).data
        })

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]