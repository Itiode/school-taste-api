# TODO

- Change to using the complete SubPost type
- Create a notification when a comment is made
- Create a Transaction doc when a ruby is awarded, at signup and other times.
- Prevent creation of multiple similar notifications by leveraging
  notification type and contentId
- A notification can only be created if the resource isn't more than
  a day old. Notifications like likes, comments, etc.
- Change to fetching posts using a unique school ID. Meaning
  each school should be assigned a unique ID when created
  as a document in the schools collection. Schools are fetched from the
  database when a user is signing up

- Add Location field which should be an object with the following properties

1. street
2. city
3. state
4. coordinates: {latitude, longitude}

- Add a login field which should be an object with the following properties

1. id
2. username"
