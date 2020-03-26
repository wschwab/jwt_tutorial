const { sign } = require('jsonwebtoken')

const createAccessToken = userId => {
  return sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m'
  })
}

const createRefreshToken = userId => {
  return sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d'
  })
}

const sendAccessToken = (req, res, accesstoken) => {
  res.send({
    accesstoken,
    email: req.body.email
  })
}

// would want the token to have a more obfuscated name in production
const sendRefreshToken = (res, token) => {
  res.cookie('refreshtoken', token, {
    httpOnly: true,
    path: '/refresh_token'
  })
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken
}
