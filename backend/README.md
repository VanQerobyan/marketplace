# Marketplace Backend

Test-only Stripe Checkout, purchase history, and setup steps:
[Փորձնական վճարումների ուղեցույց](docs/TEST_PAYMENTS.md).
Only Stripe `sk_test_` keys are accepted. Apply `npm run db:migrate:orders`
to an existing database before confirming a test payment.

Node.js + Express + PostgreSQL + Sequelize backend for the marketplace graduation project.

Google registration/sign-in is implemented alongside password login. See
[Google sign-in setup](docs/GOOGLE_AUTH.md) to configure the public client ID and
apply `npm run db:migrate:google-auth` to an existing database.

## Division of work

Already implemented here:
- project structure
- database connection
- register/login
- username + email uniqueness checks
- password validation + bcrypt hashing
- JWT authentication
- authorization for listing ownership
- user profile endpoints
- profile avatar upload/storage
- listings CRUD
- listing image upload/storage
- active / reserved / sold status
- search / filter / sorting / pagination
- views count
- favorites
- ratings
- notifications
- private text messages, conversation history, inbox, and read state
- realtime messaging through authenticated Socket.IO connections
- validation
- centralized error handling
- Swagger UI

Sequelize models and associations are in `src/models`. The realtime messaging
server is in `src/realtime/socket.js`.

## 1. Open in VS Code

Recommended structure:

```text
marketplace-project/
├── frontend/
└── backend/
```

Open the `marketplace-project` folder in VS Code.

## 2. Install backend dependencies

```bash
cd backend
npm install
```

## 3. Create PostgreSQL database

Example database name:

```text
marketplace_db
```

## 4. Create .env

Copy `.env.example` to `.env` and set your PostgreSQL password and JWT secret.

Example:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marketplace_db
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD
DB_SYNC=true
JWT_SECRET=CHANGE_THIS_TO_A_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Use `DB_SYNC=true` only while you are developing your models. Later you can switch to migrations.

## 5. Write your models

Read:

```text
docs/MODEL_CONTRACT.md
```

Create these Sequelize models and export them from `src/models/index.js`:

```js
module.exports = {
  User,
  Listing,
  Favorite,
  Rating,
  Notification
};
```

The services intentionally use only the agreed field names, so keep the model contract consistent.

## 6. Start backend

```bash
npm run dev
```

Health check:

```text
http://localhost:5000/api/health
```

Swagger:

```text
http://localhost:5000/api-docs
```

## Authentication flow

### Register

`POST /api/auth/register`

```json
{
  "firstName": "Aram",
  "lastName": "Petrosyan",
  "username": "aram123",
  "email": "aram@example.com",
  "password": "StrongPass1!"
}
```

Password rule:
- at least 8 characters
- uppercase letter
- lowercase letter
- number
- special character from `@$!%*?&`

### Login

`POST /api/auth/login`

```json
{
  "username": "aram123",
  "password": "StrongPass1!"
}
```

For protected routes send:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

### Change my password

`PATCH /api/auth/change-password` (requires the access token in the Bearer header above)

```json
{
  "currentPassword": "StrongPass1!",
  "newPassword": "NewStrongPass2!"
}
```

The new password must use the registration character rules above and be 8-72
characters long. Only the authenticated user's password is updated; no user ID
is accepted. The password is stored as a bcrypt hash, never returned.

- `200`: `{ "success": true, "message": "Password changed successfully" }`
- `400`: missing or invalid fields
- `401`: invalid/missing access token or incorrect current password
- `409`: another request changed the password during verification; retry

Existing access and refresh tokens remain valid after the change.
Run the isolated endpoint tests with `node --test test/change-password.test.js`
from the backend directory (no database connection required).

## Main endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `PATCH /api/auth/change-password`
- `GET /api/auth/me`

### Users
- `GET /api/users?search=aram&page=1&limit=12`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `PATCH /api/users/me/avatar`
- `GET /api/users/:id`

