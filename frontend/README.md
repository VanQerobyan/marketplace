# Test payments

Other sellers' listing pages include **Buy (test)** and the account navigation includes
**My purchases**. Checkout uses Stripe's hosted test page, so no frontend Stripe key
or additional frontend payment library is needed.
See [the Armenian setup and code guide](../backend/docs/TEST_PAYMENTS.md).
Run `npm run test:payments` for payment API/cache tests.

# Google sign-in

The sign-in and sign-up pages include Google's official **Continue with Google** button.
The frontend reads the public client ID from `GET /api/auth/google/config`, so it
does not need a second environment variable or any Google client secret.

Configure `GOOGLE_CLIENT_ID` and apply `npm run db:migrate:google-auth` in the
backend as described in [the setup guide](../backend/docs/GOOGLE_AUTH.md).
The button creates a new account or signs into an already linked account. Linking
an existing password account asks for its current password once. Successful Google
sign-in uses the same Redux session, token refresh, and cache reset as password login.
If Google is not configured, the page shows that Google sign-in is unavailable.

Run `npm run test:google-auth` for the SDK loader/nonce tests and `npm run test:auth`
for the API and session integration tests.

# Messages

Open `/account/messages` to select a conversation or search for a user.
Profile, listing, and message-notification links open the matching conversation.

- `src/components/pages/message/Message.tsx` connects the page components.
- `ConversationList.tsx` and `ConversationThread.tsx` load paginated data through the existing RTK Query setup.
- `MessageForm.tsx` sends text; `MessageBubble.tsx` displays messages and read state.
- `src/hooks/useMessageSocket.ts` manages the approved Socket.IO client, incoming events, and reconnects.

Sends use the socket `message:send` event. Incoming messages and read receipts
refresh the shared RTK Query cache. Visible conversations mark incoming messages
as read. Failed or unconfirmed sends preserve the draft and never resend automatically.
Reconnects reload history to recover messages missed while offline.

Run the backend with its existing messages migration applied and `CLIENT_URL`
matching the frontend origin. Socket support uses the same backend port (5000).
Run `npm run test:messages` for the messaging API/cache tests.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
