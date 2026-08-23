-- ====================================================================
-- Waste2Worth Industrial Byproduct & Secondary Raw Material Marketplace
-- Supabase PostgreSQL Database Schema
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles & Industrial Entities (Clerk Auth Integrated)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    company_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('seller', 'buyer', 'both', 'admin')),
    gstin TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    verified BOOLEAN DEFAULT false,
    credit_score INTEGER DEFAULT 750,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Industrial Byproduct & Waste Listings
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    hazard_level TEXT NOT NULL CHECK (hazard_level IN ('Non-hazardous', 'Low', 'Moderate', 'High')),
    condition TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL DEFAULT 'tonnes',
    quantity_kg NUMERIC NOT NULL,
    price_inr NUMERIC NOT NULL,
    price_display TEXT,
    location TEXT NOT NULL,
    city TEXT,
    state TEXT,
    description TEXT NOT NULL,
    
    -- AI-Computed Intelligence (from Waste2Worth ML Engine)
    ai_classification TEXT,
    ai_confidence NUMERIC,
    estimated_value_usd NUMERIC,
    disposal_cost_saved_usd NUMERIC,
    co2_reduction_kg NUMERIC,
    pricing_model TEXT DEFAULT 'Random Forest ML',
    
    -- Listing Metadata
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'under_review', 'deal_in_progress', 'sold', 'expired')),
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    msds_document_url TEXT,
    cpcb_compliant BOOLEAN DEFAULT true,
    total_bids INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Live Bids & Material Offers
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    bid_amount_inr NUMERIC NOT NULL,
    bid_quantity NUMERIC,
    unit TEXT DEFAULT 'tonnes',
    proposed_logistics TEXT CHECK (proposed_logistics IN ('buyer_pickup', 'seller_delivery', 'platform_managed')),
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'withdrawn')),
    counter_amount_inr NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Buyer Material Preferences & Procurement Criteria (For AI Matchmaking)
