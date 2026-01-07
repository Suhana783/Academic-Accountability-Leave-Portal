import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { connectDB } from './config/database.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

// Import routes
import authRoutes from './routes/authRoutes.js'
import leaveRoutes from './routes/leaveRoutes.js'
import testRoutes from './routes/testRoutes.js'

dotenv.config()

const app = express()

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Database Connection
connectDB()

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/leave', leaveRoutes)
app.use('/api/test', testRoutes)

// 404 Handler
app.use(notFound)

// Global Error Handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
})

