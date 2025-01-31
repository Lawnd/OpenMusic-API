const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
  constructor(usersService) {
    this._usersService = usersService;
    this._pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const userQuery = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };

    const userResult = await this._pool.query(userQuery);

    if (!userResult.rows.length) {
      throw new NotFoundError('Kolaborasi gagal. User tidak ditemukan');
    }

    const id = `collab-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations (id, playlist_id, user_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError(
        'Kolaborasi gagal dihapus. Kolaborator tidak ditemukan'
      );
    }
  }
}

module.exports = CollaborationsService;
