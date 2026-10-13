import os
os.chdir('C:\\Users\\yeab\\Documents\\Claude\\real-time-sketchpad-evaluation\\backend')
import sqlite3
conn = sqlite3.connect('sketchpad.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print('Tables:', tables)
conn.close()