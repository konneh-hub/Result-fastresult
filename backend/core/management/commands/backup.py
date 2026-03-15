import os
import shutil
import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
from core.models import SystemBackup

class Command(BaseCommand):
    help = 'Create a backup of the database'

    def handle(self, *args, **options):
        db_path = settings.DATABASES['default']['NAME']
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        os.makedirs(backup_dir, exist_ok=True)
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = f'backup_{timestamp}.db'
        backup_path = os.path.join(backup_dir, backup_file)
        shutil.copy2(db_path, backup_path)
        # Create record
        SystemBackup.objects.create(backup_file=backup_file, status='completed')
        self.stdout.write(self.style.SUCCESS(f'Backup created: {backup_path}'))