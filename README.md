# TODO

- Create a Transaction doc when a ruby is awarded, at signup and other times.
- A notification can only be created if the resource isn't more than
  a day old. Notifications like likes, comments, etc.
- Change to using the thumbnail image for a post (on-create and on-react) and
  comment notifications etc.
- Change to using the complete SubPost type
- Change to fetching posts using a unique school ID. Meaning
  each school should be assigned a unique ID when created
  as a document in the schools collection. Schools are fetched from the
  database when a user is signing up. Users and Posts should get this ID
  included in their school field object.
- Change name of transaction description for a ruby award gained via
  number of views (content creation)

## After MVP
- Add Location field which should be an object with the following properties
1. street
2. city
3. state
4. coordinates: {latitude, longitude}

- Add a login field which should be an object with the following properties
1. id
2. username"
