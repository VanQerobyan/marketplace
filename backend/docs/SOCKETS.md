# Realtime messages

The backend uses Socket.IO 4 on the same HTTP server and port as the REST API.
Start normally with `npm run dev` or `npm start`. The Socket.IO path is
`/socket.io`; use a Socket.IO client rather than a raw WebSocket client.
`CLIENT_URL` controls the permitted browser origin for both transports.

The existing messages migration still applies; no additional database migration
is required for socket support.

## Authentication and connection

Pass the login access token in `auth.token`. Missing, invalid, expired, and
refresh tokens are rejected with `connect_error`. The account must still exist.
The connection error's `data` contains `{ success: false, statusCode, message }`.
Credentials are never accepted from query parameters.

Each connection automatically joins its authenticated account's private room.
Clients cannot choose rooms. Events reach every connected device/tab belonging
to either participant and no other accounts. Connections close when their
access token expires, and every write rechecks the token and account existence.
To reconnect after expiry, obtain a new access token, update `socket.auth.token`,
and call `socket.connect()`.

## Events

| Direction | Event | Payload/result |
| --- | --- | --- |
| Client → server | `message:send` | `{ receiverId, content, listingId? }` |
| Server → participants | `message:new` | Saved message: `{ id, senderId, receiverId, content, listingId, isRead, createdAt, updatedAt }` |
| Client → server | `message:read` | `{ userId }`, the peer whose incoming messages should be marked read |
| Server → participants | `message:read` | `{ readerId, senderId, updatedCount }` |
| Server → client | `message:error` | Error response when a write has no acknowledgement callback, or the access token expires |

`receiverId`, `listingId`, and `userId` must be numeric positive integers up to
2147483647. Text is trimmed and must contain 1–5000 characters. Self messaging
is rejected. The server ignores supplied sender, reader, read-state, and
timestamp fields. The optional listing and recipient must exist.

Supply an acknowledgement callback to either write event. Success returns
`{ success: true, data }`: the saved message for `message:send`, or
`{ updatedCount }` for `message:read`. Errors return
`{ success: false, statusCode, message, errors? }` with validation, authentication,
or not-found details. Unexpected errors return a generic 500 message.

The message and recipient notification are saved in one transaction before
`message:new` is emitted. A failed transaction emits no new-message event.
Read receipts are emitted only when incoming unread messages actually change.
Notification read state remains independent.

`POST /api/messages` and `PATCH /api/messages/user/:userId/read` publish the same
socket events, so HTTP and socket clients can participate in the same chat.

## Client example

This example is for a frontend that already has `socket.io-client` installed:

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: accessToken },
  autoConnect: false
});

socket.on('connect_error', (error) => console.error(error.data || error.message));
socket.on('message:error', (error) => console.error(error));
socket.on('message:new', (message) => {
  // Insert/update by message.id; the sender also receives this event.
});
socket.on('message:read', ({ readerId, senderId, updatedCount }) => {
  // Refresh the conversation's read state and unread counter.
});
socket.on('connect', () => {
  // Re-fetch history/inbox here to synchronize messages missed while offline.
});
socket.connect();

socket.timeout(5000).emit('message:send', {
  receiverId: 5,
  content: 'Բարև, ապրանքը կա՞։'
}, (timeoutError, response) => {
  if (timeoutError) {
    // Delivery is uncertain: re-fetch history before deciding whether to resend.
    return;
  }
  if (!response.success) console.error(response);
});

socket.timeout(5000).emit('message:read', { userId: 5 }, (error, response) => {
  if (error || !response.success) console.error(error || response);
});
```

## Reconnection and deployment

Messages are persisted even if the recipient is offline. Re-fetch history and
inbox through REST after connecting/reconnecting to recover missed live events.
Use message IDs to deduplicate the send acknowledgement, `message:new`, and
history responses. An acknowledgement timeout does not prove the write failed;
automatic retries can create duplicates because sends are not idempotent.

Live events currently run within one backend process. Multiple server processes
require a shared Socket.IO adapter/event bus before deploying this setup across
instances. Proxy `/socket.io` to this backend and enable WebSocket upgrades.

Socket.IO references: [authentication middleware](https://socket.io/docs/v4/middlewares/),
[rooms](https://socket.io/docs/v4/rooms/), and
[delivery guarantees](https://socket.io/docs/v4/delivery-guarantees/).
