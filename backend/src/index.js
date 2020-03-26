require('dotenv/config')
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { verify } = require('jsonwebtoken')
const { hash, compare } = require('bcryptjs')

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
    fakeDB.push({
      id: fakeDB.length,
      email,
      password: hashedPassword
    })
    res.send({ message: 'User Created' })
    console.log(fakeDB)
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.code });
  }
})

// Login

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`)
})
