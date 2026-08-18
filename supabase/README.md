# Supabase Database Setup Guide

This directory contains the complete database migration and seed data for the **Waste2Worth** industrial byproduct marketplace.

## Database Tables
1. `profiles`: Enterprise and user profile directory connected to Clerk Auth (`clerk_user_id`).
2. `listings`: Waste byproduct lots with AI classification, hazard level, ESG CO₂ reduction score, and market valuation.
3. `bids`: Live quotes and procurement bids from verified buyers.
4. `buyer_preferences`: Stated material requirements used by the TF-IDF / Cosine Similarity matchmaking engine.
5. `transactions`: Closed contracts, escrow settlements, and carbon audit certificates.

## Quick Setup

### Option 1: Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Open the **SQL Editor** from the left navigation bar.
3. Open [`supabase/schema.sql`](./schema.sql), copy all content, paste into the editor, and click **Run**.
4. Open [`supabase/seed.sql`](./seed.sql), copy all content, paste into the editor, and click **Run**.

### Option 2: Supabase CLI
```bash
npx supabase db push
npx supabase db reset
```

## Environment Configuration
Set the following variables in your `.env` file (or `server/.env`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
*(Note: If Supabase keys are not set yet, the server and frontend automatically fall back to an active local state store for zero-friction development).*
