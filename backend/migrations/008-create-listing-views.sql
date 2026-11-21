CREATE TABLE IF NOT EXISTS listing_views (
  id SERIAL PRIMARY KEY,
  "listingId" INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "viewerId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS listing_views_listing_viewer_unique
  ON listing_views ("listingId", "viewerId");

CREATE INDEX IF NOT EXISTS listing_views_viewer_id ON listing_views ("viewerId");
