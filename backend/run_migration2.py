from alembic.config import Config
from alembic import command
import os
os.chdir('C:\\Users\\yeab\\Documents\\Claude\\real-time-sketchpad-evaluation\\backend')
config = Config()
config.set_main_option('script_location', 'alembic')
config.set_main_option('sqlalchemy.url', 'sqlite:////c/Users/yeab/Documents/Claude/real-time-sketchpad-evaluation/backend/sketchpad.db')
try:
    command.upgrade(config, 'head')
    print('Migration succeeded')
except Exception as e:
    print('Migration failed:', e)
    import traceback
    traceback.print_exc()