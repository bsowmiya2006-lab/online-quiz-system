from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import re
import json
import os
import base64
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

db_config = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', ''),
    'database': os.environ.get('DB_NAME', 'online_quiz_system'),
    'port': int(os.environ.get('DB_PORT', 3306))
}

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def get_db_connection():
    return mysql.connector.connect(**db_config)

def init_db():
    """Initialize all required database tables."""
    try:
        # Connect without DB first to create it
        conn_init_cfg = {k: v for k, v in db_config.items() if k != 'database'}
        conn = mysql.connector.connect(**conn_init_cfg)
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_config['database']}")
        cursor.close()
        conn.close()

        conn = get_db_connection()
        cursor = conn.cursor()

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

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_photos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                photo_type VARCHAR(50) NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS feedbacks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                rating INT NOT NULL DEFAULT 0,
                feedback_text TEXT,
                date VARCHAR(100),
                time VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

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

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS certificate_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                settings_json TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS advertisements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                video_path VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()
        cursor.close()
        conn.close()
        print("DB: Database initialized successfully.")
    except Exception as e:
        print(f"DB init error: {e}")


# ── Serve uploaded files ───────────────────────────────────────────────────
@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# ── LOGIN ──────────────────────────────────────────────────────────────────
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400

    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({"status": "error", "message": "Username and Password are required."}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True, buffered=True)
        cursor.execute("SELECT * FROM quiz_users WHERE username = %s", (username,))
        result = cursor.fetchone()

        if result:
            db_password = result.get('password', '')
            is_valid = False
            if db_password.startswith('pbkdf2:sha256:') or db_password.startswith('scrypt:'):
                is_valid = check_password_hash(db_password, password)
            else:
                is_valid = (db_password == password)

            if is_valid:
                now = datetime.now()
                cursor.execute(
                    "INSERT INTO login_history (username, email, login_date, login_time) VALUES (%s, %s, %s, %s)",
                    (username, result.get('email', ''), now.strftime("%Y-%m-%d"), now.strftime("%H:%M:%S"))
                )
                conn.commit()

                verification_completed = check_verification_done_db(username, conn)
                cursor.close()
                conn.close()
                return jsonify({
                    "status": "success",
                    "message": "Login successful",
                    "user": {
                        "username": result.get('username'),
                        "college_name": result.get('college_name'),
                        "email": result.get('email', ''),
                        "verification_completed": verification_completed
                    }
                })

        cursor.close()
        conn.close()
        return jsonify({"status": "error", "message": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


def check_verification_done_db(username, conn=None):
    close_conn = False
    try:
        if conn is None:
            conn = get_db_connection()
            close_conn = True
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT photo_type FROM user_photos WHERE username = %s", (username,))
        rows = cursor.fetchall()
        cursor.close()
        types = [r['photo_type'] for r in rows]
        return 'face' in types and 'id' in types
    except:
        return False
    finally:
        if close_conn and conn:
            try: conn.close()
            except: pass


# ── REGISTER ────────────────────────────────────────────────────────────────
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400

    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''
    collegename = (data.get('college_name') or data.get('collegename') or '').strip()

    if not username or not password or not email or not collegename:
        return jsonify({"status": "error", "message": "All fields are required: Username, Email, Password, College Name."}), 400

    if len(password) < 8:
        return jsonify({"status": "error", "message": "Password must be at least 8 characters long ❌"}), 400
    if not re.search(r"[A-Z]", password):
        return jsonify({"status": "error", "message": "Password must contain at least one uppercase letter (A-Z) ❌"}), 400
    if not re.search(r"[a-z]", password):
        return jsonify({"status": "error", "message": "Password must contain at least one lowercase letter (a-z) ❌"}), 400
    if not re.search(r"[0-9]", password):
        return jsonify({"status": "error", "message": "Password must contain at least one number (0-9) ❌"}), 400
    if not re.search(r"[@$!%*?&#]", password):
        return jsonify({"status": "error", "message": "Password must contain at least one special character (@$!%*?&#) ❌"}), 400

    hashed_password = generate_password_hash(password)
    now = datetime.now()
    reg_date_str = now.strftime("%Y-%m-%d")
    reg_time_str = now.strftime("%H:%M:%S")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO quiz_users (username, email, password, college_name) VALUES (%s, %s, %s, %s)",
            (username, email, hashed_password, collegename)
        )
        cursor.execute(
            "INSERT INTO registration_history (username, email, college_name, reg_date, reg_time) VALUES (%s, %s, %s, %s, %s)",
            (username, email, collegename, reg_date_str, reg_time_str)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "message": "Registration successful!"}), 201
    except mysql.connector.Error as err:
        if err.errno == 1062:
            return jsonify({"status": "error", "message": "Username already exists. Please choose a different username."}), 400
        return jsonify({"status": "error", "message": f"Database error: {err}"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ── ADMIN: GET USERS ──────────────────────────────────────────────────────
@app.route('/admin/users', methods=['GET'])
def get_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, username, email, college_name, created_at FROM quiz_users ORDER BY id DESC")
        users = cursor.fetchall()
        for u in users:
            if u.get('created_at'):
                u['created_at'] = str(u['created_at'])
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "users": users}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ── ADMIN: REGISTRATION HISTORY ───────────────────────────────────────────
@app.route('/admin/registration-history', methods=['GET'])
def get_registration_history():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM registration_history ORDER BY id DESC")
        history = cursor.fetchall()
        for h in history:
            for k in ['created_at', 'reg_date', 'reg_time']:
                if h.get(k):
                    h[k] = str(h[k])
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "history": history}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ── ADMIN: LOGIN HISTORY ──────────────────────────────────────────────────
@app.route('/admin/login-history', methods=['GET'])
def get_login_history():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM login_history ORDER BY id DESC")
        history = cursor.fetchall()
        for h in history:
            for k in ['created_at', 'login_date', 'login_time']:
                if h.get(k):
                    h[k] = str(h[k])
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "history": history}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ── FEEDBACKS ──────────────────────────────────────────────────────────────
@app.route('/feedbacks', methods=['GET', 'POST'])
def handle_feedbacks():
    if request.method == 'POST':
        data = request.get_json() or {}
        username = data.get("username", "Unknown")
        rating = data.get("rating", 0)
        text = data.get("text", "")
        now = datetime.now()
        date_str = data.get("date", now.strftime("%Y-%m-%d"))
        time_str = data.get("time", now.strftime("%H:%M:%S"))

        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO feedbacks (username, rating, feedback_text, date, time) VALUES (%s, %s, %s, %s, %s)",
                (username, rating, text, date_str, time_str)
            )
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"status": "success"}), 201
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    elif request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM feedbacks ORDER BY id DESC")
            feedbacks = cursor.fetchall()
            for f in feedbacks:
                if f.get('created_at'):
                    f['created_at'] = str(f['created_at'])
            cursor.close()
            conn.close()
            return jsonify(feedbacks), 200
        except:
            return jsonify([]), 200


