/*
For the bookings table, can you make sure it has:

id (primary key)
slotID (foreign key → slots.id)
userID (who booked the slot)
optional: dateBooked

I’m using:
bookings.slotID to join with slots.id
bookings.userID to join with users.id (to get the email)
So slotID and userID need to match exactly.
Also, I think each slot should only have one booking, so we might want UNIQUE(slotID)  


*/