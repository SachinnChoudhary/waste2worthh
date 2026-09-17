# Waste2Worth

Waste2Worth is a B2B circular economy marketplace connecting manufacturers, refineries, and industrial operations with buyers who can transform waste and byproducts into valuable raw materials. It enables businesses to list waste streams, discover industrial materials, negotiate deals, and track environmental impact metrics such as CO₂ saved and landfill diverted.

## Tech Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4
- **Authentication:** Clerk (`@clerk/clerk-react`, `@clerk/express`)
- **Database:** Supabase (PostgreSQL with RLS)
- **ML Engine:** Python 3 (Flask, Scikit-learn, TF-IDF, Random Forest)

## Documentation

A complete, in-depth architectural and technical guide is available in [PROJECT_DOCUMENTATION.md](file:///Users/sachinchaudhary/Documents/waste2worth/PROJECT_DOCUMENTATION.md). It covers:
- System Architecture & Triple-layer Fallback Approaches
- AI/ML Models, Taxonomies & Valuations
- Database Schemas, RLS Policies & Triggers
- REST API Gateway Endpoints & Python ML Microservice
- Frontend Client Routes, UI Pages & User Workflows
- CPCB Regulatory Framework (Form 10 Manifests, TREMCARD) & Scope-3 ESG Carbon Credits

## Quick Start

```bash
# Install dependencies
npm install

# Start Python ML Microservice (Port 8000)
npm run ml

# Start Node.js API Gateway (Port 5001)
npm run server

# Start Frontend Dev Server (Port 5173)
npm run dev
```

