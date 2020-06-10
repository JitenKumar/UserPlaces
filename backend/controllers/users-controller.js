const HttpError = require("../models/http-errors");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users-schema");
const SECRET_KEY = "JITEN_SECRET_KEY";
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};
const signup = async (req, res, next) => {
  //console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (e) {
    const error = new HttpError("Sign Up Failed,Please try Later1", 500);
    return next(error);
  }
  if (existingUser) {
    const error = new HttpError("Entered Emaild Already Exists", 422);
    return next(error);
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Sign Up Failed,Please try Later", 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });
  //console.log(createdUser);
  try {
    await createdUser.save();
  } catch (e) {
    //console.log(e);
    const error = new HttpError("Sign Up Failed,Please try Later", 500);
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Sign Up Failed,Please try Later", 500);
    return next(error);
  }
  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};
const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (e) {
    const error = new HttpError("No User find with this Email", 500);
    return next(error);
  }
  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }
  let isValidPassword;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      500
    );
    return next(error);
  }
  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Login Failed,Please try Later", 500);
    return next(error);
  }
  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
