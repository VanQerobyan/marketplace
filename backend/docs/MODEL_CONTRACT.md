# Model contract

You are responsible for writing the Sequelize models and associations.
The backend logic expects the following model names and fields.

## User
Required fields:
- id
- firstName
- lastName
- username (unique)
- email (unique)
- password
- createdAt
- updatedAt

## Listing
Required fields:
- id
- userId
- title
- description
- price
- category (nullable is fine)
- images (array of local image paths; defaults to an empty array)
- status: active | reserved | sold
- viewsCount (default 0)
- createdAt
- updatedAt

## Favorite
Required fields:
- id
- userId
- listingId
- createdAt
- updatedAt

Recommended database constraint:
- unique(userId, listingId)

## Rating
Required fields:
- id
- raterId
- ratedUserId
- rating (1..5)
- comment (nullable)
- createdAt
- updatedAt

Recommended database constraint:
- unique(raterId, ratedUserId)

## Notification
Required fields:
- id
- userId (recipient)
- actorId (nullable; user who triggered the notification)
- type
- message
- isRead (default false)
- listingId (nullable)
- createdAt
- updatedAt

## Message
Required fields:
- id
- senderId (authenticated sender; required User reference, cascades on delete)
- receiverId (required User reference, cascades on delete)
- content (nonblank text, 1–5000 characters)
- listingId (nullable Listing reference, set null on delete)
- isRead (default false)
- createdAt
- updatedAt

Sender and receiver must differ. Indexes cover `(senderId, receiverId, id)`,
`(receiverId, isRead, id)`, and `listingId`.

## Suggested associations
- User.hasMany(Listing, { foreignKey: 'userId' })
- Listing.belongsTo(User, { foreignKey: 'userId' })
- User.belongsToMany(Listing, { through: Favorite, ... })
- Favorite.belongsTo(User, { foreignKey: 'userId' })
- Favorite.belongsTo(Listing, { foreignKey: 'listingId' })
- Rating.belongsTo(User, { foreignKey: 'raterId', as: 'rater' })
- Rating.belongsTo(User, { foreignKey: 'ratedUserId', as: 'ratedUser' })
- Notification.belongsTo(User, { foreignKey: 'userId' })
- Notification.belongsTo(User, { foreignKey: 'actorId', as: 'actor', onDelete: 'SET NULL' })
- Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender', onDelete: 'CASCADE' })
- Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver', onDelete: 'CASCADE' })
- Message.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing', onDelete: 'SET NULL' })
