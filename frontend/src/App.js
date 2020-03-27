import React, { createContext, useState, useEffect } from 'react';
import { Router, navigate } from '@reach/router'

import Navigation from './Navigation'
import Login from './Login'
import Register from './Register'
import Protected from './Protected'
import Content from './Content'

export const UserContext = createContext([])

function App() {
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)

  const logoutCallback = async () => {

  }

  useEffect(() => {

  }, [])

  return (
    <UserContext.Provider value={[user, setUser]}>
      <div className="App">
        <Navigation logoutCallback={logoutCallback} />
        <Router id="router">
          <Login path="login" />
          <Register path="register" />
          <Protected path="protected" />
          <Content path="/" />
        </Router>
      </div>
    </UserContext.Provider>
  );
}

export default App;
