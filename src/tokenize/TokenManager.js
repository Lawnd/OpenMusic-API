const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');
const config = require('../utils/config.js');

const TokenManager = {
  generateAccessToken: (payload) =>
    Jwt.token.generate(payload, config.jwt.accessTokenKey),
  generateRefreshToken: (payload) =>
    Jwt.token.generate(payload, config.jwt.refreshTokenKey),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, config.jwt.refreshTokenKey);
      const { payload } = artifacts.decoded;
      return payload;
    } catch {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};

module.exports = TokenManager;
