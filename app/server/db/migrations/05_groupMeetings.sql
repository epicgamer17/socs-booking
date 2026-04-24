# recurrence is to be handled manually, in the controller
CREATE TABLE IF NOT EXISTS groupMeetings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ownerID INT NOT NULL,
  bookingID INT,  # will be set after creation of shared booking
  status ENUM('selection-over', 'in-selection-phase') NOT NULL DEFAULT 'in-selection-phase',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerID) REFERENCES users(id),
  FOREIGN KEY (bookingID) REFERENCES bookings(id) ON DELETE SET NULL
);

# to join for figuring out whether a user was invited for voting
CREATE TABLE IF NOT EXISTS userInvitations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  groupMeetingID INT NOT NULL,
  FOREIGN KEY (userID) REFERENCES users(id),
  FOREIGN KEY (groupMeetingID) REFERENCES groupMeetings(id) ON DELETE CASCADE,
  UNIQUE(userID, groupMeetingID)
);

# voting count has to be computed in the controller
CREATE TABLE IF NOT EXISTS timeWindows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  timeFrom TIME NOT NULL,
  timeTo TIME NOT NULL,
  groupMeetingID INT NOT NULL,
  FOREIGN KEY (groupMeetingID) REFERENCES groupMeetings(id) ON DELETE CASCADE
);

# associates user to time window
# necessary for eventual creation of shared booking
CREATE TABLE IF NOT EXISTS userVotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  timeWindowID INT NOT NULL,
  FOREIGN KEY (userID) REFERENCES users(id),
  FOREIGN KEY (timeWindowID) REFERENCES timeWindows(id) ON DELETE CASCADE,
  UNIQUE(userID, timeWindowID)
);
