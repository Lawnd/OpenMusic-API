const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator, storageService, imagesValidator) {
    this._service = service;
    this._validator = validator;
    this._storageService = storageService;
    this._imagesValidator = imagesValidator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;

    const { album, songs } = await this._service.getAlbumWithSongs(id);

    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs,
        },
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    const { name, year } = request.payload;

    await this._service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }
  async postUploadAlbumCoverHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    this._imagesValidator.validateImageHeaders(cover.hapi.headers);

    await this._service.getAlbumById(id);

    const fileUrl = await this._storageService.writeFile(cover, cover.hapi);

    await this._service.updateAlbumCoverUrl(id, fileUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async deleteAlbumCoverHandler(request, h) {
    const { id } = request.params;

    const album = await this._service.getAlbumById(id);

    if (!album.cover) {
      return h
        .response({
          status: 'fail',
          message: 'Album tidak memiliki sampul untuk dihapus',
        })
        .code(400);
    }

    const key = album.cover.split('/').pop();

    await this._storageService.deleteFile(key);

    await this._service.updateAlbumCoverUrl(id, null);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  async postLikeAlbumHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.likeAlbum(userId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil disukai',
    });
    response.code(201);
    return response;
  }

  async deleteLikeAlbumHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.unlikeAlbum(userId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Album batal disukai',
    });
    response.code(200);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    const { likes, source } = await this._service.getAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: { likes },
    });
    response.header('X-Data-Source', source);
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
