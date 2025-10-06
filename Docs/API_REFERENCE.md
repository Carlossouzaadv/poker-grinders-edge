# API Reference - Poker Grinder's Edge

Complete API documentation for the Poker Grinder's Edge NestJS backend. This RESTful API provides endpoints for authentication, session management, hand history analysis, and more.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Sessions](#sessions-endpoints)
  - [Hand History](#hand-history-endpoints)
  - [User Profile](#user-profile-endpoints)
  - [Health Check](#health-check-endpoints)

---

## Base URL

```
Development: http://localhost:3000
Production: https://api.pokergrindersedge.com
```

All endpoints are prefixed with the base URL.

---

## Authentication

Most endpoints require authentication via JWT (JSON Web Token).

### Authentication Flow

1. **Register** or **Login** to receive tokens
2. Include `access_token` in `Authorization` header for authenticated requests
3. Use `refresh_token` to get new access token when it expires

### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Token Expiration

- **Access Token**: 7 days (configurable via `JWT_EXPIRES_IN`)
- **Refresh Token**: 30 days (configurable via `JWT_REFRESH_EXPIRES_IN`)

---

## Error Handling

All errors follow a consistent format:

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2023-10-02T14:30:00.000Z",
  "path": "/api/sessions"
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour

Rate limit headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1696258800
```

---

## Endpoints

---

## Authentication Endpoints

### Register New User

Create a new user account.

**Endpoint**: `POST /auth/register`

**Authentication**: Not required

**Request Body**:

```json
{
  "email": "player@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"  // Optional
}
```

**Validation Rules**:
- `email`: Must be valid email format, unique
- `password`: Minimum 6 characters
- `firstName`: Required, not empty
- `lastName`: Required, not empty
- `phone`: Optional, valid phone format

**Success Response** (201 Created):

```json
{
  "user": {
    "id": "cm2abc123xyz",
    "email": "player@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "PLAYER",
    "plan": "FREE",
    "createdAt": "2023-10-02T14:30:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:

```json
// 409 Conflict - Email already exists
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

```json
// 400 Bad Request - Invalid data
{
  "statusCode": 400,
  "message": ["password must be at least 6 characters"],
  "error": "Bad Request"
}
```

---

### Login

Authenticate existing user and receive tokens.

**Endpoint**: `POST /auth/login`

**Authentication**: Not required

**Request Body**:

```json
{
  "email": "player@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response** (200 OK):

```json
{
  "user": {
    "id": "cm2abc123xyz",
    "email": "player@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "PLAYER",
    "plan": "FREE",
    "sessionCount": 5,
    "dailyTrainerHands": 10
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:

```json
// 401 Unauthorized - Invalid credentials
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

### Refresh Token

Get new access token using refresh token.

**Endpoint**: `POST /auth/refresh`

**Authentication**: Not required (uses refresh token)

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200 OK):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:

```json
// 401 Unauthorized - Invalid or expired refresh token
{
  "statusCode": 401,
  "message": "Invalid refresh token",
  "error": "Unauthorized"
}
```

---

### Logout

Invalidate refresh token (logout user).

**Endpoint**: `POST /auth/logout`

**Authentication**: Not required

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200 OK):

```json
{
  "message": "Logged out successfully"
}
```

---

### Get Profile

Get authenticated user's profile information.

**Endpoint**: `GET /auth/profile`

**Authentication**: Required

**Headers**:
```http
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):

```json
{
  "user": {
    "id": "cm2abc123xyz",
    "email": "player@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "PLAYER",
    "plan": "PRO",
    "sessionCount": 42,
    "dailyTrainerHands": 50,
    "createdAt": "2023-10-02T14:30:00.000Z",
    "updatedAt": "2023-10-05T10:15:00.000Z"
  }
}
```

---

## Sessions Endpoints

Manage poker playing sessions (Cash Games and Tournaments).

### Create Session

Create a new poker session.

**Endpoint**: `POST /sessions`

**Authentication**: Required

**Request Body** (Cash Game):

```json
{
  "gameType": "CASH",
  "location": "PokerStars",
  "buyIn": 100.00,
  "cashOut": 175.50,
  "notes": "Good session, played well",
  "tags": ["online", "profitable"]
}
```

**Request Body** (Tournament):

```json
{
  "gameType": "TOURNAMENT",
  "tournamentName": "Sunday Million",
  "location": "PokerStars",
  "buyIn": 50.00,
  "rebuys": 1,
  "addOns": 1,
  "prize": 500.00,
  "bounties": 75.00,
  "notes": "Finished 15th",
  "tags": ["tournament", "mtt"]
}
```

**Field Descriptions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| gameType | enum | Yes | "CASH", "TOURNAMENT", or "SIT_AND_GO" |
| location | string | No | Where game was played |
| buyIn | decimal | Yes (CASH) | Buy-in amount |
| cashOut | decimal | Yes (CASH) | Cash-out amount |
| tournamentName | string | No | Tournament name |
| rebuys | integer | No | Number of rebuys |
| addOns | integer | No | Number of add-ons |
| prize | decimal | No | Prize money won |
| bounties | decimal | No | Bounty money collected |
| notes | string | No | Session notes |
| tags | string[] | No | Tags for filtering |

**Success Response** (201 Created):

```json
{
  "id": "cm2session123",
  "userId": "cm2abc123xyz",
  "gameType": "CASH",
  "location": "PokerStars",
  "status": "COMPLETED",
  "startTime": "2023-10-02T14:30:00.000Z",
  "endTime": "2023-10-02T18:45:00.000Z",
  "duration": 255,
  "buyIn": "100.00",
  "cashOut": "175.50",
  "result": "75.50",
  "roi": 75.50,
  "notes": "Good session, played well",
  "tags": ["online", "profitable"],
  "createdAt": "2023-10-02T18:45:00.000Z",
  "updatedAt": "2023-10-02T18:45:00.000Z"
}
```

**Calculated Fields**:
- `result`: Profit/loss (cashOut - buyIn for cash games)
- `roi`: Return on investment percentage
- `duration`: Session duration in minutes

**Error Responses**:

```json
// 400 Bad Request - Invalid data
{
  "statusCode": 400,
  "message": ["buyIn must be a positive number"],
  "error": "Bad Request"
}
```

```json
// 403 Forbidden - Free plan limit reached
{
  "statusCode": 403,
  "message": "Free plan limited to 20 sessions. Please upgrade to PRO.",
  "error": "Forbidden"
}
```

---

### Get All Sessions

List all sessions for authenticated user.

**Endpoint**: `GET /sessions`

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| gameType | enum | Filter by CASH, TOURNAMENT, SIT_AND_GO |
| location | string | Filter by location |
| startDate | ISO date | Sessions after this date |
| endDate | ISO date | Sessions before this date |
| limit | integer | Max results (default: 50) |
| offset | integer | Pagination offset (default: 0) |

**Example Request**:
```http
GET /sessions?gameType=CASH&location=PokerStars&limit=10
```

**Success Response** (200 OK):

```json
{
  "sessions": [
    {
      "id": "cm2session123",
      "gameType": "CASH",
      "location": "PokerStars",
      "startTime": "2023-10-02T14:30:00.000Z",
      "endTime": "2023-10-02T18:45:00.000Z",
      "buyIn": "100.00",
      "cashOut": "175.50",
      "result": "75.50",
      "roi": 75.50
    },
    // ... more sessions
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

---

### Get Session by ID

Get details of a specific session.

**Endpoint**: `GET /sessions/:id`

**Authentication**: Required

**Success Response** (200 OK):

```json
{
  "id": "cm2session123",
  "userId": "cm2abc123xyz",
  "gameType": "TOURNAMENT",
  "tournamentName": "Sunday Million",
  "location": "PokerStars",
  "status": "COMPLETED",
  "startTime": "2023-10-02T14:00:00.000Z",
  "endTime": "2023-10-02T22:30:00.000Z",
  "duration": 510,
  "buyIn": "50.00",
  "rebuys": 1,
  "addOns": 1,
  "prize": "500.00",
  "bounties": "75.00",
  "result": "425.00",
  "roi": 283.33,
  "notes": "Finished 15th",
  "tags": ["tournament", "mtt"],
  "hands": [],
  "createdAt": "2023-10-02T22:30:00.000Z",
  "updatedAt": "2023-10-02T22:30:00.000Z"
}
```

**Error Responses**:

```json
// 404 Not Found
{
  "statusCode": 404,
  "message": "Session not found",
  "error": "Not Found"
}
```

```json
// 403 Forbidden - Not session owner
{
  "statusCode": 403,
  "message": "You do not have access to this session",
  "error": "Forbidden"
}
```

---

### Update Session

Update session details.

**Endpoint**: `PATCH /sessions/:id`

**Authentication**: Required

**Request Body** (partial update):

```json
{
  "cashOut": 200.00,
  "notes": "Updated notes",
  "tags": ["online", "profitable", "long-session"]
}
```

**Success Response** (200 OK):

```json
{
  "id": "cm2session123",
  "cashOut": "200.00",
  "result": "100.00",
  "notes": "Updated notes",
  "tags": ["online", "profitable", "long-session"],
  "updatedAt": "2023-10-02T19:00:00.000Z"
}
```

---

### Delete Session

Delete a session.

**Endpoint**: `DELETE /sessions/:id`

**Authentication**: Required

**Success Response** (200 OK):

```json
{
  "message": "Session deleted successfully"
}
```

---

### Get User Statistics

Get aggregate statistics for authenticated user.

**Endpoint**: `GET /sessions/user/:userId/stats`

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | ISO date | Stats from this date |
| endDate | ISO date | Stats until this date |
| gameType | enum | Filter by game type |

**Success Response** (200 OK):

```json
{
  "totalSessions": 42,
  "totalProfit": 1250.50,
  "totalBuyIn": 5000.00,
  "totalCashOut": 6250.50,
  "avgProfit": 29.77,
  "winRate": 66.67,
  "roi": 25.01,
  "byGameType": {
    "CASH": {
      "sessions": 30,
      "profit": 800.00,
      "winRate": 70.00
    },
    "TOURNAMENT": {
      "sessions": 12,
      "profit": 450.50,
      "winRate": 58.33
    }
  },
  "recentSessions": [
    // Last 5 sessions
  ]
}
```

---

## Hand History Endpoints

Manage hand history sessions (uploaded .txt files from poker sites).

### Upload Hand History

Upload and parse a hand history file.

**Endpoint**: `POST /hand-history-sessions/upload`

**Authentication**: Required

**Request Body**:

```json
{
  "rawHandHistory": "PokerStars Hand #123456789:  Hold'em No Limit ($0.25/$0.50 USD)...",
  "name": "Cash Session 2023-10-02",
  "siteFormat": "PokerStars"
}
```

**Field Descriptions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rawHandHistory | string | Yes | Complete hand history text |
| name | string | No | Custom session name |
| siteFormat | string | No | "PokerStars", "GGPoker", "PartyPoker" (auto-detected if omitted) |

**Success Response** (201 Created):

```json
{
  "id": "cm2hhs123",
  "name": "Cash Session 2023-10-02",
  "siteFormat": "PokerStars",
  "totalHands": 45,
  "createdAt": "2023-10-02T14:30:00.000Z",
  "firstHand": {
    "handId": "123456789",
    "gameType": "CASH",
    "stakes": {
      "sb": 0.25,
      "bb": 0.50
    },
    "players": [
      {
        "name": "Hero",
        "seat": 1,
        "stack": 50.00
      }
    ],
    "board": ["Ah", "Kd", "7c", "3s", "2h"],
    "pot": 125.50
  }
}
```

**Error Responses**:

```json
// 400 Bad Request - Parsing failed
{
  "statusCode": 400,
  "message": "Failed to parse hand history: Invalid format detected",
  "error": "Bad Request",
  "details": {
    "rawLength": 5000,
    "siteFormat": "Unknown",
    "suggestions": [
      "Check if the file format is correct",
      "Ensure the file is not empty",
      "Try specifying the poker site explicitly"
    ]
  }
}
```

---

### List Hand History Sessions

Get all hand history sessions for authenticated user.

**Endpoint**: `GET /hand-history-sessions`

**Authentication**: Required

**Success Response** (200 OK):

```json
{
  "sessions": [
    {
      "id": "cm2hhs123",
      "name": "Cash Session 2023-10-02",
      "siteFormat": "PokerStars",
      "totalHands": 45,
      "createdAt": "2023-10-02T14:30:00.000Z"
    },
    {
      "id": "cm2hhs456",
      "name": "Tournament Session",
      "siteFormat": "GGPoker",
      "totalHands": 120,
      "createdAt": "2023-10-01T18:00:00.000Z"
    }
  ],
  "total": 2
}
```

---

### Get Hand by Index

Retrieve a specific hand from a session.

**Endpoint**: `GET /hand-history-sessions/:sessionId/hands/:handIndex`

**Authentication**: Required

**Path Parameters**:
- `sessionId`: Session ID (string)
- `handIndex`: Hand index (integer, 0-based)

**Example Request**:
```http
GET /hand-history-sessions/cm2hhs123/hands/5
```

**Success Response** (200 OK):

```json
{
  "id": "cm2hand789",
  "handIndex": 5,
  "sessionId": "cm2hhs123",
  "parsedData": {
    "handId": "123456789",
    "site": "PokerStars",
    "gameType": "CASH",
    "variant": "NLHE",
    "stakes": {
      "sb": 0.25,
      "bb": 0.50,
      "currency": "USD"
    },
    "date": "2023-10-02T14:35:00.000Z",
    "tableName": "Table 'Aurora' 6-max",
    "button": 1,
    "players": [
      {
        "name": "Hero",
        "seat": 1,
        "stack": 50.00,
        "isButton": true
      },
      {
        "name": "Villain1",
        "seat": 2,
        "stack": 100.00,
        "isButton": false
      }
    ],
    "streets": {
      "preflop": {
        "actions": [
          {
            "playerName": "Hero",
            "action": "RAISE",
            "amount": 1.50,
            "totalBet": 1.50
          },
          {
            "playerName": "Villain1",
            "action": "CALL",
            "amount": 1.50,
            "totalBet": 1.50
          }
        ]
      },
      "flop": {
        "board": ["Ah", "Kd", "7c"],
        "actions": [
          {
            "playerName": "Hero",
            "action": "BET",
            "amount": 2.50,
            "totalBet": 4.00
          },
          {
            "playerName": "Villain1",
            "action": "CALL",
            "amount": 2.50,
            "totalBet": 4.00
          }
        ]
      },
      "turn": {
        "board": ["Ah", "Kd", "7c", "3s"],
        "actions": []
      },
      "river": {
        "board": ["Ah", "Kd", "7c", "3s", "2h"],
        "actions": []
      }
    },
    "showdown": {
      "players": [
        {
          "name": "Hero",
          "cards": ["As", "Ks"],
          "handRank": "Two Pair",
          "won": true,
          "amount": 8.00
        }
      ]
    },
    "totalPot": 8.50,
    "rake": 0.50,
    "winner": "Hero"
  }
}
```

**Error Responses**:

```json
// 400 Bad Request - Invalid hand index
{
  "statusCode": 400,
  "message": "Invalid hand index. Must be between 0 and 44",
  "error": "Bad Request"
}
```

```json
// 404 Not Found - Hand not found
{
  "statusCode": 404,
  "message": "Hand not found",
  "error": "Not Found"
}
```

---

### Delete Hand History Session

Delete a hand history session and all its hands.

**Endpoint**: `DELETE /hand-history-sessions/:sessionId`

**Authentication**: Required

**Success Response** (200 OK):

```json
{
  "message": "Session deleted successfully"
}
```

---

## User Profile Endpoints

### Update User Profile

Update authenticated user's profile.

**Endpoint**: `PATCH /users/profile`

**Authentication**: Required

**Request Body**:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Success Response** (200 OK):

```json
{
  "id": "cm2abc123xyz",
  "email": "player@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "updatedAt": "2023-10-02T15:00:00.000Z"
}
```

---

### Upgrade to PRO Plan

Upgrade user's subscription plan.

**Endpoint**: `POST /users/upgrade`

**Authentication**: Required

**Request Body**:

```json
{
  "plan": "PRO",
  "paymentMethod": "stripe",
  "paymentToken": "tok_visa_123"
}
```

**Success Response** (200 OK):

```json
{
  "user": {
    "id": "cm2abc123xyz",
    "plan": "PRO",
    "updatedAt": "2023-10-02T15:00:00.000Z"
  },
  "subscription": {
    "id": "sub_123",
    "status": "active",
    "currentPeriodEnd": "2023-11-02T15:00:00.000Z"
  }
}
```

---

## Health Check Endpoints

### Health Check

Check API and database health.

**Endpoint**: `GET /health`

**Authentication**: Not required

**Success Response** (200 OK):

```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2023-10-02T15:00:00.000Z",
  "uptime": 86400
}
```

**Unhealthy Response** (503 Service Unavailable):

```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "Can't reach database server",
  "timestamp": "2023-10-02T15:00:00.000Z"
}
```

---

## Webhook Endpoints

### Stripe Webhook

Handle Stripe payment events (internal use).

**Endpoint**: `POST /webhooks/stripe`

**Authentication**: Stripe signature verification

**This endpoint is for internal use only.**

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters**:
- `limit`: Number of results per page (default: 50, max: 100)
- `offset`: Number of results to skip (default: 0)

**Response Format**:

```json
{
  "data": [ /* ... */ ],
  "total": 150,
  "limit": 50,
  "offset": 0,
  "hasMore": true
}
```

---

## Filtering and Sorting

### Filtering

Use query parameters to filter results:

```http
GET /sessions?gameType=CASH&location=PokerStars&minProfit=100
```

### Sorting

Use `sortBy` and `order` parameters:

```http
GET /sessions?sortBy=createdAt&order=desc
```

**Available sort fields**:
- `createdAt`
- `startTime`
- `result`
- `roi`

**Order**:
- `asc`: Ascending
- `desc`: Descending (default)

---

## Versioning

The API uses URL versioning. Current version: `v1`

```http
GET /v1/sessions
```

Breaking changes will result in a new version (`v2`, etc.). Old versions will be supported for at least 6 months after deprecation notice.

---

## SDK / Client Libraries

Official client libraries (coming soon):

- JavaScript/TypeScript
- React Native
- Python
- Java

---

## Postman Collection

Import the Postman collection for easy API testing:

```
https://api.pokergrindersedge.com/postman/collection.json
```

---

**Last Updated**: October 2025
**Version**: 1.0.0
