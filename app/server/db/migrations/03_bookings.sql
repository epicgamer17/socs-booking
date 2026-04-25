CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slotID INT NOT NULL,  -- temporarily removed UNIQUE, for the group meetings to work by demo time
  userID INT NOT NULL,
  groupMeetingID INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (slotID) REFERENCES slots(id),
  FOREIGN KEY (userID) REFERENCES users(id)
);
