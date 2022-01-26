# TODO

- Deleting images from AWS (e.g when a profile or cover image is changed)
- Use a transaction in creating posts and subposts, updating profile image, cover image and so on
- Review url endpoints that they follow the REST standard

## After MVP

- Limit the creation of notifications when a post is liked
- Add limit for updating school, faculty, department and level.
- Create a reusable function for creating notifications when a post (text post or image post) is created.
- Consider indexing school ID, to optimize post fetching
- Only an admin can add a school, department, faculty
- When fetching posts, add fallback for a user not being available,
  in such a case, the post shouldn't be included in the returned posts.
- Include name in a reaction when fetching a post, subpost, comment or sub post comment
- Consider filtering uploaded images for png, jpeg, etc
  const fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
  cb(null, true);
  } else {
  cb(null, false);
  }
  }
  const upload = multer({ storage: storage, fileFilter: fileFilter });
- Add Location field which should be an object with the following properties

1. street
2. city
3. state
4. coordinates: {latitude, longitude}

- Add a login field which should be an object with the following properties

1. id
2. username"
