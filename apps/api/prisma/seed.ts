// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

/* ------------------------------ Utils ------------------------------ */
const addMinutes = (d: Date, m: number) => new Date(d.getTime() + m * 60000)
const addDays = (d: Date, days: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}
const startOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
const nextIso = (daysFromToday: number) => addDays(startOfDay(new Date()), daysFromToday).toISOString()

/** Sicheres Tag-Anlegen.
 *  Nutzt upsert mit (userId, name), wenn es den Unique-Index gibt.
 *  Falls nicht, fällt es auf findFirst/create zurück.
 */
async function ensureTag(userId: string, name: string) {
  try {
    return await prisma.tag.upsert({
      where: { userId_name: { userId, name } }, // benötigt @@unique([userId, name], name: "userId_name")
      update: {},
      create: { userId, name },
    })
  } catch {
    const existing = await prisma.tag.findFirst({ where: { userId, name } })
    if (existing) return existing
    return prisma.tag.create({ data: { userId, name } })
  }
}

async function main() {
  console.log('🌱 Seeding database...')

  /* ------------------------------ User ------------------------------ */
  const hashedPassword = await hash('password123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword, // passe den Feldnamen an dein Schema an (password vs. passwordHash)
    },
  })
  console.log('✅ User:', user.email)

  /* ---------------------------- Clean-up ---------------------------- */
  // Demo: räume vorherige Daten des Users weg (idempotent für Tasks/Tags/Subjects/Sessions)
  await prisma.taskTag.deleteMany({ where: { task: { userId: user.id } } })
  await prisma.task.deleteMany({ where: { userId: user.id } })
  await prisma.tag.deleteMany({ where: { userId: user.id } })
  await prisma.subject.deleteMany({ where: { userId: user.id } })
  await prisma.studySession.deleteMany({ where: { userId: user.id } })

  /* ---------------------------- Subjects ---------------------------- */
  const subjects = await prisma.$transaction([
    prisma.subject.create({ data: { name: 'Mathe', userId: user.id } }),
    prisma.subject.create({ data: { name: 'Englisch', userId: user.id } }),
    prisma.subject.create({ data: { name: 'Geschichte', userId: user.id } }),
  ])
  const subjectByName = Object.fromEntries(subjects.map(s => [s.name, s.id]))
  console.log('✅ Subjects:', subjects.map(s => s.name).join(', '))

  /* ------------------------------ Tags ------------------------------ */
  const tagNames = ['#Üben', '#Vokabeln', '#Lesen', '#Zusammenfassung']
  const tags = await Promise.all(tagNames.map(n => ensureTag(user.id, n)))
  const tagIdByName = Object.fromEntries(tags.map(t => [t.name, t.id]))
  console.log('✅ Tags:', tags.map(t => t.name).join(', '))

  /* ------------------------------- Tasks ------------------------------- */
  // Hinweis: Task.status = 'TODO' | 'IN_PROGRESS' | 'DONE' (String in deinem Schema)
  const seedTasks = [
    {
      title: 'Funktionen Zusammenfassung',
      description: 'Kernbegriffe und Beispiele notieren.',
      dueDate: nextIso(2),
      priority: 3, // high
      status: 'TODO',
      estimatedMinutes: 90,
      subjectId: subjectByName['Mathe'],
      tagNames: ['#Zusammenfassung', '#Üben'],
    },
    {
      title: 'Vokabel-Set A',
      description: 'Liste A1 wiederholen.',
      dueDate: nextIso(1),
      priority: 2, // medium
      status: 'IN_PROGRESS',
      estimatedMinutes: 30,
      subjectId: subjectByName['Englisch'],
      tagNames: ['#Vokabeln'],
    },
    {
      title: 'WWI Kapitel lesen',
      description: 'Kapitel 3 – Ursachen des Krieges.',
      dueDate: nextIso(5),
      priority: 1, // low
      status: 'DONE',
      estimatedMinutes: 45,
      subjectId: subjectByName['Geschichte'],
      tagNames: ['#Lesen'],
    },
    {
      title: 'Ableitungen üben',
      description: null,
      dueDate: nextIso(3),
      priority: 2,
      status: 'TODO',
      estimatedMinutes: 60,
      subjectId: subjectByName['Mathe'],
      tagNames: ['#Üben'],
    },
  ] as const

  for (const t of seedTasks) {
    await prisma.task.create({
      data: {
        user: { connect: { id: user.id } },                    // statt userId
        title: t.title,
        description: t.description ?? null,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
        priority: t.priority ?? 2,
        status: t.status,
        estimatedMinutes: t.estimatedMinutes ?? null,
        subject: t.subjectId ? { connect: { id: t.subjectId } } : undefined,  // Relation
        tags: t.tagNames.length
          ? {
              create: t.tagNames.map(name => ({
                tag: { connect: { id: tagIdByName[name] } },   // Relation
              })),
            }
          : undefined,
      },
      include: { subject: true, tags: { include: { tag: true } } },
    })
  }
  console.log('✅ Tasks erstellt:', seedTasks.length)

  /* -------------------------- Study Sessions -------------------------- */
  const now = new Date()
  // Letzter Montag (Mo=1), JS getDay(): So=0..Sa=6
  const monday = new Date(now)
  const shift = ((now.getDay() + 6) % 7) // 0 = Montag, 6 = Sonntag
  monday.setDate(now.getDate() - shift)
  monday.setHours(9, 0, 0, 0)

  const sessions = [
    {
      title: 'Mathe: Funktionen',
      scheduledStart: monday,
      scheduledEnd: addMinutes(monday, 45),
      actualStart: monday,
      actualEnd: addMinutes(monday, 45),
      userId: user.id,
    },
    {
      title: 'Englisch: Vokabeln',
      scheduledStart: addMinutes(addDays(monday, 1), 60),
      scheduledEnd: addMinutes(addDays(monday, 1), 90),
      userId: user.id,
    },
    {
      title: 'Geschichte: WWI',
      scheduledStart: addDays(monday, 2),
      scheduledEnd: addMinutes(addDays(monday, 2), 60),
      userId: user.id,
    },
  ]

  await prisma.studySession.createMany({ data: sessions })
  console.log('✅ Study Sessions erstellt:', sessions.length)

  console.log('🎉 Seed fertig.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })