from django.apps import AppConfig
from django.db.backends.signals import connection_created

def set_sqlite_wal(sender, connection, **kwargs):
    if connection.vendor == 'sqlite':
        cursor = connection.cursor()
        cursor.execute('PRAGMA journal_mode=WAL;')
        cursor.execute('PRAGMA synchronous=NORMAL;')

class CleanersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'cleaners'

    def ready(self):
        connection_created.connect(set_sqlite_wal)