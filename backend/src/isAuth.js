const { verify } = require('jsonwebtoken')

exports.isAuth = req => {
  const authorization = req.headers['authorization']
  if (!authorization) return res.status(400).json({ error: "You are not logged in"})
  const token = authorization.split(' ')[1] // get rid of Bearer
  const { userId } = verify(token, process.env.ACCESS_TOKEN_SECRET)
  return userId
}
