const ApiError = require('./ApiError');

const requireModel = (modelName) => {
  const models = require('../models');
  const model = models[modelName];

  if (!model) {
    throw new ApiError(
      500,
      `${modelName} model is not implemented yet. Add it to src/models/index.js.`
    );
  }

  return model;
};

module.exports = requireModel;
