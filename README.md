# TODO

- Post audience (School, Faculty or Departmental mates) - PostModel.find(
  'schoolId: post.school.id' and ['audience.school': true or 'audience.faculty': 'true' or 'audience.department': true]
  ). If audience is not set, then default to school
- Deleting images from AWS (e.g when a profile or cover image is changed)
- Level should use ID. Then use id to fetch posts, create notifications, fetch coursemates, etc.
- Review url endpoints that they follow the REST standard

## After MVP

- Create a reusable function for creating notifications when a post (text post or image post) is created.
- Create a notification when a post is liked
- Only an admin can add a school, department, faculty
- A post can be created with just text
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