# ── PROCTORING LOGS ──────────────────────────────────────────────────────
@app.route('/proctoring/logs', methods=['GET', 'POST'])
def handle_proctoring_logs():
    logs_file = os.path.join(os.path.dirname(__file__), 'cheating_logs.json')
    if request.method == 'POST':
        data = request.get_json() or {}
        log_entry = {"username": data.get("username", "Unknown"), "message": data.get("message"), "time": data.get("time")}
        logs = []
        if os.path.exists(logs_file):
            with open(logs_file, 'r') as f:
                try: logs = json.load(f)
                except: pass
        logs.append(log_entry)
        with open(logs_file, 'w') as f:
            json.dump(logs, f)
        return jsonify({"status": "success"}), 201

    elif request.method == 'GET':
        if os.path.exists(logs_file):
            with open(logs_file, 'r') as f:
                try: return jsonify(json.load(f)), 200
                except: return jsonify([]), 200
        return jsonify([]), 200


# ── PHOTOS (face / id capture) ───────────────────────────────────────────
@app.route('/proctoring/images', methods=['GET', 'POST'])
def handle_proctoring_images():
    if request.method == 'POST':
        data = request.get_json() or {}
        username = data.get("username", "Unknown")
        photo_type = data.get("type")   # 'face' or 'id'
        image_data = data.get("image")  # base64 data URL

        if not image_data:
            return jsonify({"status": "error", "message": "No image data provided"}), 400

        try:
            # Decode base64
            if "," in image_data:
                header, base64_str = image_data.split(",", 1)
            else:
                base64_str = image_data

            img_bytes = base64.b64decode(base64_str)
            safe_username = re.sub(r'[^a-zA-Z0-9_-]', '_', username)
            filename = f"{safe_username}_{photo_type}_{int(datetime.now().timestamp())}.jpg"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

            with open(filepath, 'wb') as imgf:
                imgf.write(img_bytes)

            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO user_photos (username, photo_type, file_path) VALUES (%s, %s, %s)",
                (username, photo_type, filename)
            )
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"status": "success", "filename": filename}), 201
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    elif request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM user_photos ORDER BY id DESC")
            photos = cursor.fetchall()
            for p in photos:
                if p.get('created_at'):
                    p['created_at'] = str(p['created_at'])
                p['image_url'] = f"/uploads/{p['file_path']}"
                p['type'] = p.get('photo_type', '')
            cursor.close()
            conn.close()
            return jsonify(photos), 200
        except Exception as e:
            return jsonify([]), 200


