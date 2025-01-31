exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    name: { type: 'TEXT', notNull: true },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS playlist_songs CASCADE');
  pgm.sql('DROP TABLE IF EXISTS playlist_song_activities CASCADE');
  pgm.sql('DROP TABLE IF EXISTS collaborations CASCADE');

  pgm.dropTable('playlists');
};
