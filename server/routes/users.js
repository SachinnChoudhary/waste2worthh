import { Router } from 'express'
import { supabase, isSupabaseConfigured } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// POST /api/users/sync - Sync or create user profile in database (authenticated only)
router.post('/sync', requireAuth, async (req, res) => {
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

    if (isSupabaseConfigured && supabase) {
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

      if (error) {
        return res.status(500).json({ success: false, error: error.message })
      }

      if (data) return res.json({ success: true, profile: data })
    }

    return res.json({ success: true, profile: { clerk_user_id, email, full_name, company_name, role } })
  } catch (err) {
    console.error('Error syncing user:', err)
    return res.status(500).json({ success: false, error: 'Failed to sync user profile' })
  }
})

// GET /api/users/profile/:clerkUserId
router.get('/profile/:clerkUserId', async (req, res) => {
  try {
    const { clerkUserId } = req.params

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`clerk_user_id.eq.${clerkUserId},email.eq.${clerkUserId}`)
        .single()

      if (error) {
        return res.status(404).json({ success: false, error: 'Profile not found' })
      }

      if (data) return res.json({ success: true, profile: data })
    }

    return res.status(404).json({ success: false, error: 'Profile not found' })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to get profile' })
  }
})

export default router
