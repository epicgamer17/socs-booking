-- Sophia Hussain, Thomas Nguyen
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slotID INT NOT NULL,  
  userID INT NOT NULL,
  groupMeetingID INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (slotID) REFERENCES slots(id),
  FOREIGN KEY (userID) REFERENCES users(id),
  UNIQUE(slotID, userID)
);
