-- ====================================================================
-- Waste2Worth Initial Seed Data
-- Run this in your Supabase SQL Editor after executing schema.sql
-- ====================================================================

-- Insert Mock Profiles
INSERT INTO public.profiles (id, clerk_user_id, email, full_name, company_name, role, gstin, phone, city, state, verified, credit_score)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'user_tatasteel_01', 'procurement@tatasteel.com', 'Rajesh Sharma', 'Tata Steel Ltd.', 'seller', '20AAACT2727Q1ZU', '+91 657 664 1234', 'Jamshedpur', 'Jharkhand', true, 890),
    ('a0000000-0000-0000-0000-000000000002', 'user_reliance_02', 'circular@ril.com', 'Ananya Mehta', 'Reliance Petrochemicals', 'seller', '24AAACR5055K1ZI', '+91 265 669 8800', 'Vadodara', 'Gujarat', true, 920),
    ('a0000000-0000-0000-0000-000000000003', 'user_iocl_03', 'hazmat.disposal@iocl.co.in', 'Vikram Singh', 'IOCL Mathura Refinery', 'seller', '09AAACI1681G1ZM', '+91 565 241 7000', 'Mathura', 'Uttar Pradesh', true, 860),
    ('a0000000-0000-0000-0000-000000000004', 'user_arvind_04', 'sustainability@arvind.in', 'Pooja Patel', 'Arvind Mills Ltd.', 'seller', '24AAACA3000P1ZS', '+91 79 6826 4000', 'Ahmedabad', 'Gujarat', true, 840),
    ('a0000000-0000-0000-0000-000000000005', 'user_ultratech_05', 'sourcing@ultratechcement.com', 'Karan Verma', 'UltraTech Cement Ltd.', 'buyer', '27AAACU1234L1ZX', '+91 22 6691 7800', 'Mumbai', 'Maharashtra', true, 910),
    ('a0000000-0000-0000-0000-000000000006', 'user_ecoplast_06', 'buy@ecoplastics.co.in', 'Siddharth Rao', 'EcoPlastics Reprocessors', 'buyer', '29AAACE4567M1ZV', '+91 80 4123 9900', 'Bengaluru', 'Karnataka', true, 810)
ON CONFLICT (clerk_user_id) DO NOTHING;

-- Insert Seed Listings
INSERT INTO public.listings (
    id, seller_id, title, category, hazard_level, condition, quantity, unit, quantity_kg,
    price_inr, price_display, location, city, state, description,
    ai_classification, ai_confidence, estimated_value_usd, disposal_cost_saved_usd, co2_reduction_kg,
    status, total_bids, views_count
)
VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Steel Mill Slag — Grade A Silicate',
    'Metal Scrap',
    'Low',
    'Clean / sorted',
    450,
    'tonnes',
    450000,
    3690000,
    '₹8,200/tonne',
    'Jamshedpur, Jharkhand',
    'Jamshedpur',
    'Jharkhand',
    'High-calcium steel slag from blast furnace operations. Ideal for cement manufacturing, road construction aggregate, or soil conditioning. Consistent chemical composition with monthly test reports available. Regular supply of 200+ tonnes/month guaranteed.',
    'Calcium Silicate Slag (Blast Furnace)',
    0.96,
    181125.00,
    27000.00,
    931500.0,
    'active',
    7,
    342
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'HDPE Drum Regrind — Clean Single Source',
    'Plastic Waste',
    'Low',
    'Clean / sorted',
    12,
    'tonnes',
    12000,
    504000,
    '₹42,000/tonne',
    'Vadodara, Gujarat',
    'Vadodara',
    'Gujarat',
    'Clean HDPE regrind from food-grade chemical drums. Single polymer source — no mixed plastics. Washed and granulated to 8-12mm flake. Melt flow index: 7.5 g/10min. Perfect for pipe extrusion or blow molding.',
    'High-Density Polyethylene (HDPE Regrind)',
    0.98,
    2760.00,
    720.00,
    16560.0,
    'active',
    3,
    215
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    'Spent Caustic Soda — Recoverable NaOH Solution',
    'Chemical Residue',
    'High',
    'Contaminated',
    80,
    'KL',
    80000,
    520000,
    '₹6,500/KL',
    'Mathura, Uttar Pradesh',
    'Mathura',
    'Uttar Pradesh',
    'Spent caustic from crude desulfurization. NaOH concentration 8-12%. Contains mercaptides and sulfides. Suitable for caustic recovery units or wastewater neutralization. MSDS and transport documentation provided.',
    'Spent Sulfidic Caustic Liquor',
    0.91,
    17600.00,
    4800.00,
    92400.0,
    'active',
    2,
    188
),
(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000004',
    'Cotton Selvedge & Cutting Waste Scraps',
    'Textile Waste',
    'Low',
    'Baled',
    6,
    'tonnes',
    6000,
    90000,
    '₹15,000/tonne',
    'Ahmedabad, Gujarat',
    'Ahmedabad',
    'Gujarat',
    'Clean cotton selvedge waste from denim weaving. 100% cotton, undyed edges and cutting room scraps. Baled in 200kg blocks. Consistent quality — same mill, same raw material. Ideal for recycled yarn spinning or industrial wiping cloth.',
    'Post-Industrial Cotton Comber Noil & Selvedge',
    0.95,
    945.00,
    360.00,
    5670.0,
    'active',
    11,
    419
)
ON CONFLICT (id) DO NOTHING;

-- Insert Seed Bids
INSERT INTO public.bids (
    id, listing_id, buyer_id, bid_amount_inr, bid_quantity, unit, proposed_logistics, message, status
)
VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000005',
    3780000,
    450,
    'tonnes',
    'seller_delivery',
    'Offer ₹8,400/tonne for the full 450 tonnes lot. Delivery to our Durgapur grinding plant.',
    'pending'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000006',
    480000,
    12,
    'tonnes',
    'buyer_pickup',
    'Ready for immediate pickup via our dedicated pelletizing trucks.',
    'pending'
)
ON CONFLICT (id) DO NOTHING;