User search is public and matches parts of first names, last names, or usernames,
ignoring case. Multiple words can match across these fields (for example,
`search=Aram%20Petrosyan`). The required `search` must contain 1–101 characters
after trimming. `page` defaults to 1 (maximum 1000000); `limit` defaults to 12
(maximum 50). Invalid query parameters return 400.

The response is `{ success: true, data: [...], pagination: { page, limit,
totalItems, totalPages } }`. Each result contains only `id`, `firstName`,
`lastName`, `username`, and `avatar`. No matches returns an empty `data` array.

### Listings
- `GET /api/listings`
- `GET /api/listings/mine`
- `GET /api/listings/:id`
- `POST /api/listings`
- `PATCH /api/listings/:id`
- `PATCH /api/listings/:id/status`
- `DELETE /api/listings/:id`

Search example:

```text
GET /api/listings?search=iphone&status=active&minPrice=100&maxPrice=1000&page=1&limit=12&sort=newest
```

To show a user's listings on their profile:

```text
GET /api/listings?userId=5&page=1&limit=12
```

This endpoint is public. The optional `userId` must be a positive integer (maximum
2147483647). It combines with the other listing filters and sorting. The response
contains `success`, a `data` array of listings (including images), and `pagination`.
If the user has no matching listings, including a nonexistent user ID, `data` is
empty and `pagination.totalItems` is 0. Invalid `userId` values return 400. Omitting
`userId` keeps the existing search across all users.

### Favorites
- `GET /api/favorites`
- `POST /api/favorites/:listingId`
- `DELETE /api/favorites/:listingId`

### Ratings
- `GET /api/ratings/user/:userId`
- `POST /api/ratings/user/:userId`
- `GET /api/ratings/listing/:listingId`
- `POST /api/ratings/listing/:listingId`

Both GET endpoints return `{ success: true, data: { averageRating,
ratingsCount, items } }`. An existing listing with no ratings returns an empty
`items` array and zero average/count; a missing listing returns 404.
User ratings and their recipient notifications are saved in one transaction.
Duplicate ratings, including concurrent submissions, return 409. Both POST
endpoints accept only an integer rating from 1 to 5 and an optional string/null
comment up to 1000 characters.

To rate a listing, authorize with an access token and send
`POST /api/ratings/listing/5` with a JSON body:

```json
{ "rating": 4, "comment": "Good product" }
```

`rating` must be an integer from 1 to 5. `comment` is optional (up to 1000
characters; omitted or null comments are stored as null). The response is
`201 { success: true, data: { id, raterId, listingId, rating, comment, createdAt,
updatedAt } }`. The authenticated account determines `raterId`; submitted actor
or listing IDs in the request body are ignored. Users cannot rate their own
listings (400) or rate the same listing more than once (409). Missing listings
return 404 and missing or invalid access tokens return 401.

Listing ratings use a separate `listing_ratings` table. Run
`npm run db:migrate:listing-ratings` from `backend/` before using the new endpoint
with an existing database. This migration only creates the new table and its
indexes and can be rerun safely. With `DB_SYNC=true`, starting the backend also
creates the new table. Existing user ratings are unaffected.

### Notifications
- `GET /api/notifications`
- `PATCH /api/notifications/read-all`
- `PATCH /api/notifications/:id/read`
- `DELETE /api/notifications/:id`

For an existing database, run `npm run db:migrate:notification-actor` from
`backend/` before starting the updated backend. The migration can be rerun safely.
`DB_SYNC=true` creates the field for new tables, but does not update existing ones.

