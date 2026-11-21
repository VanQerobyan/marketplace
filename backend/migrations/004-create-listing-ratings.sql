CREATE TABLE IF NOT EXISTS listing_ratings (
  id SERIAL PRIMARY KEY,
  "raterId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "listingId" INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE ON UPDATE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT CHECK (char_length(comment) <= 1000),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS listing_ratings_rater_listing_unique
  ON listing_ratings ("raterId", "listingId");

CREATE INDEX IF NOT EXISTS listing_ratings_listing_id
  ON listing_ratings ("listingId");
