const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistsService, activitiesService, validator) {
    this._playlistsService = playlistsService;
    this._activitiesService = activitiesService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({
      name,
      owner,
    });

    const response = h.response({
      status: 'success',
      data: { playlistId },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: owner } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(owner);

    return {
      status: 'success',
      data: { playlists },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.deletePlaylistById(id, owner);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    await this._playlistsService.verifySongExists(songId);

    await this._playlistsService.addSongToPlaylist(playlistId, songId);

    await this._activitiesService.addActivity(
      playlistId,
      songId,
      credentialId,
      'add'
    );

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylistHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    // Verifikasi akses ke playlist (owner atau kolaborator)
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    // Ambil detail playlist
    const playlist = await this._playlistsService.getPlaylistById(playlistId);

    // Ambil daftar lagu dari playlist
    const songs = await this._playlistsService.getSongsFromPlaylist(playlistId);

    return {
      status: 'success',
      data: {
        playlist: {
          id: playlist.id,
          name: playlist.name,
          username: playlist.username,
          songs,
        },
      },
    };
  }

  async deleteSongFromPlaylistHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    await this._playlistsService.verifySongInPlaylist(playlistId, songId);

    await this._playlistsService.deleteSongFromPlaylist(playlistId, songId);

    await this._activitiesService.addActivity(
      playlistId,
      songId,
      credentialId,
      'delete'
    );

    return h
      .response({
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      })
      .code(200);
  }
}
module.exports = PlaylistsHandler;
