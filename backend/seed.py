import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from cleaners.models import UserProfile, Service, Customer

# Create admin user
if not User.objects.filter(username='admin').exists():
    admin_user = User.objects.create_superuser('admin', 'admin@newimage.co.zw', 'Password123!')
    UserProfile.objects.update_or_create(user=admin_user, defaults={'role': 'Admin', 'phone': '+263772000000'})
    print("Superuser created: admin / Password123!")

# Create initial services & prices
initial_services = [
    {'name': 'Suit', 'price': 6.00, 'description': 'Full suit dry cleaning (jacket and trouser)'},
    {'name': 'Blazer', 'price': 3.00, 'description': 'Single blazer/jacket'},
    {'name': 'Trouser', 'price': 3.00, 'description': 'Single pair of trousers/slacks'},
    {'name': 'Sheets', 'price': 4.00, 'description': 'Bed sheets cleaning'},
    {'name': 'Blankets', 'price': 8.00, 'description': 'Heavy winter blankets'},
]

for s in initial_services:
    Service.objects.get_or_create(name=s['name'], defaults={'price': s['price'], 'description': s['description']})

print("Initial services seeded successfully.")

# Create sample customer
Customer.objects.get_or_create(phone='+263771234567', defaults={'name': 'Tendai Mutasa', 'email': 'tendai@gmail.com', 'address': 'Mutare CBD'})
print("Sample customer seeded.")