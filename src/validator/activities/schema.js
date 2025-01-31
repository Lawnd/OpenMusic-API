const Joi = require('joi');

const AddActivityPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  songId: Joi.string().required(),
  action: Joi.string().valid('add', 'delete').required(),
});

module.exports = { AddActivityPayloadSchema };
