const { AddActivityPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ActivitiesValidator = {
  validateAddActivityPayload: (payload) => {
    const validationResult = AddActivityPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ActivitiesValidator;
