const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { findUser, users } = require("./users");
dotenv.config();
const app = express();
app.use(express.json());

const refreshTokens = []; // Temporary storage for refresh tokens

// Generate Access Token
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_LIFETIME,
    }
  );
}

// Generate Refresh Token
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_LIFETIME,
    }
  );
}

// Register Route - Create a New User
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    if (findUser(username)) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password asynchronously
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user and add to the simulated user database
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
    };
    users.push(newUser);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login Route - Generate Access and Refresh Tokens
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = findUser(username);

    // Check if user exists and password matches
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Error in /login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Refresh Token Route - Get a New Access Token
app.post("/token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || !refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err)
        return res.status(403).json({ message: "Invalid refresh token" });

      const newAccessToken = generateAccessToken({
        id: user.id,
        username: user.username,
      });
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Error in /token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Protected Route - Requires Valid Access Token
app.get("/protected", authenticateToken, async (req, res) => {
  try {
    res.json({ message: "Welcome to the protected route!", user: req.user });
  } catch (error) {
    console.error("Error in /protected:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout Route - Invalidate Refresh Token (DELETE Request)
app.delete("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Check if the token exists in the stored refresh tokens
    const index = refreshTokens.indexOf(refreshToken);
    if (index === -1) {
      return res.status(404).json({ message: "Refresh token not found" });
    }

    // Remove the refresh token from the list
    refreshTokens.splice(index, 1);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in /logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Middleware to Authenticate Access Token
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
