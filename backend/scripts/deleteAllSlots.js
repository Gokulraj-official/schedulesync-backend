/**
 * Script to delete all slots from the database
 * Usage: node scripts/deleteAllSlots.js
 * 
 * WARNING: This will permanently delete all slot records!
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import Slot model
const Slot = require('../models/Slot');

async function deleteAllSlots() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // Delete all slots
    console.log('🗑️  Deleting all slots...');
    const result = await Slot.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} slot(s)`);
    console.log('All slots have been removed from the database');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
}

// Run the script
deleteAllSlots();
