import React, { createContext, useContext, useState, useEffect } from 'react'
import { ClerkProvider, useUser, useClerk, SignedIn, SignedOut, UserButton, SignIn, SignUp } from '@clerk/clerk-react'
import { api } from './api'
import { supabase, isSupabaseLive } from './supabaseClient'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''
export const isClerkConfigured = Boolean(CLERK_PUBLISHABLE_KEY && CLERK_PUBLISHABLE_KEY.startsWith('pk_'))

const AuthContext = createContext({
  user: null,
  role: 'seller',
  setRole: () => {},
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  refreshProfile: () => {},
  isLoading: false,
})

export function useWasteAuth() {
  return useContext(AuthContext)
}

function StandaloneAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('w2w_user')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return {
      id: 'a0000000-0000-0000-0000-000000000001',
      fullName: 'Rajesh Sharma',
      company: 'Tata Steel Ltd.',
      email: 'procurement@tatasteel.com',
      role: 'seller',
      verified: true
    }
  })
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('w2w_logged_in')
    return saved !== null ? saved === 'true' : true
  })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch real profile from Supabase on mount
  useEffect(() => {
    async function fetchRealProfile() {
      if (isSupabaseLive && user?.email) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single()

          if (!error && data) {
            const updated = {
              id: data.id,
              fullName: data.full_name || user.fullName,
              company: data.company_name || user.company,
              email: data.email,
              role: data.role || user.role,
              verified: data.verified ?? true,
              gstin: data.gstin,
              city: data.city,
              state: data.state
            }
            setUser(updated)
            localStorage.setItem('w2w_user', JSON.stringify(updated))
          }
        } catch (e) {
          console.warn('Supabase profile load notice:', e.message)
        }
      }
    }
    fetchRealProfile()
  }, [])

  const setRole = (newRole) => {
    setUser(prev => {
      const updated = { ...prev, role: newRole }
      localStorage.setItem('w2w_user', JSON.stringify(updated))
      localStorage.setItem('w2w_role', newRole)
      return updated
    })
    // Also update in Supabase if live
    if (isSupabaseLive && user?.id) {
      supabase.from('profiles').update({ role: newRole }).eq('id', user.id).catch(() => {})
    }
  }

  const login = async (userData) => {
    setIsLoading(true)
    let profileData = {
      id: userData.id || `user-${Date.now()}`,
      fullName: userData.name || userData.fullName || 'Rajesh Sharma',
      company: userData.company || 'Tata Steel Ltd.',
      email: userData.email || 'procurement@tatasteel.com',
      role: userData.role || 'seller',
      verified: true
    }

    if (isSupabaseLive && userData.email) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', userData.email)
          .single()

        if (data) {
          profileData = {
            id: data.id,
            fullName: data.full_name || profileData.fullName,
            company: data.company_name || profileData.company,
            email: data.email,
            role: data.role || profileData.role,
            verified: data.verified,
            gstin: data.gstin,
            city: data.city,
            state: data.state
          }
        } else {
          // Insert new profile
          const { data: newP } = await supabase
            .from('profiles')
            .insert([{
              clerk_user_id: `user_${Date.now()}`,
              email: userData.email,
              full_name: userData.name || userData.fullName,
              company_name: userData.company,
              role: userData.role || 'seller',
              verified: true
            }])
            .select()
            .single()
          if (newP) {
            profileData = {
              id: newP.id,
              fullName: newP.full_name,
              company: newP.company_name,
              email: newP.email,
              role: newP.role,
              verified: true
            }
          }
        }
      } catch (e) {}
    }

    setUser(profileData)
    setIsLoggedIn(true)
    localStorage.setItem('w2w_user', JSON.stringify(profileData))
    localStorage.setItem('w2w_logged_in', 'true')
    localStorage.setItem('w2w_role', profileData.role)
    setIsLoading(false)

    api.syncUser({
      clerk_user_id: profileData.id,
      email: profileData.email,
      full_name: profileData.fullName,
      company_name: profileData.company,
      role: profileData.role,
    })
  }

  const logout = () => {
    setIsLoggedIn(false)
    localStorage.setItem('w2w_logged_in', 'false')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'seller',
        setRole,
        isLoggedIn,
        login,
        logout,
        isLoading,
        refreshProfile: () => {}
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function ClerkInnerSync({ children }) {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const [role, setRoleState] = useState(() => localStorage.getItem('w2w_role') || 'seller')
  const [supabaseProfile, setSupabaseProfile] = useState(null)

  useEffect(() => {
    async function syncAndFetch() {
      if (isLoaded && isSignedIn && user) {
        const userRole = (user.unsafeMetadata?.role) || role
        const email = user.primaryEmailAddress?.emailAddress
        const fullName = user.fullName || user.username || 'Industrial Partner'
        const companyName = (user.unsafeMetadata?.company) || 'Industrial Enterprise'

        if (isSupabaseLive && email) {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', email)
              .single()

            if (data) {
              setSupabaseProfile(data)
              if (data.role && data.role !== role) {
                setRoleState(data.role)
                localStorage.setItem('w2w_role', data.role)
              }
            } else {
              // Create profile in Supabase
              const { data: newP } = await supabase
                .from('profiles')
                .upsert({
                  clerk_user_id: user.id,
                  email,
                  full_name: fullName,
                  company_name: companyName,
                  role: userRole,
                  verified: true
                }, { onConflict: 'email' })
                .select()
                .single()
              if (newP) setSupabaseProfile(newP)
            }
          } catch (e) {
            console.warn('Clerk Supabase sync notice:', e.message)
          }
        }

        api.syncUser({
          clerk_user_id: user.id,
          email,
          full_name: fullName,
          company_name: companyName,
          role: userRole,
        })
      }
    }
    syncAndFetch()
  }, [isLoaded, isSignedIn, user])

  const setRole = (newRole) => {
    setRoleState(newRole)
    localStorage.setItem('w2w_role', newRole)
    if (isSupabaseLive && supabaseProfile?.id) {
      supabase.from('profiles').update({ role: newRole }).eq('id', supabaseProfile.id).catch(() => {})
    }
  }

  const authValue = {
    user: user ? {
      id: supabaseProfile?.id || user.id,
      fullName: supabaseProfile?.full_name || user.fullName || 'Industrial User',
      email: user.primaryEmailAddress?.emailAddress,
      company: supabaseProfile?.company_name || (user.unsafeMetadata?.company) || 'Tata Steel Ltd.',
      role: supabaseProfile?.role || role,
      verified: supabaseProfile?.verified ?? true
    } : null,
    role: supabaseProfile?.role || role,
    setRole,
    isLoggedIn: isSignedIn,
    login: () => {},
    logout: () => signOut(),
    isLoading: !isLoaded,
    refreshProfile: () => {}
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

  return <StandaloneAuthProvider>{children}</StandaloneAuthProvider>
}
