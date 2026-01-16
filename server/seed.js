import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  department: String,
  leaveBalance: { type: Number, default: 20 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' })
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists')
      await mongoose.disconnect()
      return
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash('admin123', salt)

    // Create admin user
    const admin = new User({
      name: 'Super Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    })

    await admin.save()
    console.log('✅ Admin user created successfully!')
    console.log('   Email: admin@example.com')
    console.log('   Password: admin123')

    // Also create a test student
    const existingStudent = await User.findOne({ email: 'student@example.com' })
    if (!existingStudent) {
      const studentPassword = await bcrypt.hash('student123', salt)
      const student = new User({
        name: 'Test Student',
        email: 'student@example.com',
        password: studentPassword,
        role: 'student',
        department: 'Computer Science',
        isActive: true
      })
      await student.save()
      console.log('✅ Test student created successfully!')
      console.log('   Email: student@example.com')
      console.log('   Password: student123')
    }

    await mongoose.disconnect()
    console.log('✅ Database seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding database:', error.message)
    process.exit(1)
  }
}

seedDatabase()
