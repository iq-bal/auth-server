# Authentication and Authorization API Documentation

## Overview

This project implements two Node.js servers: one for **authentication** (`authServer`) and another for normal protected routes. The servers use **JWT (JSON Web Tokens)** for authentication and authorization, enabling secure access to protected resources. The API includes features like user registration, login, access token generation, refresh token generation, token-based protection of routes, and user logout. 

### Key Features:
- Access tokens with short expiration times for security.
- Refresh tokens for renewing access tokens without re-authenticating users.
- Middleware for protecting routes using access tokens.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Auth Server Endpoints](#auth-server-endpoints)
  - [Register a User](#register-a-user)
  - [Login](#login)
  - [Generate New Access Token](#generate-new-access-token)
  - [Logout](#logout)
- [Normal Server Endpoints](#normal-server-endpoints)
  - [Protected Route](#protected-route)
- [Middleware](#middleware)
  - [Authenticate Token](#authenticate-token)

## Environment Variables

Both servers require the following environment variables. Set these up in a `.env` file.

```plaintext
ACCESS_TOKEN_SECRET=youraccesstokensecrethere
REFRESH_TOKEN_SECRET=yourrefreshtokensecrethere
ACCESS_TOKEN_LIFETIME=15s  # Lifetime of the access token (e.g., 15 seconds)
REFRESH_TOKEN_LIFETIME=7d   # Lifetime of the refresh token (e.g., 7 days)
PORT=4000                   # Port for the normal server (optional)
AUTH_SERVER_PORT=6000        # Port for the auth server (optional)
```

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo-url.git
   ```

2. Navigate to the project directory:

   ```bash
   cd your-project-directory
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Set up the environment variables in a `.env` file as described above.

5. Start the authentication server:
   ```bash
   npm run authServer
   ```

6. Start the normal server:
   ```bash
   npm run normalServer
   ```

By default:
- The authentication server will run on `http://localhost:6000`.
- The normal server will run on `http://localhost:4000`.

---

## Auth Server Endpoints

These endpoints manage user authentication and token generation.

### 1. Register a User

**Endpoint**: `POST /register`

Registers a new user with a `username` and `password`. The password is hashed using `bcryptjs`.

- **Request Body**:

  ```json
  {
    "username": "yourUsername",
    "password": "yourPassword"
  }
  ```

- **Responses**:
  - `201`: User registered successfully
  - `400`: User already exists
  - `500`: Internal server error

### 2. Login

**Endpoint**: `POST /login`

Authenticates a user and returns an access token and a refresh token.

- **Request Body**:

  ```json
  {
    "username": "yourUsername",
    "password": "yourPassword"
  }
  ```

- **Responses**:
  - `200`: Returns `accessToken` and `refreshToken`:
    ```json
    {
      "accessToken": "yourAccessToken",
      "refreshToken": "yourRefreshToken"
    }
    ```
  - `401`: Invalid credentials
  - `500`: Internal server error

### 3. Generate New Access Token

**Endpoint**: `POST /token`

Uses the refresh token to generate a new access token.

- **Request Body**:

  ```json
  {
    "refreshToken": "yourRefreshToken"
  }
  ```

- **Responses**:
  - `200`: Returns a new `accessToken`:
    ```json
    {
      "accessToken": "yourNewAccessToken"
    }
    ```
  - `403`: Invalid refresh token
  - `500`: Internal server error

### 4. Logout

**Endpoint**: `DELETE /logout`

Invalidates the refresh token to log the user out.

- **Request Body**:

  ```json
  {
    "refreshToken": "yourRefreshToken"
  }
  ```

- **Responses**:
  - `200`: Logged out successfully
  - `404`: Refresh token not found
  - `500`: Internal server error

---

## Normal Server Endpoints

This server handles routes that require token-based authentication.

### 1. Protected Route

**Endpoint**: `GET /protected`

Accesses a protected route that requires a valid access token. This route demonstrates how access tokens protect certain endpoints.

- **Request Headers**:

  ```plaintext
  Authorization: Bearer yourAccessToken
  ```

- **Responses**:
  - `200`: Returns a success message and user information:
    ```json
    {
      "message": "Welcome to the protected route!",
      "user": {
        "id": 1,
        "username": "yourUsername"
      }
    }
    ```
  - `401`: Token required
  - `403`: Invalid token
  - `500`: Internal server error

---

## Middleware

### Authenticate Token

The `authenticateToken` middleware is used to protect routes by ensuring the presence and validity of an access token. It extracts the token from the `Authorization` header, verifies it, and allows access to protected routes if valid.

```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = user;
    next();
  });
}
```

If the token is valid, the user's information (decoded from the token) is stored in `req.user`, which can be accessed by the route handler.

---

## Conclusion

This project implements two servers that work together to provide secure JWT-based authentication and authorization. The **auth server** handles user registration, login, and token management, while the **normal server** demonstrates how to protect specific routes using access tokens. With short-lived access tokens and long-lived refresh tokens, the system balances security and usability.
