### **Authentication vs Authorization**

1. **Authentication**:

   - **Definition**: The process of verifying the identity of a user or system.
   - **Purpose**: Ensures that the entity attempting to access a system or service is who they claim to be.
   - **Examples**: Logging in with a username and password, biometric scans (fingerprint, facial recognition), etc.
   - **Outcome**: If successful, the user is **authenticated** and recognized by the system.

2. **Authorization**:
   - **Definition**: The process of determining what resources or actions a user is permitted to access or perform after they have been authenticated.
   - **Purpose**: Controls access to resources based on the user’s permissions or roles.
   - **Examples**: Access control lists (ACLs), role-based access control (RBAC), determining whether a user can access certain files, perform an action (like `create`, `read`, `update`, or `delete`), etc.
   - **Outcome**: If authorized, the user can proceed with their intended action or access the requested resource.

### **Key Differences**:

- **Authentication** answers the question: **"Who are you?"**
- **Authorization** answers the question: **"What are you allowed to do?"**

---

### **What is JWT (JSON Web Token)?**

**JWT (JSON Web Token)** is an open standard (`RFC 7519`) used for securely transmitting information between parties as a JSON object. It is commonly used for **authentication** and **authorization** purposes in modern web applications.

#### **Structure of a JWT**:

A JWT is composed of three parts:

1. **Header**: Contains metadata about the token, such as the algorithm used for signing (e.g., `HS256`) and the type of token (`JWT`).
2. **Payload**: Contains the claims, or the actual data being transmitted. These claims are typically the user information (e.g., user ID, roles, etc.).
3. **Signature**: Ensures the token hasn’t been tampered with. It is generated by encoding the header and payload using a secret key or private key.

A typical JWT looks like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

---

### Understanding JWT and Its Usage

You can explore [this JWT Playground](https://jwt.io/) to see how each section of a JWT works. Just copy and paste a JWT there to examine the individual components:

---

### **Why the Signature Matters?**

The **Signature** ensures the integrity of the JWT. It is generated using the **Header** and **Payload** along with a **secret key**. If someone tampers with the Header or Payload, the signature will no longer match when verified, making the token invalid.

You can see this behavior in the playground—if you modify any part of the Header or Payload, the Signature will change, and the token becomes unverifiable.

#### **How the Secret Key Protects the JWT?**

The **secret key** is crucial because it ensures that only the server (or trusted servers) can validate the token. If an attacker gains access to your secret key, they could forge tokens. However, as long as the **secret key** is securely stored on the server and never exposed to the outside world, this risk is mitigated.

---

### **JWT in Load Balancing Scenarios**

In **JWT-based authentication systems**, load balancing can become seamless.

For example, consider a **banking system** that runs multiple servers. If the servers share the **same secret key**, a user does **not need to log in again** when switching between different servers.

Since all servers can verify the **JWT signature** using the same secret key, they can trust the token without requiring additional login steps. This enables smooth, secure session management across multiple servers.

---

### **JWT Workflow: Authentication and Authorization**

<p align="center">
    <img src="architecture.png" alt="jwt architechture" width="300">
</p>

**A diagram depicting JWT architecture (on right)**

#### **1. User Login and Token Issuance**

- **User Action**: The user sends their login credentials (e.g., username and password) to the authentication server via a POST request.

  ```http
  POST /login HTTP/1.1
  Content-Type: application/json

  {
    "username": "john_doe",
    "password": "mypassword"
  }
  ```

- **Server Validation**: The server checks if the credentials are correct.

- **JWT Creation**: If valid, the server **generates a JWT** containing the user’s information (such as user ID and roles) in the payload. The server **signs the token** using a secret key.

  Example of a **JWT Payload**:

  ```json
  {
    "sub": "1234567890",
    "name": "John Doe",
    "role": "admin",
    "iat": 1516239022
  }
  ```

  **Generated JWT** (Header.Payload.Signature):

  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
  ```

- **Response to Client**: The server sends the generated JWT back to the client.

  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "token": "<jwt_token_here>"
  }
  ```

---

#### **2. Client Stores the JWT**

- The client (browser or mobile app) stores the JWT. Common storage options include:
  - **Local storage** (`localStorage` in browsers).
  - **Cookies** (for web apps).
  - **Memory** (for short-lived tokens).

---

#### **3. Making Authenticated Requests**

- For every subsequent request to a **protected resource**, the client sends the JWT along with the request, usually in the `Authorization` header.
  ```http
  GET /dashboard HTTP/1.1
  Host: example.com
  Authorization: Bearer <jwt_token_here>
  ```

---

#### **4. Server Validates the JWT**

- **Decoding the Token**: The server receives the JWT and extracts its **header**, **payload**, and **signature**.
- **Signature Validation**: The server uses the **same secret key** (or a public key, for asymmetric encryption) to **validate the token's signature**. If the signature doesn’t match, the token is rejected.
- **Expiry Check**: The server checks the `iat` (issued at) and `exp` (expiry) claims to ensure the token is still valid.

  Example Payload with Expiry Claim:

  ```json
  {
    "sub": "1234567890",
    "name": "John Doe",
    "role": "admin",
    "iat": 1516239022,
    "exp": 1516242622
  }
  ```

---

#### **5. Granting or Denying Access**

- **If Valid**: The server grants access to the requested resource.
- **If Invalid** (e.g., token expired or tampered with): The server sends a `401 Unauthorized` response.

#### **Use of JWT in Authorization**:

- JWT can also include claims that represent **roles** or **permissions**.
- The server checks these claims to determine what resources or actions the user is **authorized** to access.

  Example JWT payload with roles:

  ```json
  {
    "sub": "1234567890",
    "name": "John Doe",
    "role": "admin",
    "iat": 1516239022
  }
  ```

In this case, the role claim can be used to authorize the user for administrative actions.

---

#### **6. Token Expiry and Refresh Tokens**

- **Short-Lived JWTs**: JWTs often have short lifetimes (e.g., 15 minutes) to limit risks if they are stolen.
- **Refresh Tokens**: To maintain the user session, a **refresh token** is issued alongside the JWT. When the JWT expires, the client uses the refresh token to obtain a new JWT.

  **Example Flow for Refresh Tokens**:

  - Client sends the refresh token to the server.
  - Server validates the refresh token and returns a new JWT.

---

### **How JWT is Secured**

1. **Signature Verification**:

   - The JWT signature ensures the token hasn’t been tampered with. If the server detects any changes to the token, it will reject it.

   **Signing Algorithms**:

   - Symmetric: HMAC (e.g., `HS256`), using a shared secret.
   - Asymmetric: RSA (e.g., `RS256`), using a private/public key pair.

2. **HTTPS**:

   - JWTs should be transmitted over **HTTPS** to prevent eavesdropping and MITM attacks.

3. **Expiration Claims**:
   - The `exp` claim ensures tokens are only valid for a limited time.

---

### **Summary**

- **JWT Creation**: Server generates a JWT after user authentication.
- **JWT Storage**: Client stores the token and sends it with each request to protected resources.
- **Token Validation**: Server validates the token and grants or denies access based on the token’s validity.
- **Stateless**: JWTs are **stateless**, meaning the server doesn’t need to maintain session data.

JWTs are widely used in **modern web applications** for both **authentication** (verifying identity) and **authorization** (controlling access based on roles or permissions). They enable **stateless, secure communication** between the client and server.

Let me know if you need further clarification or examples!
