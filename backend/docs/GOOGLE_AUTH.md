# Sign in with Google

Uses Google Identity Services in popup mode and the official `google-auth-library`
to verify ID tokens on the backend. No Gmail access or client secret is needed.

## Local setup

1. In [Google Cloud Console](https://console.cloud.google.com/auth/overview), select
   or create your project. Configure Google Auth Platform branding, audience,
   support email, and developer contact information. Use External audience for a
   public marketplace; add your Google account as a test user if testing is required.
2. Under **Clients**, create an OAuth client with type **Web application**.
3. Add your frontend origin under **Authorized JavaScript origins**, for example
   `http://localhost:5173`. Add `http://127.0.0.1:5173` only if you use that address.
   Use the exact port printed by Vite. This popup/callback flow does not require a
   redirect URI. For production, add the actual HTTPS frontend origin.
4. Set `GOOGLE_CLIENT_ID` in `backend/.env` to the public client ID ending in
   `.apps.googleusercontent.com`. Set `CLIENT_URL` to the same frontend origin.
   Do not put a client secret in the frontend or commit `.env`.
5. For an existing database, run these commands from `backend/`:

   ```bash
   npm run db:migrate:google-auth
   npm run dev
   ```

   The migration adds a nullable unique `googleId` and allows a null password for
   Google-only accounts. It preserves existing users and passwords and can be run
   repeatedly. `DB_SYNC=true` creates the updated schema for a new database only.
6. Start the frontend with `npm run dev`, then open `/signIn` or `/signUp` and
   choose **Continue with Google**. Restart the backend after changing its `.env`.

## Account behavior

- New Google accounts receive an automatically generated unique username, Google
  first/last names, and a verified email. They can edit their profile normally.
- Google accounts are identified by their stable `sub`, stored as `googleId`.
  Subsequent sign-ins do not depend on the email remaining unchanged.
- If a password account already has that email, the UI asks for the existing
  account password once before linking. Email matching alone never grants access.
  Existing passwords, profile details, listings and messages are preserved.
- Google-only users sign in with Google and manage their Google password from
  their Google Account. The app does not receive their Google password.
- Google profile images are not imported; existing local avatar uploads work.
- Success returns the same `{ success, data: { user, token, refreshToken } }`
  response as password login. Password hashes and Google IDs are not returned.

## Endpoints and verification

- `GET /api/auth/google/config`: `{ success: true, data: { clientId } }`, where
  `clientId` is null when Google sign-in is disabled.
- `POST /api/auth/google`: JSON `{ credential, nonce, password? }`. `credential`
  is the ID token from GIS. `nonce` is a fresh 64-character hex value generated
  with Web Crypto and passed to GIS `initialize()`. `password` is only used to
  authorize the first link to an existing password account.

The server verifies Google's signature, audience, issuer, expiry, verified email,
and nonce before looking up an account. Form submissions and unexpected browser
origins are rejected. No production verification uses Google's debugging
`tokeninfo` endpoint. Missing configuration returns 503 without creating users.

Run `npm run test:google-auth` for offline tests with real RSA signatures and
Google's real token verifier; only the key download and database are stubbed.

References: [Google setup](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid),
[token verification](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).
