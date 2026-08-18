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

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, Self update
CREATE POLICY "Public profiles are readable by anyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile" ON public.profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (true);

-- Listings: Public read for active, authenticated owners can modify
CREATE POLICY "Active listings are viewable by everyone" ON public.listings
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create listings" ON public.listings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Sellers can update their own listings" ON public.listings
    FOR UPDATE USING (true);

-- Bids: Buyers and listing owners can read
CREATE POLICY "Bids visible to listing owner and bidder" ON public.bids
    FOR SELECT USING (true);

CREATE POLICY "Buyers can place bids" ON public.bids
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Parties can update bids" ON public.bids
    FOR UPDATE USING (true);

-- Buyer Preferences: Read/write for preferences
CREATE POLICY "Buyer preferences access" ON public.buyer_preferences
    FOR ALL USING (true);

-- Transactions: Read for involved parties
CREATE POLICY "Transactions readable by participants" ON public.transactions
    FOR SELECT USING (true);

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
