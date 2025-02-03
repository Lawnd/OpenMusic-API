exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade',
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'albums(id)',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint('user_album_likes', 'unique_user_and_album', {
    unique: ['user_id', 'album_id'],
  });
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS user_album_likes CASCADE');
};
