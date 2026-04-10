/**
 * Database migration script.
 * Run once: node db/migrate.js
 * Drops and recreates all tables (destructive).
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const mysql = require('mysql2/promise');

async function migrate() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  const sql = `
    DROP TABLE IF EXISTS group_meeting_responses;
    DROP TABLE IF EXISTS group_meeting_invitees;
    DROP TABLE IF EXISTS group_meetings;
    DROP TABLE IF EXISTS bookings;
    DROP TABLE IF EXISTS slots;
    DROP TABLE IF EXISTS meeting_requests;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(255) NOT NULL,
      is_owner BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      -- is_owner is TRUE for @mcgill.ca, FALSE for @mail.mcgill.ca
      INDEX idx_email (email)
    );

    -- Slots created by owners (Type 3 recurring office hours, or ad-hoc)
    CREATE TABLE slots (
      id INT AUTO_INCREMENT PRIMARY KEY,
      owner_id INT NOT NULL,
      title VARCHAR(255) NOT NULL DEFAULT '',
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT FALSE,
      recurrence_weeks INT NOT NULL DEFAULT 0,  -- 0 = one-time
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_owner_active (owner_id, is_active),
      INDEX idx_start (start_time)
    );

    -- A user books a slot
    CREATE TABLE bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slot_id INT NOT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY uq_slot_user (slot_id, user_id)
    );

    -- Type 1: user requests a meeting with an owner
    CREATE TABLE meeting_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      requester_id INT NOT NULL,
      owner_id INT NOT NULL,
      message TEXT,
      status ENUM('pending', 'accepted', 'declined') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_owner_status (owner_id, status)
    );

    -- Type 2: group meetings (calendar method)
    CREATE TABLE group_meetings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      owner_id INT NOT NULL,
      title VARCHAR(255) NOT NULL DEFAULT '',
      method ENUM('calendar', 'heatmap') NOT NULL DEFAULT 'calendar',
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_finalized BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE group_meeting_invitees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      group_meeting_id INT NOT NULL,
      user_id INT NOT NULL,

      FOREIGN KEY (group_meeting_id) REFERENCES group_meetings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY uq_meeting_user (group_meeting_id, user_id)
    );

    -- Availability responses from invitees (time slot selections)
    CREATE TABLE group_meeting_responses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      group_meeting_id INT NOT NULL,
      user_id INT NOT NULL,
      slot_start DATETIME NOT NULL,
      slot_end DATETIME NOT NULL,

      FOREIGN KEY (group_meeting_id) REFERENCES group_meetings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_meeting_slot (group_meeting_id, slot_start)
    );
  `;

  await db.query(sql);
  console.log('Migration complete — all tables created.');
  await db.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
