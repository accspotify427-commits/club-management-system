import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('club.db');

export function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('owner', 'admin', 'user')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      price REAL NOT NULL,
      capacity INTEGER NOT NULL,
      booked INTEGER DEFAULT 0,
      image_url TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Bookings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      tickets INTEGER NOT NULL,
      total_price REAL NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (event_id) REFERENCES events(id)
    )
  `);

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Insert default users if not exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  
  if (userCount.count === 0) {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    
    const insertUser = db.prepare(`
      INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)
    `);

    insertUser.run('owner@club.com', hashedPassword, 'Club Owner', 'owner');
    insertUser.run('admin@club.com', hashedPassword, 'Club Admin', 'admin');
    insertUser.run('user@club.com', hashedPassword, 'John Doe', 'user');

    console.log('✅ Default users created');
    console.log('📧 Owner: owner@club.com / password123');
    console.log('📧 Admin: admin@club.com / password123');
    console.log('📧 User: user@club.com / password123');
  }

  // Insert default settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get();
  if (settingsCount.count === 0) {
    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insertSetting.run('maintenance_mode', 'false');
    insertSetting.run('club_name', 'Elite Club');
    insertSetting.run('club_description', 'The most exclusive club in town');
  }

  console.log('✅ Database initialized');
}

export default db;
