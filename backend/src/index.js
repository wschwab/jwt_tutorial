require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { verify } = require('jsonwebtoken')
const { hash, compare } = require('bcryptjs')

const {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken
} = require('./tokens')

const { fakeDB } = require('./fakeDB')
const { isAuth } = require('./isAuth')

const app = express()

app.use(cookieParser())

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
)

// Read body data in JSON or URL
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Register
app.post('/register', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = fakeDB.find(user => user.email === email)
    if (user) return res.status(400).json({ body: 'User already exists'})
    const hashedPassword = await hash(password, 10)
    // this only stores ephemerally - will be wiped each session
    fakeDB.push({
      id: fakeDB.length,
      email,
      password: hashedPassword
    })
    res.status(201).json({ body: 'User Created' })
    console.log(fakeDB)
  } catch (err) {
    console.error(err)
      res.status(500).json({ error: err.message });
  }
})

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = fakeDB.find(user => user.email === email)
    if (!user) return res.status(400).json({ body: 'User does not exist'})
    const valid = await compare(password, user.password)
    if (!valid) return res.status(400).json({ body: 'Invalid username or password'})
    // create refresh and access tokens
    const accesstoken = createAccessToken(user.id)
    const refreshtoken = createRefreshToken(user.id)
    user.refreshtoken = refreshtoken
    console.log(fakeDB)
    sendRefreshToken(res, refreshtoken)
    sendAccessToken(req, res, accesstoken)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/logout', async (req, res) => {
  res.clearCookie('refreshtoken', { path: '/refresh_token' })
  return res.status(200).json({ body: "Successful logout"})
})

app.post('/protected', async (req, res) => {
  try {
      const userId = isAuth(req)
      if (userId !== null) {
        res.send({
          data: 'This is the protected data'
        })
      }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/refresh_token', (req, res) => {
  const token = req.cookies.refreshtoken
  // not sure if this chaining works, if there are problems, it's probably the chained .send() at the end
  if (!token) return res.status(400).json({ error: "no token to refresh"}).send({ accesstoken: '' })
  let payload = null
  // verify token
  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message }).send({ accesstoken: '' })
  }
  // verify user in token matches a user
  const user = fakeDB.find(user => user.id === payload.userId)
  if (!user) return res.status(400).json({ error: "token id does not match any user"}).send({ accesstoken: '' })
  // verify user's token matches supplied token
  if (user.refreshtoken != token) {
    return res.status(400).json({ error: "Invalid token"}).send({ accesstoken: '' })
  }
  // create new refresh and access tokens
  const accesstoken = createAccessToken(user.id)
  const refreshtoken = createRefreshToken(user.id)
  user.refreshtoken = refreshtoken
  sendRefreshToken(res, refreshtoken)
  return res.send({ accesstoken })
})

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`)
})
