import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { connectDB } from '../config/database.js';
import { logger } from '../utils/logger.js';

const demoUsers = [
  {
    username: 'admin',
    email: 'admin@university.edu',
    password: 'password123',
    role: 'admin',
    profile: {
      firstName: 'Admin',
      lastName: 'Registrar',
      phone: '+234-800-000-0001'
    }
  },
  {
    username: 'registry_staff',
    email: 'registry@university.edu',
    password: 'password123',
    role: 'staff-registry',
    profile: {
      firstName: 'Registry',
      lastName: 'Staff',
      phone: '+234-800-000-0002'
    }
  },
  {
    username: 'affairs_staff',
    email: 'affairs@university.edu',
    password: 'password123',
    role: 'staff-affairs',
    profile: {
      firstName: 'Student Affairs',
      lastName: 'Staff',
      phone: '+234-800-000-0003'
    }
  },
  {
    username: 'lecturer',
    email: 'lecturer@university.edu',
    password: 'password123',
    role: 'academic-staff',
    profile: {
      firstName: 'Dr. Academic',
      lastName: 'Lecturer',
      phone: '+234-800-000-0004'
    }
  },
  {
    username: 'hod',
    email: 'hod@university.edu',
    password: 'password123',
    role: 'head-department',
    profile: {
      firstName: 'Prof. Head',
      lastName: 'Department',
      phone: '+234-800-000-0005'
    }
  },
  {
    username: 'student',
    email: 'student@university.edu',
    password: 'password123',
    role: 'student',
    profile: {
      firstName: 'John',
      lastName: 'Student',
      phone: '+234-800-000-0006'
    }
  }
];

async function createDemoUsers() {
  try {
    await connectDB();
    
    logger.info('Creating demo users...');
    
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        await User.create(userData);
        logger.success(`Created demo user: ${userData.email} (${userData.role})`);
      } else {
        logger.info(`Demo user already exists: ${userData.email}`);
      }
    }
    
    logger.success('Demo users creation completed!');
    process.exit(0);
  } catch (error) {
    logger.error('Error creating demo users:', error);
    process.exit(1);
  }
}

createDemoUsers();