const HttpError = require("../models/http-errors");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "JITEN_SECRET_KEY";
module.exports = (req, res, next) => {
  if(req.method==='OPTIONS'){
      return next();
  }
  try {
    //console.log("Token Check");
    const token = req.headers.authorization.split(" ")[1]; // token  = 'Bearer TOKEN'
    //console.log(token);
    if (!token) {
      throw new Error("Authorization Failed");
    }
    const decodedToken = jwt.verify(token, SECRET_KEY);
    //console.log(decodedToken);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError("Authorization Failed", 403);
    return next(error);
  }
};
