const jwt = require('jsonwebtoken');
const API_SECRET = process.env.API_SECRET_KEY;
const TOKEN_COOKIE_NAME = "FieldOfDreamsToken";

// Create your own secret key for the token here.
// In a real application, you will never hard-code this secret and you will
// definitely never commit it to version control, ever

exports.TokenMiddleware = (req, res, next) => {
  // We will look for the token in two places:
  // 1. A cookie in case of a browser
  // 2. The Authorization header in case of a different client
  let token = null;
  if(req.cookies[TOKEN_COOKIE_NAME]) { //We do have a cookie with a token
    token = req.cookies[TOKEN_COOKIE_NAME]; //Get token from cookie
  } else { //No cookie, so let's check Authorization header
    const authHeader = req.get('Authorization');
      if(authHeader && authHeader.startsWith("Bearer ")) {
      //Format should be "Bearer token" but we only need the token
      token = authHeader.split(" ")[1].trim();
    }
  }

  if(!token) {
    res.status(401).json({error: 'Not Authenticated'});
    return;
  }

  try {
    const payload = jwt.verify(token, API_SECRET);
    req.user = payload.user;
    next();
  } catch(error) {
    res.status(401).json({error: 'Not Authenticated'});
    return;
  }
}


exports.generateToken = (req, res, user) => {
  let payload = {
    user: user,
    exp: Math.floor(Date.now()/1000) + 3600
  }

  const token = jwt.sign(payload, API_SECRET);

  res.cookie(TOKEN_COOKIE_NAME, token, {
    secure: true,
    httpOnly: true,
    maxAge: 60 * 60 * 1000
  });
};


exports.removeToken = (req, res) => {
  res.cookie(TOKEN_COOKIE_NAME, '', {
    secure: true,
    httpOnly: true,
    maxAge: -1
  });
};

