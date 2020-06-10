const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const userControllers = require("../controllers/users-controller");
const fileUpload = require("../middlerware/file-upload");
router.get("/", userControllers.getUsers);

router.post(
  "/signup",
  fileUpload.single('image'),
  [
    check("name").not().isEmpty(),
    check("email")
      .normalizeEmail() 
      .isEmail(),
    check("password").isLength({ min: 5 }),
  ],
  userControllers.signup
);
router.post("/login", userControllers.login);
module.exports = router;
