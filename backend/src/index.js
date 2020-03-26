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
    res.status(500).json({ error: err.message })
  }
})

app.post('/logout', async (req, res) => {

})

app.post('/protected', async (req, res) => {

})

app.post('/refresh_token', (req, res) => {

})

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`)
})
