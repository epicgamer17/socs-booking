-- Sophia Hussain
CREATE TABLE IF NOT EXISTS meetingRequests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  ownerID INT NOT NULL,
  date DATE NOT NULL,
  timeFrom TIME NOT NULL,
  timeTo TIME NOT NULL,
  message VARCHAR(255),
  status ENUM('pending', 'accepted', 'declined') NOT NULL DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES users(id),
  FOREIGN KEY (ownerID) REFERENCES users(id)
);