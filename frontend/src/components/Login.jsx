import React, { useState, useContext, useEffect } from 'react'
import { navigate } from '@reach/router'
import { UserContext } from '../App'

const Login = () => {
  const [user, setUser] = useContext(UserContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    const result = await (await fetch('http://localhost:4000/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      }),
    })).json()

    if (result.accesstoken) {
      setUser({
        accesstoken: result.accesstoken
      })
      navigate('/')
    } else {
      console.log(result.error)
    }
  }

  const handleChange = e => {
    if (e.currentTarget.name === 'email') {
      setEmail(e.currentTarget.value)
    } else if (e.currentTarget.name === 'password') {
      setPassword(e.currentTarget.value)
    }
  }

  useEffect(() => {
    console.log(user)
  }, [user])

  return (
    <div className="login-wrapper">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="login-input">
          <input
            value={email}
            onChange={handleChange}
            type="text"
            name="email"
            placeholder="Email"
            autoComplete="email"
          />
          <input
            value={password}
            onChange={handleChange}
            type="text"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
          />
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  )
}

export default Login
