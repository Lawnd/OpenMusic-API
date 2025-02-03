const mapDBToModelAlbum = ({ id, name, year, coverUrl }) => ({
  id,
  name,
  year,
  coverUrl,
});

const mapDBToModelSong = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

module.exports = { mapDBToModelAlbum, mapDBToModelSong };
