# TODO

- Change to using the thumbnail image for a post (on-create and on-react) and
  comment notifications etc.
- Post audience (School, Faculty or Departmental mates) - PostModel.find(
  'schoolId: post.school.id' and ['audience.school': true or 'audience.faculty': 'true' or 'audience.department': true]
  )
- Check that a post contains either an image or text (one must be there)
- Remove unused info, like payment details and rubyBalance from a user.
- Review url endpoints that they follow the REST standard 

## After MVP

- Only an admin can add a school, department, faculty
- A post can be created with just text
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
