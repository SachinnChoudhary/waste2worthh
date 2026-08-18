import React, { createContext, useContext, useState, useEffect } from 'react'
import { ClerkProvider, useUser, useClerk, SignedIn, SignedOut, UserButton, SignIn, SignUp } from '@clerk/clerk-react'
import { api } from './api'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''
export const isClerkConfigured = Boolean(CLERK_PUBLISHABLE_KEY && CLERK_PUBLISHABLE_KEY.startsWith('pk_'))

const AuthContext = createContext({
  user: null,
  role: 'seller',
  setRole: () => {},
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
})

export function useWasteAuth() {
  return useContext(AuthContext)
}

function MockAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('w2w_user')
    return saved ? JSON.parse(saved) : {
      id: 'demo-user-1',
      fullName: 'Sachin Chaudhary',
      company: 'Tata Steel Industrial',
      email: 'sachin@tatasteel.com',
      role: 'seller',
    }
  })
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  const setRole = (newRole) => {
    setUser(prev => {
      const updated = { ...prev, role: newRole }
      localStorage.setItem('w2w_user', JSON.stringify(updated))
      return updated
    })
  }

  const login = (userData) => {
    const fullUser = {
      id: `user-${Date.now()}`,
      fullName: userData.name || 'Demo User',
      company: userData.company || 'Enterprise Partner',
      email: userData.email || 'demo@waste2worth.com',
      role: userData.role || 'seller',
    }
    setUser(fullUser)
    setIsLoggedIn(true)
    localStorage.setItem('w2w_user', JSON.stringify(fullUser))
    api.syncUser({
      clerk_user_id: fullUser.id,
      email: fullUser.email,
      full_name: fullUser.fullName,
      company_name: fullUser.company,
      role: fullUser.role,
    })
  }

  const logout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('w2w_user')
  }

  return (
    <AuthContext.Provider value={{ user, role: user?.role || 'seller', setRole, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function ClerkInnerSync({ children }) {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const [role, setRoleState] = useState(() => localStorage.getItem('w2w_role') || 'seller')

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const userRole = (user.unsafeMetadata?.role) || role
      api.syncUser({
        clerk_user_id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        full_name: user.fullName || user.username || 'Industrial Partner',
        company_name: (user.unsafeMetadata?.company) || 'Industrial Enterprise',
        role: userRole,
      })
    }
  }, [isLoaded, isSignedIn, user, role])

  const setRole = (newRole) => {
    setRoleState(newRole)
    localStorage.setItem('w2w_role', newRole)
  }

  const authValue = {
    user: user ? {
      id: user.id,
      fullName: user.fullName || 'Industrial User',
      email: user.primaryEmailAddress?.emailAddress,
      company: (user.unsafeMetadata?.company) || 'Enterprise Partner',
      role: role
    } : null,
    role,
    setRole,
    isLoggedIn: isSignedIn,
    login: () => {},
    logout: () => signOut(),
  }

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function AppAuthProvider({ children }) {
  if (isClerkConfigured) {
    return (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <ClerkInnerSync>
          {children}
        </ClerkInnerSync>
      </ClerkProvider>
    )
  }

  return <MockAuthProvider>{children}</MockAuthProvider>
}
