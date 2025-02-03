const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelAlbum } = require('../../utils');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return mapDBToModelAlbum(result.rows[0]);
  }

  async getAlbumWithSongs(albumId) {
    const albumQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };

    const albumResult = await this._pool.query(albumQuery);

    if (!albumResult.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = albumResult.rows[0];

    album.coverUrl = album.cover ?? null;
    delete album.cover;

    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE albumId = $1',
      values: [albumId],
    };

    const songsResult = await this._pool.query(songsQuery);

    const songs = songsResult.rows;

    return { album, songs };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async updateAlbumCoverUrl(albumId, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2',
      values: [coverUrl, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error('Gagal memperbarui sampul album');
    }
  }

  async likeAlbum(userId, albumId) {
    await this.getAlbumById(albumId);

    const likeQuery = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const likeResult = await this._pool.query(likeQuery);

    if (likeResult.rowCount) {
      throw new InvariantError('Anda sudah menyukai album ini');
    }

    const id = `like-${nanoid(16)}`;
    const insertQuery = {
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3)',
      values: [id, userId, albumId],
    };

    await this._pool.query(insertQuery);

    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async unlikeAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error('Anda belum menyukai album ini');
    }

    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    try {
      const cachedLikes = await this._cacheService.get(
        `album-likes:${albumId}`
      );
      return { likes: parseInt(cachedLikes, 10), source: 'cache' };
    } catch {
      const query = {
        text: 'SELECT COUNT(*) AS likes FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likes = parseInt(result.rows[0].likes, 10);

      await this._cacheService.set(`album-likes:${albumId}`, likes);

      return { likes, source: 'database' };
    }
  }
}

module.exports = AlbumsService;
