# TODO

- Posts should be fetched using schoolId as a query or search query.
- search query is then used in the search text, while school ID is used, as
  for a normal query
- Use relational style as much as possible. e.g. include name of user, imageUrl, when
  fetching comments and sub-post comments, not when they're being
  created.
- A notification should only be created if the resource isn't more than
  a day old. Notifications such as likes, comments, etc.
- Change to using the thumbnail image for a post (on-create and on-react) and
  comment notifications etc.
- Post audience (School, Faculty or Departmental mates) - PostModel.find(
  'schoolId: post.school.id' and ['audience.school': true or 'audience.faculty': 'true' or 'audience.department': true]
  )

## After MVP

- Only an admin can add a school, department, faculty
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