# ── QUIZ RESULTS ─────────────────────────────────────────────────────────
@app.route('/quiz-results', methods=['GET', 'POST'])
def handle_quiz_results():
    if request.method == 'POST':
        data = request.get_json() or {}
        username = data.get("username", "Unknown")
        course = data.get("course", "")
        level = data.get("level", "")
        score = data.get("score", 0)
        total = data.get("total", 25)
        percentage = data.get("percentage", 0)
        date = data.get("date", str(datetime.now()))

        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO quiz_history (username, course, level, score, total, percentage, date) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (username, course, level, score, total, percentage, date)
            )
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"status": "success"}), 201
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    elif request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM quiz_history ORDER BY id DESC")
            results = cursor.fetchall()
            for r in results:
                if r.get('created_at'):
                    r['created_at'] = str(r['created_at'])
                if r.get('percentage'):
                    r['percentage'] = float(r['percentage'])
            cursor.close()
            conn.close()
            return jsonify(results), 200
        except:
            return jsonify([]), 200


# ── CERTIFICATE SETTINGS ──────────────────────────────────────────────────
@app.route('/certificate-settings', methods=['GET', 'POST'])
def handle_certificate_settings():
    if request.method == 'POST':
        data = request.get_json() or {}
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("TRUNCATE TABLE certificate_settings")
            cursor.execute("INSERT INTO certificate_settings (settings_json) VALUES (%s)", (json.dumps(data),))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"status": "success"}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    elif request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT settings_json FROM certificate_settings ORDER BY id DESC LIMIT 1")
            row = cursor.fetchone()
            cursor.close()
            conn.close()
            if row and row['settings_json']:
                return jsonify(json.loads(row['settings_json'])), 200
            return jsonify({}), 200
        except:
            return jsonify({}), 200


# ── ADVERTISEMENTS ────────────────────────────────────────────────────────
@app.route('/advertisement', methods=['GET', 'POST', 'DELETE'])
def handle_advertisement():
    if request.method == 'POST':
        if 'video' not in request.files:
            return jsonify({"status": "error", "message": "No video file uploaded"}), 400
        file = request.files['video']
        if file.filename == '':
            return jsonify({"status": "error", "message": "No file selected"}), 400

        filename = secure_filename(f"ad_{int(datetime.now().timestamp())}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            # Remove old ad files
            cursor.execute("SELECT video_path FROM advertisements")
            old_ads = cursor.fetchall()
            for (old_path,) in old_ads:
                old_file = os.path.join(app.config['UPLOAD_FOLDER'], old_path)
                if os.path.exists(old_file):
                    try: os.remove(old_file)
                    except: pass
            cursor.execute("TRUNCATE TABLE advertisements")
            cursor.execute("INSERT INTO advertisements (video_path) VALUES (%s)", (filename,))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"status": "success", "video_url": f"/uploads/{filename}"}), 201
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    elif request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT video_path FROM advertisements ORDER BY id DESC LIMIT 1")
            row = cursor.fetchone()
            cursor.close()
            conn.close()
            if row:
                return jsonify({"status": "success", "video_url": f"/uploads/{row['video_path']}"}), 200
            return jsonify({"status": "success", "video_url": None}), 200
        except:
            return jsonify({"status": "success", "video_url": None}), 200

    elif request.method == 'DELETE':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT video_path FROM advertisements")
            old_ads = cursor.fetchall()
            for (old_path,) in old_ads:
                old_file = os.path.join(app.config['UPLOAD_FOLDER'], old_path)
                if os.path.exists(old_file):
                    try: os.remove(old_file)
                    except: pass
            cursor.execute("TRUNCATE TABLE advertisements")
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"status": "success"}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500


# ── LEGACY SEED (kept for compatibility) ──────────────────────────────────
@app.route('/admin/seed-demo', methods=['POST'])
def seed_demo_data():
    return jsonify({"status": "success", "message": "Demo seed disabled. Use real student registrations.", "added": 0}), 200


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=3001, debug=True)