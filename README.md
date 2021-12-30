# TODO

- Add faculty endpoint
- Add departments endpoint
- Posts should be fetched using schoolId as a query or search query.
- search query is then used in the search text, while school ID is used, as
  for a normal query
- Use relational style as much as possible. e.g. include name of user when
  fetching comment, sub-comments and sub-post comments, not when they're being
  created.
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
- Include name in a reaction when fetching a post, subpost, comment or sub post comment
- Add Location field which should be an object with the following properties

1. street
2. city
3. state
4. coordinates: {latitude, longitude}

- Add a login field which should be an object with the following properties

1. id
2. username"
