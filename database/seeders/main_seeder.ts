import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Section from '#models/section'

export default class extends BaseSeeder {
  async run() {
    // Create admin user only if it doesn't exist
    const existingUser = await User.findBy('email', 'admin@example.com')
    if (!existingUser) {
      await User.create({
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
      })
      console.log('✅ Created admin user (admin@example.com / password123)')
    } else {
      console.log('ℹ️ Admin user already exists, skipping')
    }

    // Create sample accordion sections
    const sections = [
      {
        title: 'Introduction',
        content:
          'Welcome to our book! This comprehensive guide will take you on a journey through fascinating topics and engaging stories. Each chapter builds upon the last, creating a rich narrative that will captivate and educate.',
        displayOrder: 10,
        isPublished: true,
      },
      {
        title: 'Chapter 1: Getting Started',
        content:
          'In this opening chapter, we lay the foundation for everything that follows. You\'ll learn the core concepts and principles that will guide you through the rest of the book. Take your time with this section - it\'s important!',
        displayOrder: 20,
        isPublished: true,
      },
      {
        title: 'Chapter 2: Deep Dive',
        content:
          'Now that you understand the basics, we\'re ready to explore more advanced topics. This chapter delves into the details, providing practical examples and real-world applications of what you\'ve learned.',
        displayOrder: 30,
        isPublished: true,
      },
      {
        title: 'About the Author',
        content:
          'Meet the author behind this work. With years of experience in the field, they bring a unique perspective and wealth of knowledge. Their passion for the subject shines through on every page.',
        displayOrder: 40,
        isPublished: true,
      },
      {
        title: 'Coming Soon: Chapter 3',
        content:
          'This chapter is currently being written and will be available soon. Stay tuned for updates!',
        displayOrder: 50,
        isPublished: false,
      },
    ]

    for (const section of sections) {
      await Section.firstOrCreate({ title: section.title }, section)
    }

    console.log('✅ Seeded sample accordion sections')
  }
}