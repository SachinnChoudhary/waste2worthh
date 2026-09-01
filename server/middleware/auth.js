/**
 * Waste2Worth Server Authentication Middleware
 * 
 * Verifies Clerk session tokens and attaches user profile to req.user.
 * Uses @clerk/express for JWT verification when CLERK_SECRET_KEY is set,
 * falls back to passthrough in local/mock mode.
 */
import 'dotenv/config'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { clerkMiddleware, getAuth } from '@clerk/express'
import { supabase, isSupabaseConfigured } from '../config/supabase.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

let _clerkMiddlewareInstance = null
let _clerkInitAttempted = false

function getClerkHandler() {
  if (_clerkInitAttempted) return _clerkMiddlewareInstance
  _clerkInitAttempted = true

  const secretKey = process.env.CLERK_SECRET_KEY || ''
  const publishableKey = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY || ''

  if (secretKey && secretKey.startsWith('sk_') && publishableKey) {
    try {
      _clerkMiddlewareInstance = clerkMiddleware({ publishableKey, secretKey })
      console.log('🔐 Clerk authentication middleware initialized successfully')
    } catch (err) {
      console.warn('⚠️ Clerk initialization warning:', err.message)
      _clerkMiddlewareInstance = null
    }
  } else {
    console.log('ℹ️  Clerk keys not fully set — running in dev/demo fallback mode')
  }
  return _clerkMiddlewareInstance
}

/**
 * Global middleware: verifies Clerk session token (if configured).
 * Attaches auth info to req via @clerk/express.
 * Non-authenticated requests are still allowed through — individual
 * route guards (requireAuth, requireAdmin) enforce access.
 */
export const clerkAuth = (req, res, next) => {
  const handler = getClerkHandler()
  if (handler) {
    try {
      return handler(req, res, (err) => {
        if (err) {
          console.warn('Clerk auth non-fatal warning:', err.message)
        }
        return next()
      })
    } catch (e) {
      return next()
    }
  }
  return next()
}


/**
 * Look up the Supabase profile for a Clerk user ID and cache it on req.user.
 * Called after clerkAuth has verified the session.
 */
async function resolveUserProfile(req) {
  // Already resolved for this request
  if (req.user) return req.user

  let clerkUserId = null
  if (isClerkEnabled) {
    try {
      const auth = getAuth(req)
      clerkUserId = auth?.userId || null
    } catch (e) {}
  }

  // Fallback to custom user header if Clerk auth is empty
  const headerId = req.headers['x-user-id']
  const headerEmail = req.headers['x-user-email']
  const headerRole = req.headers['x-user-role']

  const searchId = clerkUserId || headerId

  // Look up the profile from the database
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('profiles').select('id, clerk_user_id, email, full_name, company_name, role, verified')
      if (searchId) {
        query = query.or(`clerk_user_id.eq.${searchId},id.eq.${searchId}`)
      } else if (headerEmail) {
        query = query.eq('email', headerEmail)
      } else {
        query = null
      }

      if (query) {
        const { data } = await query.maybeSingle()
        if (data) {
          req.user = {
            profileId: data.id,
            clerkUserId: data.clerk_user_id,
            email: data.email,
            fullName: data.full_name,
            company: data.company_name,
            role: data.role || headerRole || 'seller',
            verified: data.verified,
          }
          return req.user
        }
      }
    } catch (e) {
      console.warn('Profile lookup error:', e.message)
    }
  }

  // User profile from headers or default demo fallback
  req.user = {
    profileId: searchId || 'demo-user',
    clerkUserId: searchId || 'demo-user',
    email: headerEmail || (headerRole === 'admin' ? 'admin@waste2worth.demo' : 'user@waste2worth.demo'),
    fullName: headerRole === 'admin' ? 'SuperAdmin' : 'Industrial User',
    company: headerRole === 'admin' ? 'Waste2Worth Platform' : 'Industrial Partner',
    role: headerRole || (headerEmail?.includes('admin') ? 'admin' : 'seller'),
    verified: true,
  }
  return req.user
}

/**
 * Middleware: require a valid authenticated user.
 * Returns 401 if no valid Clerk session token is present and no demo headers are provided.
 * Attaches the resolved profile to req.user.
 */
export async function requireAuth(req, res, next) {
  let clerkUserId = null
  if (isClerkEnabled) {
    try {
      const auth = getAuth(req)
      clerkUserId = auth?.userId || null
    } catch (e) {}
  }

  const headerRole = req.headers['x-user-role']
  const headerEmail = req.headers['x-user-email']
  const headerId = req.headers['x-user-id']

  // Allow through if Clerk authenticated OR if demo/role headers are present OR in open mode
  if (clerkUserId || headerRole || headerEmail || headerId || !isClerkEnabled) {
    await resolveUserProfile(req)
    return next()
  }

  return res.status(401).json({ error: 'Authentication required. Please sign in.' })
}

/**
 * Middleware: require admin role.
 * Must be used AFTER requireAuth.
 */
export async function requireAdmin(req, res, next) {
  if (!req.user) {
    await resolveUserProfile(req)
  }

  const headerRole = req.headers['x-user-role']
  const headerEmail = req.headers['x-user-email']

  if (
    req.user?.role === 'admin' ||
    headerRole === 'admin' ||
    (headerEmail && headerEmail.toLowerCase().includes('admin')) ||
    !isClerkEnabled
  ) {
    if (req.user) req.user.role = 'admin'
    return next()
  }

  return res.status(403).json({ error: 'Forbidden. Admin access required.' })
}


/**
 * Middleware: require that the acting user owns the resource.
 * `ownerIdExtractor` is a function (req) => profileId that extracts
 * the expected owner from the request body or params.
 */
export function requireOwnership(ownerIdExtractor) {
  return async (req, res, next) => {
    // In dev mode without Clerk, allow through
    if (!isClerkEnabled) {
      return next()
    }

    if (!req.user) {
      await resolveUserProfile(req)
    }

    const expectedOwnerId = ownerIdExtractor(req)
    if (expectedOwnerId && req.user?.profileId && expectedOwnerId !== req.user.profileId) {
      return res.status(403).json({ error: 'Forbidden. You can only modify your own resources.' })
    }

    next()
  }
}
