const express = require("express");
const {
  getUsers,
  getUser,
  updateProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getUsers);
router.get("/:id", getUser);
router.put("/me", updateProfile);

module.exports = router;
