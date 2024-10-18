const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Protected Route - Requires Valid Access Token
app.get("/protected", authenticateToken, async (req, res) => {
  try {
    res.json({ message: "Welcome to the protected route!", user: req.user });
  } catch (error) {
    console.error("Error in /protected:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Middleware to Authenticate Access Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    // if (err) return res.status(403).json({ message: "Invalid token" });
    if (err) {
      if (err.name === "TokenExpiredError") {
        // Token has expired
        return res.status(401).json({
          tokenExpired: true,
          message: "Token expired",
          expiredAt: err.expiredAt, // Optionally send the expiry time
        });
      } else {
        // Other token verification errors
        return res.status(403).json({ message: "Invalid token" });
      }
    }

    req.user = user;
    next();
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
