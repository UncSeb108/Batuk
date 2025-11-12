import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'], 
    minlength: 6 
  }
}, { 
  timestamps: true 
});

// FIXED: Password hashing middleware
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    console.log("🔐 HASHING PASSWORD...");
    console.log("📝 ORIGINAL PASSWORD:", this.password);
    
    // Use 12 salt rounds (consistent with your current hashes)
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    console.log("✅ PASSWORD HASHED SUCCESSFULLY");
    console.log("📝 HASHED PASSWORD:", this.password);
    next();
  } catch (error: any) {
    console.error("❌ PASSWORD HASHING ERROR:", error);
    next(error);
  }
});

// FIXED: Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    console.log("🔑 COMPARING:");
    console.log("📝 CANDIDATE:", candidatePassword);
    console.log("📝 STORED HASH:", this.password);
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log("🎯 COMPARE RESULT:", isMatch);
    
    return isMatch;
  } catch (error) {
    console.error("❌ COMPARE ERROR:", error);
    return false;
  }
};

// Check if model exists to prevent OverwriteModelError
export default mongoose.models.User || mongoose.model('User', userSchema);