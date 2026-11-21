const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  senderId: { type: DataTypes.INTEGER, allowNull: false },
  receiverId: { type: DataTypes.INTEGER, allowNull: false },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 5000],
      notBlank(value) {
        if (!value.trim()) throw new Error('Message cannot be blank');
      }
    }
  },
  listingId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, {
  tableName: 'messages',
  timestamps: true,
  validate: {
    differentParticipants() {
      if (Number(this.senderId) === Number(this.receiverId)) {
        throw new Error('You cannot message yourself');
      }
    }
  },
  indexes: [
    { fields: ['senderId', 'receiverId', 'id'], name: 'messages_sender_receiver_id' },
    { fields: ['receiverId', 'isRead', 'id'], name: 'messages_receiver_read_id' },
    { fields: ['listingId'], name: 'messages_listing_id' }
  ]
});

module.exports = Message;
