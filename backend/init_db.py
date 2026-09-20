import os
import mysql.connector

db_config = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', ''),
    'database': os.environ.get('DB_NAME', 'online_quiz_system'),
    'port': int(os.environ.get('DB_PORT', 3306))
}

def init_db():
    try:
        # First connect without database to create it if it doesn't exist
        conn_init_cfg = {k: v for k, v in db_config.items() if k != 'database'}
        conn = mysql.connector.connect(**conn_init_cfg)
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_config['database']}")
        cursor.close()
        conn.close()

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Users
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS quiz_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                college_name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Registration History
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS registration_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                college_name VARCHAR(255) NOT NULL,
                reg_date DATE NOT NULL,
                reg_time TIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Login History
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS login_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                login_date DATE NOT NULL,
                login_time TIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Photos
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_photos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                photo_type VARCHAR(50) NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Feedbacks
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS feedbacks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                rating INT NOT NULL,
                feedback_text TEXT,
                date VARCHAR(50),
                time VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Quiz History
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS quiz_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                course VARCHAR(255),
                level VARCHAR(50),
                score INT,
                total INT,
                percentage DECIMAL(5,2),
                date VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Certificate Settings
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS certificate_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                settings_json TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        
        # Advertisement
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS advertisements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                video_path VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()
        print("Database and tables initialized successfully.")
    except Exception as e:
        print(f"Error initializing DB: {e}")
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

if __name__ == '__main__':
    init_db()
