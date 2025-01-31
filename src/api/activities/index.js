const ActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'activities',
  version: '1.0.0',
  register: async (server, { activitiesService, playlistsService }) => {
    const handler = new ActivitiesHandler(activitiesService, playlistsService);
    server.route(routes(handler));
  },
};
