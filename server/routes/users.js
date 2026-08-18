import { Router } from 'express'
import { supabase, isSupabaseConfigured, mockDb } from '../config/supabase.js'

const router = Router()

// POST /api/users/sync - Sync or create user profile upon Clerk login/signup
router.post('/sync', async (req, res) => {
  try {
    const {
      clerk_user_id,
      email,
      full_name = '',
      company_name = 'Registered Industrial Enterprise',
      role = 'seller',
      gstin = '',
      phone = ''
    } = req.body

    if (!clerk_user_id) {
      return res.status(400).json({ error: 'clerk_user_id is required' })
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(
            {
              clerk_user_id,
              email,
              full_name,
              company_name,
              role,
              gstin,
              phone,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'clerk_user_id' }
          )
          .select()
          .single()

        if (!error && data) return res.json({ success: true, profile: data })
      } catch (e) {
        console.warn('⚡ Supabase user sync notice:', e.message)
      }
    }

    // Local in-memory mock update
    let user = mockDb.profiles.find(p => p.clerk_user_id === clerk_user_id)
    if (user) {
      user = { ...user, full_name, company_name, role, gstin, phone }
    } else {
      user = {
        id: `user-${Date.now()}`,
        clerk_user_id,
        email: email || 'user@waste2worth.com',
        full_name,
        company_name,
        role,
        gstin,
        phone,
        verified: true,
        credit_score: 780,
        created_at: new Date().toISOString()
      }
      mockDb.profiles.push(user)
    }

    return res.json({ success: true, profile: user })
  } catch (err) {
    console.error('Error syncing user:', err)
    return res.status(500).json({ error: 'Failed to sync user profile' })
  }
})

// GET /api/users/profile/:clerkUserId
router.get('/profile/:clerkUserId', async (req, res) => {
  try {
    const { clerkUserId } = req.params

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('clerk_user_id', clerkUserId)
          .single()
        if (!error && data) return res.json({ success: true, profile: data })
      } catch (e) {
        console.warn('⚡ Supabase profile fetch notice:', e.message)
      }
    }

    const user = mockDb.profiles.find(p => p.clerk_user_id === clerkUserId) || mockDb.profiles[0]
    return res.json({ success: true, profile: user })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get profile' })
  }
})

export default router
