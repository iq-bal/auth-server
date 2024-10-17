const bcrypt = require("bcryptjs");

// Simulate a user database
const users = [
  {
    id: 1,
    username: "john",
    password: bcrypt.hashSync("password123", 10), // Hashed password
  },
];

// Function to find user by username
const findUser = (username) => users.find((user) => user.username === username);

module.exports = { users, findUser };