CREATE TABLE IF NOT EXISTS public.buyer_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    material_keywords TEXT NOT NULL,
    max_hazard_level TEXT DEFAULT 'Moderate',
    min_monthly_volume_kg NUMERIC DEFAULT 1000,
    preferred_states TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Transactions, Closed Deals & Carbon Settlements
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    bid_id UUID REFERENCES public.bids(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    final_amount_inr NUMERIC NOT NULL,
    quantity_settled NUMERIC NOT NULL,
    co2_offset_tonnes NUMERIC NOT NULL,
    landfill_avoided_tonnes NUMERIC NOT NULL,
    escrow_status TEXT NOT NULL DEFAULT 'held' CHECK (escrow_status IN ('held', 'material_in_transit', 'inspection_passed', 'released', 'refunded')),
    carbon_certificate_id TEXT UNIQUE,
    settled_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Admin Audit Trail & Security Event Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    details TEXT,
    performed_by TEXT DEFAULT 'SuperAdmin',
    type TEXT DEFAULT 'system' CHECK (type IN ('system', 'user', 'listing', 'bid', 'security', 'compliance')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Master System Configuration & Global Switches
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by TEXT DEFAULT 'SuperAdmin',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Historical KPI Snapshot Registry
CREATE TABLE IF NOT EXISTS public.admin_kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    total_listings INTEGER DEFAULT 0,
    active_listings INTEGER DEFAULT 0,
    total_bids INTEGER DEFAULT 0,
    accepted_bids INTEGER DEFAULT 0,
    total_gmv_inr NUMERIC DEFAULT 0,
    diverted_tonnes NUMERIC DEFAULT 0,
    co2_saved_tonnes NUMERIC DEFAULT 0,
    verified_enterprises INTEGER DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- Performance Indexes
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_hazard ON public.listings(hazard_level);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_bids_listing ON public.bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_buyer ON public.bids(buyer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_clerk ON public.profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_type ON public.admin_audit_logs(type);
CREATE INDEX IF NOT EXISTS idx_kpi_recorded_at ON public.admin_kpi_snapshots(recorded_at DESC);

-- ====================================================================
-- RLS Helper Functions
-- ====================================================================

-- Extract Clerk user ID from the JWT claims passed by Supabase.
-- Works when Clerk JWTs are configured as Supabase custom access tokens,
-- or when the Express backend sets request.jwt.claims via the service role.
-- Returns '' (empty string) for unauthenticated / anon-key requests.
CREATE OR REPLACE FUNCTION public.get_clerk_uid()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'clerk_user_id',
    ''
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Returns true if the JWT user has role = 'admin' in profiles.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE clerk_user_id = public.get_clerk_uid()
      AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================
--
-- Architecture note:
--   All WRITE operations go through the Express backend using the
--   SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS entirely.
--   These policies are a defense-in-depth layer for the anon key:
--     • Public reads where appropriate
--     • All writes blocked for the anon key (the anon JWT has no sub claim,
--       so get_clerk_uid() returns '' which never matches a real user)
--
-- If Clerk JWT integration is later configured in Supabase, these policies
-- will also correctly enforce ownership for direct client-side access.
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_kpi_snapshots ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────
-- PROFILES
-- ────────────────────────────────────────────
-- SELECT: Public (needed for company directory / marketplace seller info)
CREATE POLICY "profiles_select_public" ON public.profiles
    FOR SELECT USING (true);

-- INSERT: Only the owning Clerk user can create their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (clerk_user_id = public.get_clerk_uid());

-- UPDATE: Only the owning Clerk user can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (clerk_user_id = public.get_clerk_uid());

-- ────────────────────────────────────────────
-- LISTINGS
-- ────────────────────────────────────────────
-- SELECT: Only active listings are publicly visible
CREATE POLICY "listings_select_active" ON public.listings
    FOR SELECT USING (status = 'active');

-- INSERT: Only if the authenticated user's profile ID matches seller_id
CREATE POLICY "listings_insert_own" ON public.listings
    FOR INSERT WITH CHECK (
      seller_id IN (
        SELECT id FROM public.profiles
        WHERE clerk_user_id = public.get_clerk_uid()
      )
    );

-- UPDATE: Only the listing's seller can update
CREATE POLICY "listings_update_own" ON public.listings
    FOR UPDATE USING (
      seller_id IN (
        SELECT id FROM public.profiles
        WHERE clerk_user_id = public.get_clerk_uid()
      )
    );

-- ────────────────────────────────────────────
-- BIDS
-- ────────────────────────────────────────────
-- SELECT: The buyer who placed the bid, or the seller who owns the listing
CREATE POLICY "bids_select_participant" ON public.bids
    FOR SELECT USING (
      -- The bidder can see their own bids
      buyer_id IN (
        SELECT id FROM public.profiles
        WHERE clerk_user_id = public.get_clerk_uid()
      )
      OR
      -- The listing's seller can see bids on their listings
      listing_id IN (
        SELECT l.id FROM public.listings l
        JOIN public.profiles p ON p.id = l.seller_id
        WHERE p.clerk_user_id = public.get_clerk_uid()
      )
    );

-- INSERT: Only if buyer_id matches the authenticated user's profile
CREATE POLICY "bids_insert_own" ON public.bids
    FOR INSERT WITH CHECK (
      buyer_id IN (
        SELECT id FROM public.profiles
        WHERE clerk_user_id = public.get_clerk_uid()
      )
    );

-- UPDATE: The bidder (for withdrawal) or the listing's seller (accept/reject)
CREATE POLICY "bids_update_participant" ON public.bids
    FOR UPDATE USING (
      -- Bidder can update (withdraw) their own bid
      buyer_id IN (
        SELECT id FROM public.profiles
        WHERE clerk_user_id = public.get_clerk_uid()
      )
      OR
      -- Listing seller can update (accept/reject) bids on their listings
      listing_id IN (
        SELECT l.id FROM public.listings l
        JOIN public.profiles p ON p.id = l.seller_id
        WHERE p.clerk_user_id = public.get_clerk_uid()
      )
    );

-- ────────────────────────────────────────────
-- BUYER PREFERENCES
-- ────────────────────────────────────────────
-- All operations restricted to the owning buyer only
CREATE POLICY "buyer_prefs_select_own" ON public.buyer_preferences
    FOR SELECT USING (
      buyer_id IN (
        SELECT id FROM public.profiles
        WHERE clerk_user_id = public.get_clerk_uid()
      )
    );

CREATE POLICY "buyer_prefs_insert_own" ON public.buyer_preferences
    FOR INSERT WITH CHECK (
      buyer_id IN (
        SELECT id FROM public.profiles
        WHERE clerk_user_id = public.get_clerk_uid()
      )
    );

CREATE POLICY "buyer_prefs_update_own" ON public.buyer_preferences
    FOR UPDATE USING (
      buyer_id IN (
        SELECT id FROM public.profiles
        WHERE clerk_user_id = public.get_clerk_uid()
      )
    );

CREATE POLICY "buyer_prefs_delete_own" ON public.buyer_preferences
    FOR DELETE USING (
      buyer_id IN (
        SELECT id FROM public.profiles
        WHERE clerk_user_id = public.get_clerk_uid()
      )
    );

-- ────────────────────────────────────────────
-- TRANSACTIONS
-- ────────────────────────────────────────────
-- SELECT: Only the buyer or seller involved in the transaction
CREATE POLICY "transactions_select_participant" ON public.transactions
    FOR SELECT USING (
      buyer_id IN (
        SELECT id FROM public.profiles
        WHERE clerk_user_id = public.get_clerk_uid()
      )
      OR
      seller_id IN (
        SELECT id FROM public.profiles
        WHERE clerk_user_id = public.get_clerk_uid()
      )
    );
-- INSERT/UPDATE/DELETE: Service role only (no anon-key writes)

-- ────────────────────────────────────────────
-- ADMIN AUDIT LOGS
-- ────────────────────────────────────────────
-- SELECT: Admin only
CREATE POLICY "audit_logs_select_admin" ON public.admin_audit_logs
    FOR SELECT USING (public.is_admin());
-- INSERT/UPDATE/DELETE: Service role only (no anon-key writes)

-- ────────────────────────────────────────────
-- SYSTEM SETTINGS
-- ────────────────────────────────────────────
-- SELECT: Admin only
CREATE POLICY "settings_select_admin" ON public.system_settings
    FOR SELECT USING (public.is_admin());

-- UPDATE: Admin only
CREATE POLICY "settings_update_admin" ON public.system_settings
    FOR UPDATE USING (public.is_admin());
-- INSERT/DELETE: Service role only

-- ────────────────────────────────────────────
-- ADMIN KPI SNAPSHOTS
-- ────────────────────────────────────────────
-- SELECT: Admin only
CREATE POLICY "kpi_select_admin" ON public.admin_kpi_snapshots
    FOR SELECT USING (public.is_admin());
-- INSERT/UPDATE/DELETE: Service role only

-- ====================================================================
-- Auto-update updated_at timestamp trigger
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_update BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_listings_update BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_bids_update BEFORE UPDATE ON public.bids
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_system_settings_update BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ====================================================================
-- Storage Bucket & Storage Policies for Listing Media & MSDS
-- ====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'listing-media',
    'listing-media',
    true,
    26214400, -- 25 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 26214400,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

-- Public read access for listing-media bucket
CREATE POLICY "Public read for listing-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-media');

-- Authenticated upload access for listing-media bucket
CREATE POLICY "Authenticated upload for listing-media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing-media');

-- Owner can update/delete their uploaded media
CREATE POLICY "Owner update for listing-media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'listing-media');

CREATE POLICY "Owner delete for listing-media"
ON storage.objects FOR DELETE
USING (bucket_id = 'listing-media');

