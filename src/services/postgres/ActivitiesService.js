const { nanoid } = require('nanoid');
const { Pool } = require('pg');

class ActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_song_activities (id, playlist_id, song_id, user_id, action) VALUES ($1, $2, $3, $4, $5)',
      values: [id, playlistId, songId, userId, action],
    };

    await this._pool.query(query);
  }

  async getActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, activities.action, activities.time
             FROM playlist_song_activities AS activities
             JOIN users ON activities.user_id = users.id
             JOIN songs ON activities.song_id = songs.id
             WHERE activities.playlist_id = $1
             ORDER BY activities.time`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      username: row.username,
      title: row.title,
      action: row.action,
      time: row.time,
    }));
  }
}

module.exports = ActivitiesService;
