const path = require('path');
const { unlink } = require('fs/promises');

const listingImagesDirectory = path.resolve(__dirname, '../../uploads/listings');
const listingImagesPrefix = '/uploads/listings/';
const maxListingImages = 10;

const removeListingImages = async (images = []) => {
  await Promise.all(images.map(async (image) => {
    if (typeof image !== 'string' || !image.startsWith(listingImagesPrefix)) return;
    const filename = image.slice(listingImagesPrefix.length);
    if (!filename || path.basename(filename) !== filename) return;

    try {
      await unlink(path.join(listingImagesDirectory, filename));
    } catch (error) {
      if (error.code !== 'ENOENT') console.error('Failed to remove listing image:', error.message);
    }
  }));
};

module.exports = { listingImagesDirectory, listingImagesPrefix, maxListingImages, removeListingImages };
