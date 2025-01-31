exports.up = (pgm) => {
  pgm.createTable('playlistsongs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'playlists(id)',
      onDelete: 'cascade',
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'songs(id)',
      onDelete: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS playlist_song_activities CASCADE');

  pgm.dropTable('playlistsongs');
};
