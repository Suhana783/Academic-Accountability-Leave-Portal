import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const db = mongoose.connection.db
    
    try {
      await db.collection('tests').drop()
      console.log('✅ Tests collection dropped')
    } catch (e) {
      console.log('Tests collection does not exist')
    }

    try {
      await db.collection('testresults').drop()
      console.log('✅ TestResults collection dropped')
    } catch (e) {
      console.log('TestResults collection does not exist')
    }

    await mongoose.disconnect()
    console.log('✅ Cleanup completed!')
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

cleanup()
