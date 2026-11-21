const LISTING_STATUS = Object.freeze({
  ACTIVE: 'active',
  RESERVED: 'reserved',
  SOLD: 'sold'
});

const LISTING_STATUS_VALUES = Object.values(LISTING_STATUS);

module.exports = {
  LISTING_STATUS,
  LISTING_STATUS_VALUES
};
