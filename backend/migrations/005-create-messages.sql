CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  "senderId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "receiverId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000 AND content ~ '[^[:space:]]'),
  "listingId" INTEGER REFERENCES listings(id) ON DELETE SET NULL ON UPDATE CASCADE,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ("senderId" <> "receiverId")
);

CREATE INDEX IF NOT EXISTS messages_sender_receiver_id ON messages ("senderId", "receiverId", id);
CREATE INDEX IF NOT EXISTS messages_receiver_read_id ON messages ("receiverId", "isRead", id);
CREATE INDEX IF NOT EXISTS messages_listing_id ON messages ("listingId");
