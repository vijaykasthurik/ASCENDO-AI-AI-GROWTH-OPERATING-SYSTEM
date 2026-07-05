import { createContext, useContext, useState } from 'react'
import * as api from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.getStoredUser())

  const register = async (payload) => {
    const data = await api.register(payload)
    setUser(data.user)
    return data
  }

  const login = async (payload) => {
    const data = await api.login(payload)
    setUser(data.user)
    return data
  }

  const logout = () => {
    api.clearAuth()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