`userId` identifies the recipient. Rating notifications also store the authenticated
rater as `actorId`. `GET /api/notifications` and `PATCH /api/notifications/:id/read`
include the actor's public display fields:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 5,
      "actorId": 2,
      "type": "rating",
      "message": "You received a new rating",
      "isRead": false,
      "listingId": null,
      "createdAt": "2026-11-11T10:00:00.000Z",
      "updatedAt": "2026-11-11T10:00:00.000Z",
      "actor": {
        "id": 2,
        "firstName": "Aram",
        "lastName": "Sargsyan",
        "username": "aram",
        "avatar": null
      }
    }
  ]
}
```

The mark-as-read response has one notification in `data` instead of an array.
Existing notifications and notifications without an actor return `actorId: null`
and `actor: null`. Deleting an actor preserves the notification and clears its
`actorId`. Actor email and password are never included.

## Private messages

For an existing database, run `npm run db:migrate:messages` from `backend/`.
This safely rerunnable migration creates the `messages` table and indexes.
With `DB_SYNC=true`, starting the backend creates the new table automatically.
Sending messages also uses the existing notification `actorId` field; older
databases must have `npm run db:migrate:notification-actor` applied as described above.

All message endpoints require `Authorization: Bearer YOUR_ACCESS_TOKEN`.

- `POST /api/messages` — send a message.
- `GET /api/messages/conversations?page=1&limit=20` — my conversations, latest first.
- `GET /api/messages/user/5?page=1&limit=20` — my message history with user 5, newest first.
- `PATCH /api/messages/user/5/read` — mark unread messages from user 5 to me as read.

Send JSON with a numeric recipient ID and text:

```json
{
  "receiverId": 5,
  "content": "Hello, is this still available?",
  "listingId": 12
}
```

`listingId` is optional or nullable. The recipient and any attached listing must
exist (404 otherwise). Content is trimmed and must contain 1–5000 characters.
Invalid input and messaging yourself return 400; missing or invalid access
tokens return 401. Submitted `senderId`, `isRead`, and timestamps are ignored.
The authenticated user is always the sender.

A successful send returns `201 { success: true, data: { id, senderId,
receiverId, content, listingId, isRead, createdAt, updatedAt } }`. The message
and a `type: "message"` notification for the recipient are saved in one
transaction. Notifications expose the sender through their existing `actor` field.

History returns `{ success: true, data: [...], pagination: { page, limit,
totalItems, totalPages } }`. Each message additionally includes public `sender`
and `receiver` objects (`id`, `firstName`, `lastName`, `username`, `avatar`).
Only the authenticated user's exchange with the selected peer is returned.
History is sorted by descending message ID; reverse each page for chronological
display. Fetching history does not change read state.

The conversations endpoint uses the same pagination envelope. Each item is
`{ user, lastMessage, unreadCount }`: the peer's public fields, latest message,
and unread messages sent by that peer to the authenticated user. Exchanges
about different listings share one conversation per peer. Conversation order
uses the latest message ID descending. No messages returns an empty array.
`page` defaults to 1 (maximum 1000000); `limit` defaults to 20 (maximum 100).

The read endpoint takes no body and returns
`{ success: true, data: { updatedCount: 2 } }`. Repeating it returns a count
of 0 until new messages arrive. It only changes incoming messages from the
specified peer; notification read state is managed separately.
Deleting a listing preserves messages and clears their `listingId`; deleting
a participant removes their messages.

Socket.IO provides live delivery on the same backend port at `/socket.io`.
Both REST and socket writes publish events after successful database writes.
Connect with `auth: { token: YOUR_ACCESS_TOKEN }`, send `message:send`, and listen
for `message:new`. Use `message:read` for read updates. See
[the socket protocol and client example](docs/SOCKETS.md) for payloads,
acknowledgements, and reconnect behavior. The frontend must connect a Socket.IO
client to use these events.

Try REST endpoints under **Messages** in Swagger at `/api-docs`.
Run `npm run test:messages` for isolated REST tests and
`npm run test:message-sockets` for real HTTP/WebSocket tests with model stubs
(no database required).

## Profile images

For an existing database, apply the avatar column migration once before starting
the updated backend. Run this from `backend/`; it uses the database settings in `.env`:

```bash
npm run db:migrate:avatar
```

`DB_SYNC=true` creates the avatar column for a new database, but does not add it
to an existing `users` table.
The migration only adds the nullable `avatar` column and can be run again safely.

In Swagger (`http://localhost:5000/api-docs`), log in with `POST /api/auth/login`,
copy `data.token` into **Authorize**, then use **Try it out** on
`PATCH /api/users/me/avatar` and select an image in the `avatar` field.

