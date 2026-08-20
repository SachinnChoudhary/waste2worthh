import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

import listingsRouter from './routes/listings.js'
import bidsRouter from './routes/bids.js'
import mlRouter from './routes/ml.js'
import statsRouter from './routes/stats.js'
import usersRouter from './routes/users.js'
import adminRouter from './routes/admin.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.resolve(__dirname, '../dist')
const hasDist = fs.existsSync(path.join(distPath, 'index.html'))

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors({ origin: '*' }))
app.use(express.json())

// Health and Status Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// API Info Route
app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    name: 'Waste2Worth Node.js Central API Gateway',
    version: '1.0.0',
    endpoints: [
      '/api/listings',
      '/api/bids',
      '/api/ml/classify',
      '/api/ml/classify-and-value',
      '/api/ml/recommend-matches',
      '/api/stats/overview',
      '/api/users/sync',
      '/api/admin/overview',
      '/api/admin/system-health',
      '/api/admin/listings',
      '/api/admin/bids',
      '/api/admin/users',
      '/api/admin/audit-logs'
    ]
  })
})

// Route Mounting
app.use('/api/listings', listingsRouter)
app.use('/api/bids', bidsRouter)
app.use('/api/ml', mlRouter)
app.use('/api/stats', statsRouter)
app.use('/api/users', usersRouter)
app.use('/api/admin', adminRouter)

// Serve static assets from Vite build in production if dist exists
if (hasDist) {
  app.use(express.static(distPath))

  // For SPA client routing, return index.html for non-API GET requests
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'))
    }
    next()
  })
} else {
  // If running standalone without built UI
  app.get('/', (req, res) => {
    res.json({
      status: 'online',
      name: 'Waste2Worth Node.js Central API Gateway',
      version: '1.0.0'
    })
  })
}

// 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Unhandled Error:', err)
  res.status(500).json({ error: 'Internal Server Error', message: err.message })
})

app.listen(PORT, () => {
  console.log(`🚀 Waste2Worth Server running on port ${PORT}`)
})
