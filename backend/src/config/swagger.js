const listingCreateProperties = {
  title: { type: 'string', example: 'iPhone 15 Pro' },
  description: { type: 'string', example: 'Excellent condition, used for six months.' },
  price: { type: 'number', example: 850 },
  category: { type: 'string', nullable: true, example: 'electronics' }
};

const listingProperties = {
  ...listingCreateProperties,
  status: { type: 'string', enum: ['active', 'reserved', 'sold'], example: 'active' }
};

const listingRequestContent = (schema) => ({
  'multipart/form-data': {
    schema: {
      type: 'object',
      ...(schema === 'ListingRequest' ? { required: ['title', 'description', 'price'] } : {}),
      properties: {
        ...(schema === 'ListingRequest' ? listingCreateProperties : listingProperties),
        images: {
          type: 'array',
          maxItems: 10,
          items: { type: 'string', format: 'binary' },
          description: 'Select JPEG, PNG or WebP images, up to 5 MB each. On PATCH, replaces all existing images; omitted files preserve existing images.'
        }
      }
    }
  },
  'application/json': { schema: { $ref: `#/components/schemas/${schema}` } }
});

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Marketplace API',
    version: '1.0.0',
    description: 'Marketplace API with profile and listing images, private messages, and notifications. Live messaging uses authenticated Socket.IO at /socket.io on the same server; see backend/docs/SOCKETS.md for the event protocol.'
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Local development server' }
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Listings' },
    { name: 'Favorites' },
    { name: 'Ratings' },
    { name: 'Notifications' },
    { name: 'Messages' },
    { name: 'Test payments' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      TestOrder: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          buyerId: { type: 'integer' },
          listingId: { type: 'integer', nullable: true },
          title: { type: 'string' },
          amount: { type: 'integer', description: 'Amount in USD cents', example: 1250 },
          currency: { type: 'string', enum: ['usd'] },
          status: { type: 'string', enum: ['paid_test'] },
          stripeSessionId: { type: 'string', example: 'cs_test_example' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      MessageRequest: {
        type: 'object',
        required: ['receiverId', 'content'],
        properties: {
          receiverId: { type: 'integer', minimum: 1, maximum: 2147483647, example: 5 },
          content: { type: 'string', minLength: 1, maxLength: 5000, example: 'Hello, is this still available?' },
          listingId: { type: 'integer', minimum: 1, maximum: 2147483647, nullable: true, example: null }
        }
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          senderId: { type: 'integer' },
          receiverId: { type: 'integer' },
          content: { type: 'string' },
          listingId: { type: 'integer', nullable: true },
          isRead: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      MessageHistoryItem: {
        allOf: [
          { $ref: '#/components/schemas/Message' },
          { type: 'object', properties: {
            sender: { $ref: '#/components/schemas/UserSearchResult' },
            receiver: { $ref: '#/components/schemas/UserSearchResult' }
          } }
        ]
      },
      Conversation: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/UserSearchResult' },
          lastMessage: { $ref: '#/components/schemas/Message' },
          unreadCount: { type: 'integer', minimum: 0 }
        }
      },
      MessagePagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          totalItems: { type: 'integer', example: 1 },
          totalPages: { type: 'integer', example: 1 }
        }
      },
      MessageResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/Message' }
        }
      },
      MessageHistoryResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: { $ref: '#/components/schemas/MessageHistoryItem' } },
          pagination: { $ref: '#/components/schemas/MessagePagination' }
        }
      },
      ConversationsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: { $ref: '#/components/schemas/Conversation' } },
          pagination: { $ref: '#/components/schemas/MessagePagination' }
        }
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer', description: 'Notification recipient' },
          actorId: { type: 'integer', nullable: true, description: 'User who triggered the notification' },
          type: { type: 'string', example: 'rating' },
          message: { type: 'string', example: 'You received a new rating' },
          isRead: { type: 'boolean' },
          listingId: { type: 'integer', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          actor: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'integer' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              username: { type: 'string' },
              avatar: { type: 'string', nullable: true }
            }
          }
        }
      },
      NotificationsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: { $ref: '#/components/schemas/Notification' } }
        }
      },
      NotificationResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/Notification' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'username', 'email', 'password'],
        properties: {
          firstName: { type: 'string', example: 'Aram' },
          lastName: { type: 'string', example: 'Petrosyan' },
          username: { type: 'string', example: 'aram123' },
          email: { type: 'string', format: 'email', example: 'aram@example.com' },
          password: { type: 'string', format: 'password', example: 'StrongPass1!' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'aram123' },
          password: { type: 'string', format: 'password', example: 'StrongPass1!' }
        }
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', format: 'password', writeOnly: true, example: 'StrongPass1!' },
          newPassword: {
            type: 'string', format: 'password', writeOnly: true, minLength: 8, maxLength: 72,
            description: 'Use uppercase, lowercase, a number and a special character from @$!%*?&. Only these ASCII characters and letters/digits are allowed.',
            example: 'NewStrongPass2!'
          }
        }
      },
      ListingRequest: {
        type: 'object',
        required: ['title', 'description', 'price'],
        properties: listingCreateProperties
      },
      ListingUpdateRequest: {
        type: 'object',
        properties: listingProperties
      },
      Listing: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          ...listingProperties,
          images: {
            type: 'array',
            items: { type: 'string', example: '/uploads/listings/123e4567-e89b-42d3-a456-426614174000.png' },
            description: 'Image paths on the backend origin, in upload order. Empty array when there are no images.'
          },
          viewsCount: { type: 'integer', example: 0 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      ListingResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/Listing' }
        }
      },
      ListingsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: { $ref: '#/components/schemas/Listing' } },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              totalItems: { type: 'integer' },
              totalPages: { type: 'integer' }
            }
          }
        }
      },
      RatingRequest: {
        type: 'object',
        required: ['rating'],
        properties: {
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
          comment: { type: 'string', nullable: true, example: 'Very good seller' }
        }
      },
      ListingRating: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          raterId: { type: 'integer', example: 2 },
          listingId: { type: 'integer', example: 5 },
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
          comment: { type: 'string', nullable: true, example: 'Good product' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      ListingRatingResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/ListingRating' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          firstName: { type: 'string', example: 'Aram' },
          lastName: { type: 'string', example: 'Petrosyan' },
          username: { type: 'string', example: 'aram123' },
          email: { type: 'string', format: 'email', example: 'aram@example.com' },
          avatar: {
            type: 'string',
            nullable: true,
            description: 'Image path on the backend origin; null until an avatar is uploaded.',
            example: '/uploads/avatars/123e4567-e89b-42d3-a456-426614174000.png'
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      UserSearchResult: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          firstName: { type: 'string', example: 'Aram' },
          lastName: { type: 'string', example: 'Petrosyan' },
          username: { type: 'string', example: 'aram123' },
          avatar: { type: 'string', nullable: true, example: null }
        }
      },
      UserSearchResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: { $ref: '#/components/schemas/UserSearchResult' } },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 12 },
              totalItems: { type: 'integer', example: 1 },
              totalPages: { type: 'integer', example: 1 }
            }
          }
        }
      },
      UserResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/User' }
        }
      },
      ProfileResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            allOf: [
              { $ref: '#/components/schemas/User' },
              {
                type: 'object',
                properties: {
                  averageRating: { type: 'number', example: 0 },
                  ratingsCount: { type: 'integer', example: 0 }
                }
              }
            ]
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' }
        }
      }
    }
  },
  paths: {
    '/api/payments/config': {
      get: {
        tags: ['Test payments'], summary: 'Check test checkout availability', security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Returns data.enabled and data.testMode; never returns the Stripe secret key' }, '401': { description: 'Authentication required' } }
      }
    },
    '/api/payments/checkout': {
      post: {
        tags: ['Test payments'], summary: 'Create a Stripe test checkout', security: [{ bearerAuth: [] }],
        description: 'Only sk_test_ keys are accepted. The server uses the listing price in USD. No real money is transferred.',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['listingId'], properties: { listingId: { type: 'integer', minimum: 1, maximum: 2147483647, example: 5 } } } } } },
        responses: {
          '200': { description: 'Returns data.url for the Stripe-hosted test checkout' },
          '400': { description: 'Invalid listing ID, own listing, or price outside $0.50–$999,999.99' },
          '401': { description: 'Authentication required' }, '404': { description: 'Listing not found' },
          '409': { description: 'Listing is unavailable' }, '502': { description: 'Stripe request failed' },
          '503': { description: 'A Stripe test secret key is not configured' }
        }
      }
    },
    '/api/payments/confirm': {
      post: {
        tags: ['Test payments'], summary: 'Verify and save my test purchase', security: [{ bearerAuth: [] }],
        description: 'Checks the session directly with Stripe. Only completed, paid, non-live sessions belonging to the authenticated buyer can create a purchase. Repeating confirmation returns the same order.',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['sessionId'], properties: { sessionId: { type: 'string', pattern: '^cs_test_[A-Za-z0-9]+$', maxLength: 255 } } } } } },
        responses: {
          '200': { description: 'Verified test purchase', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/TestOrder' } } } } } },
          '400': { description: 'Invalid test session or mismatched purchase details' }, '401': { description: 'Authentication required' },
          '404': { description: 'Test payment not found or belongs to another buyer' }, '409': { description: 'Test payment is not completed' },
          '502': { description: 'Stripe request failed' }, '503': { description: 'Test key is not configured' }
        }
      }
    },
    '/api/payments/mine': {
      get: {
        tags: ['Test payments'], summary: 'List my test purchases', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 1000000, default: 1 } }],
        responses: {
          '200': { description: 'Test purchases, 12 per page', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/TestOrder' } }, pagination: { type: 'object' } } } } } },
          '400': { description: 'Invalid page' }, '401': { description: 'Authentication required' }
        }
      }
    },
    '/api/messages': {
      post: {
        tags: ['Messages'], summary: 'Send a private text message', security: [{ bearerAuth: [] }],
        description: 'The access token determines the sender. Content is trimmed and must contain 1–5000 characters. Optionally attach an existing listing. A message notification is created atomically. Self messaging is rejected.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageRequest' } } } },
        responses: {
          '201': { description: 'Message sent', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
          '400': { description: 'Invalid message or self messaging' },
          '401': { description: 'Missing or invalid access token' },
          '404': { description: 'Recipient or listing not found' }
        }
      }
    },
    '/api/messages/conversations': {
      get: {
        tags: ['Messages'], summary: 'List my conversations', security: [{ bearerAuth: [] }],
        description: 'One conversation per peer with public user details, the latest message, and incoming unread count. Sorted by latest message ID descending. Empty pages retain the total count.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1, maximum: 1000000 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 } }
        ],
        responses: {
          '200': { description: 'My conversations', content: { 'application/json': { schema: { $ref: '#/components/schemas/ConversationsResponse' } } } },
          '400': { description: 'Invalid pagination' },
          '401': { description: 'Missing or invalid access token' }
        }
      }
    },
    '/api/messages/user/{userId}': {
      get: {
        tags: ['Messages'], summary: 'Get my message history with a user', security: [{ bearerAuth: [] }],
        description: 'Returns only messages exchanged with the authenticated user, newest ID first. Sender and receiver include public display fields. Does not mark messages as read.',
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'integer', minimum: 1, maximum: 2147483647 } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1, maximum: 1000000 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 } }
        ],
        responses: {
          '200': { description: 'Message history', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageHistoryResponse' } } } },
          '400': { description: 'Invalid user ID, pagination, or own user ID' },
          '401': { description: 'Missing or invalid access token' },
          '404': { description: 'User not found' }
        }
      }
    },
    '/api/messages/user/{userId}/read': {
      patch: {
        tags: ['Messages'], summary: 'Mark incoming messages from a user as read', security: [{ bearerAuth: [] }],
        description: 'Only changes unread messages sent by this peer to the authenticated user. Repeat calls are safe. Notification read state is managed separately through /api/notifications.',
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'integer', minimum: 1, maximum: 2147483647 } }],
        responses: {
          '200': { description: 'Updated incoming messages', content: { 'application/json': { schema: {
            type: 'object', properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object', properties: { updatedCount: { type: 'integer', example: 2 } } }
            }
          } } } },
          '400': { description: 'Invalid user ID or own user ID' },
          '401': { description: 'Missing or invalid access token' },
          '404': { description: 'User not found' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a user',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
        responses: { '201': { description: 'Registered' }, '400': { description: 'Validation error' }, '409': { description: 'Username or email already exists' } }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with username and password',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
        responses: { '200': { description: 'Logged in' }, '401': { description: 'Invalid credentials' } }
      }
    },
    '/api/auth/google/config': {
      get: {
        tags: ['Auth'], summary: 'Get the public Google sign-in client ID',
        responses: { '200': { description: 'data.clientId is the OAuth client ID, or null when disabled' } }
      }
    },
    '/api/auth/google': {
      post: {
        tags: ['Auth'], summary: 'Sign in or register using a Google ID token',
        description: 'Use the Google Identity Services button. Send its credential and the same 64-character hex nonce passed to initialize(). Returns the same session as password login. Requires GOOGLE_CLIENT_ID and the Google authentication migration.',
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['credential', 'nonce'], properties: {
            credential: { type: 'string', description: 'Google ID token returned by GIS' },
            nonce: { type: 'string', pattern: '^[a-f0-9]{64}$' },
            password: { type: 'string', description: 'Existing local password, required only to authorize first-time account linking' }
          }
        } } } },
        responses: {
          '200': { description: 'Signed in; data contains user, token, and refreshToken' },
          '400': { description: 'Invalid request' }, '401': { description: 'Invalid or expired Google credential' },
          '403': { description: 'Invalid request origin or content type' },
          '409': { description: 'Email belongs to another account or concurrent change; try password login' },
          '503': { description: 'Google sign-in is disabled or temporarily unavailable' }
        }
      }
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Get a new access token using the refresh token returned at login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } }
              }
            }
          }
        },
        responses: { '200': { description: 'New access token in data.token' }, '400': { description: 'Validation error' }, '401': { description: 'Invalid or expired refresh token' } }
      }
    },
    '/api/auth/change-password': {
      patch: {
        tags: ['Auth'],
        summary: 'Change my password using the current password',
        description: 'Changes only the authenticated account. Existing access and refresh tokens remain valid.',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } } },
        responses: {
          '200': {
            description: 'Password changed successfully',
            content: { 'application/json': { schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Password changed successfully' }
              }
            } } }
          },
          '400': { description: 'Missing or invalid password fields' },
          '401': { description: 'Unauthorized or incorrect current password' },
          '409': { description: 'Password was changed by another request; retry with the current password' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the authenticated user from JWT',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Current user' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Search users by name or username',
        description: 'Public, case-insensitive substring search. All words must match a first name, last name, or username. Returns public fields only. No matches returns an empty array.',
        parameters: [
          { name: 'search', in: 'query', required: true, schema: { type: 'string', minLength: 1, maxLength: 101 }, example: 'Aram Petrosyan' },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 1000000, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 12 } }
        ],
        responses: {
          '200': {
            description: 'Matching users and pagination',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserSearchResponse' } } }
          },
          '400': {
            description: 'Missing or invalid search, page, or limit',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      }
    },
    '/api/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get my profile, including avatar',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profile with avatar image path, or null before an upload',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ProfileResponse' } } }
          },
          '401': {
            description: 'Missing or invalid access token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      },
      patch: {
        tags: ['Users'],
        summary: 'Update my profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' }, lastName: { type: 'string' }, username: { type: 'string' }, email: { type: 'string', format: 'email' }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Updated' }, '409': { description: 'Username or email already exists' } }
      }
    },
    '/api/users/me/avatar': {
      patch: {
        tags: ['Users'],
        summary: 'Upload my profile avatar (JPEG, PNG or WebP, up to 5 MB)',
        description: 'Authorize with the access token from POST /api/auth/login, then select an image in the avatar field. The response contains the updated user in data and the image path in data.avatar.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['avatar'],
                properties: { avatar: { type: 'string', format: 'binary' } }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Updated user with avatar image path in data.avatar',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserResponse' } } }
          },
          '400': {
            description: 'Missing image, wrong multipart field, unsupported image type or invalid image contents',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          '401': {
            description: 'Missing, invalid or expired access token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          '413': {
            description: 'Image exceeds 5 MB',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      }
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'], summary: 'Get public user profile', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'User profile' }, '404': { description: 'User not found' } }
      }
    },
    '/api/listings': {
      get: {
        tags: ['Listings'],
        summary: 'Search/filter/sort/paginate listings',
        description: 'Public listing search. Provide userId to get only that user\'s listings. Supports the existing filters, sorting, and pagination. No matches returns an empty data array.',
        parameters: [
          { name: 'userId', in: 'query', description: 'Filter by the listing owner\'s user ID', schema: { type: 'integer', minimum: 1, maximum: 2147483647 }, example: 5 },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'reserved', 'sold'] } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12, maximum: 50 } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'price_asc', 'price_desc'] } }
        ],
        responses: {
          '200': { description: 'Listings including images', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListingsResponse' } } } },
          '400': { description: 'Invalid userId or other query parameters', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      post: {
        tags: ['Listings'], summary: 'Create listing', security: [{ bearerAuth: [] }],
        description: 'Create a listing and upload its images in one request. Fill in title, description, price and category, and select files in images. Status is always set to active by the server; any status sent during creation is ignored. The owner can change it later with PATCH /api/listings/{id}/status. Accepts up to 10 JPEG, PNG or WebP images, up to 5 MB each. JSON requests without files are also supported.',
        requestBody: { required: true, content: listingRequestContent('ListingRequest') },
        responses: {
          '201': { description: 'Created with images', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListingResponse' } } } },
          '400': { description: 'Invalid listing or image upload' },
          '413': { description: 'Image exceeds 5 MB' }
        }
      }
    },
    '/api/listings/mine': {
      get: {
        tags: ['Listings'], summary: 'Get my listings', security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'reserved', 'sold'] } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'price_asc', 'price_desc'] } }
        ],
        responses: { '200': { description: 'My listings including images', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListingsResponse' } } } } }
      }
    },
    '/api/listings/{id}': {
      get: {
        tags: ['Listings'], summary: 'Get one listing; count each authenticated non-owner once', security: [{}, { bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Listing including images and viewsCount; anonymous reads do not increment views', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListingResponse' } } } }, '401': { description: 'Invalid or expired access token when provided' }, '404': { description: 'Not found' } }
      },
      patch: {
        tags: ['Listings'], summary: 'Update my listing', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        description: 'All fields are optional. Multipart images replace the complete image array. Without image files, existing images are preserved.',
        requestBody: { required: true, content: listingRequestContent('ListingUpdateRequest') },
        responses: {
          '200': { description: 'Updated with images', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListingResponse' } } } },
          '400': { description: 'Invalid listing or image upload' },
          '403': { description: 'Not owner' },
          '413': { description: 'Image exceeds 5 MB' }
        }
      },
      delete: {
        tags: ['Listings'], summary: 'Delete my listing', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '204': { description: 'Deleted' }, '403': { description: 'Not owner' } }
      }
    },
    '/api/listings/{id}/status': {
      patch: {
        tags: ['Listings'], summary: 'Change listing status', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['active', 'reserved', 'sold'] } } } } } },
        responses: { '200': { description: 'Status changed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListingResponse' } } } } }
      }
    },
    '/api/favorites': {
      get: { tags: ['Favorites'], summary: 'Get my favorites', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Favorites' } } }
    },
    '/api/favorites/{listingId}': {
      post: { tags: ['Favorites'], summary: 'Add listing to favorites', security: [{ bearerAuth: [] }], parameters: [{ name: 'listingId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '201': { description: 'Added' }, '409': { description: 'Already favorite' } } },
      delete: { tags: ['Favorites'], summary: 'Remove listing from favorites', security: [{ bearerAuth: [] }], parameters: [{ name: 'listingId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '204': { description: 'Removed' } } }
    },
    '/api/ratings/user/{userId}': {
      get: { tags: ['Ratings'], summary: 'Get user ratings and average', parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Ratings' } } },
      post: {
        tags: ['Ratings'], summary: 'Rate a user', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RatingRequest' } } } },
        responses: { '201': { description: 'Rated' }, '400': { description: 'Cannot rate yourself' }, '409': { description: 'Already rated' } }
      }
    },
    '/api/ratings/listing/{listingId}': {
      get: {
        tags: ['Ratings'], summary: 'Get listing ratings and average',
        parameters: [{ name: 'listingId', in: 'path', required: true, schema: { type: 'integer', minimum: 1, maximum: 2147483647 } }],
        responses: {
          '200': { description: 'Ratings summary', content: { 'application/json': { schema: {
            type: 'object', properties: {
              success: { type: 'boolean' },
              data: { type: 'object', properties: {
                averageRating: { type: 'number' }, ratingsCount: { type: 'integer' },
                items: { type: 'array', items: { $ref: '#/components/schemas/ListingRating' } }
              } }
            }
          } } } },
          '400': { description: 'Invalid listing ID' },
          '404': { description: 'Listing not found' }
        }
      },
      post: {
        tags: ['Ratings'],
        summary: 'Rate a listing',
        description: 'Requires an access token. Submit an integer rating from 1 to 5 and an optional comment (up to 1000 characters). Each user can rate a listing once and cannot rate their own listing. The authenticated account determines raterId. Listing ratings are stored separately from user ratings.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'listingId', in: 'path', required: true, schema: { type: 'integer', minimum: 1, maximum: 2147483647 }, example: 5 }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RatingRequest' } } }
        },
        responses: {
          '201': { description: 'Listing rating created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListingRatingResponse' } } } },
          '400': { description: 'Invalid listing ID, rating or comment; cannot rate your own listing' },
          '401': { description: 'Missing or invalid access token' },
          '404': { description: 'Listing not found' },
          '409': { description: 'You have already rated this listing' }
        }
      }
    },
    '/api/notifications': {
      get: { tags: ['Notifications'], summary: 'Get my notifications', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Notifications with public actor details', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotificationsResponse' } } } } } }
    },
    '/api/notifications/read-all': {
      patch: { tags: ['Notifications'], summary: 'Mark all notifications as read', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Updated' } } }
    },
    '/api/notifications/{id}/read': {
      patch: { tags: ['Notifications'], summary: 'Mark one notification as read', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Updated notification with public actor details', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotificationResponse' } } } } } }
    },
    '/api/notifications/{id}': {
      delete: { tags: ['Notifications'], summary: 'Delete my notification', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '204': { description: 'Deleted' } } }
    }
  }
};

module.exports = swaggerSpec;
