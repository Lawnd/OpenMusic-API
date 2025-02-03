const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (
    server,
    { service, validator, storageService, imagesValidator }
  ) => {
    const handler = new AlbumsHandler(
      service,
      validator,
      storageService,
      imagesValidator
    );
    server.route(routes(handler));
  },
};
