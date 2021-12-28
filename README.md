# TODO

- A notification should only be created if the resource isn't more than
  a day old. Notifications such as likes, comments, etc.
- Change to using the thumbnail image for a post (on-create and on-react) and
  comment notifications etc.
- Change to using the complete SubPost type
- Change name of transaction description for a ruby award gained via
  number of views (content creation)
- Post visibility (School, Faculty or Departmental mates) - PostModel.find(
  'schoolId: post.school.id' and ['visibility.school': true or 'visibility.faculty': 'true' or 'visibility.department': true]
  )

## After MVP

- When fetching posts, add fallback for a user not being available,
in such a case, the post shouldn't be included in the returned posts.
- Add Location field which should be an object with the following properties

1. street
2. city
3. state
4. coordinates: {latitude, longitude}

- Add a login field which should be an object with the following properties

1. id
2. username"
