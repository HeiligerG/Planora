import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // User erstellen
  const hashedPassword = await hash('password123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    }
  })

  console.log('✅ Created user:', user.email)

// Study Sessions erstellen
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)) // Letzter Montag
  monday.setHours(9, 0, 0, 0)

  const sessions = [
    {
      title: 'Mathe: Funktionen',
      scheduledStart: new Date(monday.getTime()),
      scheduledEnd: new Date(monday.getTime() + 45 * 60000),
      actualStart: new Date(monday.getTime()),
      actualEnd: new Date(monday.getTime() + 45 * 60000),
      userId: user.id,
    },
    {
      title: 'Englisch: Vokabeln',
      scheduledStart: new Date(monday.getTime() + 24 * 60 * 60000 + 60 * 60000),
      scheduledEnd: new Date(monday.getTime() + 24 * 60 * 60000 + 90 * 60000),
      userId: user.id,
    },
    {
      title: 'Geschichte: WWI',
      scheduledStart: new Date(monday.getTime() + 48 * 60 * 60000),
      scheduledEnd: new Date(monday.getTime() + 48 * 60 * 60000 + 60 * 60000),
      userId: user.id,
    },
  ]

  for (const session of sessions) {
    await prisma.studySession.create({ data: session })
  }

  console.log('✅ Created study sessions')

  // Weitere Test-Daten...
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
