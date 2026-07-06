import React, { createContext, useContext, useState, useCallback } from 'react'
import { storage } from '../services/storage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => storage.isAdmin())

  const login = useCallback(async (password) => {
    const success = await storage.loginAdmin(password)
    if (success) {
      setIsAdmin(true)
    }
    return success
  }, [])

  const logout = useCallback(() => {
    storage.logoutAdmin()
    setIsAdmin(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
