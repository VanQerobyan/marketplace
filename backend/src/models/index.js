const User = require('./User');
const Listing = require('./Listing');
const ListingView = require('./ListingView');
const Favorite = require('./Favorite');
const Rating = require('./Rating');
const ListingRating = require('./ListingRating');
const Notification = require('./Notification');
const Message = require('./Message');
const Order = require('./Order');

/* =========================================================
   USER ↔ LISTING
   One user can create many listings.
   ========================================================= */
User.hasMany(Listing, {
  foreignKey: 'userId',
  as: 'listings',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Listing.belongsTo(User, {
  foreignKey: 'userId',
  as: 'owner',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Listing.hasMany(ListingView, { foreignKey: 'listingId', as: 'views', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ListingView.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
User.hasMany(ListingView, { foreignKey: 'viewerId', as: 'listingViews', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ListingView.belongsTo(User, { foreignKey: 'viewerId', as: 'viewer', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

/* =========================================================
   FAVORITES
   Favorite is the join table between User and Listing.
   ========================================================= */
User.hasMany(Favorite, {
  foreignKey: 'userId',
  as: 'favoriteRecords',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Favorite.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Listing.hasMany(Favorite, {
  foreignKey: 'listingId',
  as: 'favoriteRecords',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Favorite.belongsTo(Listing, {
  foreignKey: 'listingId',
  as: 'listing',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

User.belongsToMany(Listing, {
  through: Favorite,
  foreignKey: 'userId',
  otherKey: 'listingId',
  as: 'favoriteListings'
});

Listing.belongsToMany(User, {
  through: Favorite,
  foreignKey: 'listingId',
  otherKey: 'userId',
  as: 'favoritedByUsers'
});

/* =========================================================
   RATINGS
   A rating has one author (rater) and one target user.
   ========================================================= */
User.hasMany(Rating, {
  foreignKey: 'raterId',
  as: 'ratingsGiven',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Rating.belongsTo(User, {
  foreignKey: 'raterId',
  as: 'rater',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

User.hasMany(Rating, {
  foreignKey: 'ratedUserId',
  as: 'ratingsReceived',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Rating.belongsTo(User, {
  foreignKey: 'ratedUserId',
  as: 'ratedUser',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

/* =========================================================
   LISTING RATINGS
   ========================================================= */
User.hasMany(ListingRating, {
  foreignKey: 'raterId',
  as: 'listingRatingsGiven',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

ListingRating.belongsTo(User, {
  foreignKey: 'raterId',
  as: 'rater',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Listing.hasMany(ListingRating, {
  foreignKey: 'listingId',
  as: 'ratings',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

ListingRating.belongsTo(Listing, {
  foreignKey: 'listingId',
  as: 'listing',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

/* =========================================================
   NOTIFICATIONS
   ========================================================= */
User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

User.hasMany(Notification, {
  foreignKey: 'actorId',
  as: 'triggeredNotifications',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Notification.belongsTo(User, {
  foreignKey: 'actorId',
  as: 'actor',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Listing.hasMany(Notification, {
  foreignKey: 'listingId',
  as: 'notifications',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Notification.belongsTo(Listing, {
  foreignKey: 'listingId',
  as: 'listing',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

for (const [foreignKey, alias, userAlias] of [
  ['senderId', 'sender', 'sentMessages'],
  ['receiverId', 'receiver', 'receivedMessages']
]) {
  User.hasMany(Message, { foreignKey, as: userAlias, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  Message.belongsTo(User, { foreignKey, as: alias, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
}
Listing.hasMany(Message, { foreignKey: 'listingId', as: 'messages', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Message.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

User.hasMany(Order, { foreignKey: 'buyerId', as: 'purchases', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Listing.hasMany(Order, { foreignKey: 'listingId', as: 'orders', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Order.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

module.exports = {
  User,
  Listing,
  ListingView,
  Favorite,
  Rating,
  ListingRating,
  Notification,
  Message,
  Order
};
