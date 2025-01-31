const autoBind = require('auto-bind');

class ActivitiesHandler {
  constructor(activitiesService, playlistsService, validator) {
    this._activitiesService = activitiesService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async getPlaylistActivitiesHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const activities = await this._activitiesService.getActivities(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = ActivitiesHandler;
