import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import listingsRouter from './routes/listings.js'
import bidsRouter from './routes/bids.js'
import mlRouter from './routes/ml.js'
import statsRouter from './routes/stats.js'
import usersRouter from './routes/users.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors({ origin: '*' }))
app.use(express.json())

// Health and Root Route
app.get('/', (req, res) => {
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
      '/api/users/sync'
    ]
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Route Mounting
app.use('/api/listings', listingsRouter)
app.use('/api/bids', bidsRouter)
app.use('/api/ml', mlRouter)
app.use('/api/stats', statsRouter)
app.use('/api/users', usersRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Unhandled Error:', err)
  res.status(500).json({ error: 'Internal Server Error', message: err.message })
})

app.listen(PORT, () => {
  console.log(`🚀 Waste2Worth Node.js API Gateway running on http://localhost:${PORT}`)
})
