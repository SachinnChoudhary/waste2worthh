/**
 * Waste2Worth Server Authentication Middleware
 * 
 * Verifies Clerk session tokens and attaches user profile to req.user.
 * Uses @clerk/express for JWT verification when CLERK_SECRET_KEY is set,
 * falls back to passthrough in local/mock mode.
 */
import { clerkMiddleware, getAuth } from '@clerk/express'
import { supabase, isSupabaseConfigured } from '../config/supabase.js'

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || ''
const isClerkEnabled = Boolean(CLERK_SECRET_KEY && CLERK_SECRET_KEY.startsWith('sk_'))

if (isClerkEnabled) {
  console.log('🔐 Clerk authentication middleware enabled')
} else {
  console.log('ℹ️  Clerk auth not configured — running in open/dev mode (no token verification)')
}

/**
 * Global middleware: verifies Clerk session token (if configured).
 * Attaches auth info to req via @clerk/express.
 * Non-authenticated requests are still allowed through — individual
 * route guards (requireAuth, requireAdmin) enforce access.
 */
export const clerkAuth = isClerkEnabled
  ? clerkMiddleware()
  : (req, res, next) => next()

/**
 * Look up the Supabase profile for a Clerk user ID and cache it on req.user.
 * Called after clerkAuth has verified the session.
 */
async function resolveUserProfile(req) {
  // Already resolved for this request
  if (req.user) return req.user

  const auth = isClerkEnabled ? getAuth(req) : null
  const clerkUserId = auth?.userId || null

  if (!clerkUserId) {
    return null
  }

  // Look up the profile from the database
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, clerk_user_id, email, full_name, company_name, role, verified')
        .eq('clerk_user_id', clerkUserId)
        .single()

      if (data) {
        req.user = {
          profileId: data.id,
          clerkUserId: data.clerk_user_id,
          email: data.email,
          fullName: data.full_name,
          company: data.company_name,
          role: data.role,
          verified: data.verified,
        }
        return req.user
      }
    } catch (e) {
      console.warn('Profile lookup error:', e.message)
    }
  }

  // User is authenticated via Clerk but has no profile yet
  // (they haven't finished onboarding / profile sync)
  req.user = {
    profileId: null,
    clerkUserId,
    email: null,
    fullName: null,
    company: null,
    role: null,
    verified: false,
  }
  return req.user
}

/**
 * Middleware: require a valid authenticated user.
 * Returns 401 if no valid Clerk session token is present.
 * Attaches the resolved profile to req.user.
 */
export async function requireAuth(req, res, next) {
  // In dev mode without Clerk, allow all requests through
  if (!isClerkEnabled) {
    req.user = req.user || {
      profileId: 'dev-user',
      clerkUserId: 'dev-user',
      email: 'dev@waste2worth.local',
      role: 'seller',
      verified: true,
    }
    return next()
  }

  const auth = getAuth(req)
  if (!auth?.userId) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' })
  }

  await resolveUserProfile(req)
  next()
}

/**
 * Middleware: require admin role.
 * Must be used AFTER requireAuth.
 */
export async function requireAdmin(req, res, next) {
  // In dev mode without Clerk, allow through
  if (!isClerkEnabled) {
    req.user = req.user || { profileId: 'dev-admin', clerkUserId: 'dev-admin', role: 'admin' }
    return next()
  }

  if (!req.user) {
    await resolveUserProfile(req)
  }

  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' })
  }

  next()
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