Upload one JPEG, PNG or WebP image, up to 5 MB, using the `avatar` multipart field:

```bash
curl -X PATCH http://localhost:5000/api/users/me/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@/path/to/avatar.png"
```

Images are stored in `uploads/avatars/` with generated filenames. The response
contains `data.avatar`, for example `/uploads/avatars/<filename>.png`; open it
using the backend origin, such as `http://localhost:5000/uploads/avatars/<filename>.png`.
`GET /api/users/me` also returns `avatar` (or `null` before an upload).
Replacing an avatar removes the previous local image. A failed database update
removes the newly uploaded image.

## Listing images

For an existing database, run this from `backend/` before starting the updated backend:

```bash
npm run db:migrate:listing-images
```

The migration adds a non-null `images` array to `listings`, defaults existing rows
to `[]`, and can be run again safely. `DB_SYNC=true` creates the field for new
tables, but does not update existing tables.

Existing endpoints `GET /api/listings`, `GET /api/listings/mine`, and
`GET /api/listings/:id` now include `images` for every listing. Create, update,
and status responses also include it. Favorites include it in the nested listing.
Each value is a path on the backend origin:

```json
{
  "images": ["/uploads/listings/<generated-filename>.png"]
}
```

Use `http://localhost:5000` plus the path to display an image. Listings without
images return `images: []`. Images are stored in `uploads/listings/`.

The existing create and update endpoints accept `multipart/form-data`. Repeat
the `images` file field for up to 10 JPEG, PNG or WebP images, up to 5 MB each.
The server checks file extensions, MIME types, and file signatures. Normal JSON
requests still work; image paths cannot be assigned directly through JSON.

```bash
curl -X POST http://localhost:5000/api/listings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Phone for sale" \
  -F "description=Phone in excellent condition." \
  -F "price=200" \
  -F "images=@/path/to/front.png" \
  -F "images=@/path/to/back.jpg"
```

To replace a listing's images, use `PATCH /api/listings/:id` with the new files:

```bash
curl -X PATCH http://localhost:5000/api/listings/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@/path/to/replacement.webp"
```

Uploading new files replaces the entire previous image array in upload order.
An update with no files preserves existing images. Only the owner can update
images. Replaced images and images of deleted listings are removed from disk.
Failed validation or database writes remove the newly uploaded files.
Swagger at `/api-docs` opens these endpoints with `multipart/form-data` selected
by default. Click **Try it out** on the create endpoint to see `title`,
`description`, `price`, `category`, and the `images` file picker together in one form. The create form uses
the example iPhone details. All fields and files are sent to `POST /api/listings`
in the same request. JSON requests without files remain available in the media
type selector.

New listings always start with `status: "active"`; do not send `status` when
creating a listing. Any status supplied to POST is ignored. The owner can later
change the status to `reserved` or `sold` using the existing endpoint:

```http
PATCH /api/listings/1/status
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{"status":"reserved"}
```

Run the backend listing-image integration tests with `npm run test:listing-images`.
These tests use an in-memory model stub and require no running database.

## Listing views

Run `npm run db:migrate:listing-views` from `backend/` for an existing database.
`GET /api/listings/:id` counts each authenticated user once per listing, excluding
the owner. Anonymous requests remain public and do not increase the counter.
Provide the normal Bearer access token to record a view. Invalid supplied tokens
are rejected. A unique database index prevents duplicate views across tabs,
sessions, or simultaneous requests, and the counter and view record are saved
in one transaction. Recording a view does not change the listing's `updatedAt`.
Previously accumulated counters are preserved; old anonymous/owner views cannot
be identified retroactively. Run `npm run test:listing-views` to test this behavior.
