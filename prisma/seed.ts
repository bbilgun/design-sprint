/**
 * prisma/seed.ts
 * Seeds the database with realistic sample data for development.
 * Run: npm run db:seed
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hash(password: string) {
  return bcrypt.hash(password, 12)
}

const memberData = [
  { name: 'Alice Chen',   email: 'alice@techclub.edu' },
  { name: 'Bob Martinez', email: 'bob@techclub.edu'   },
  { name: 'Carol Park',   email: 'carol@techclub.edu' },
  { name: 'David Kim',    email: 'david@techclub.edu' },
  { name: 'Eva Rossi',    email: 'eva@techclub.edu'   },
  { name: 'Frank Nguyen', email: 'frank@techclub.edu' },
  { name: 'Grace Okafor', email: 'grace@techclub.edu' },
  { name: 'Henry Patel',  email: 'henry@techclub.edu' },
]

const ideaData = [
  {
    title: 'AI for Good Hackathon',
    description:
      'A 24-hour hackathon focused on building AI-powered solutions for social impact. Teams of 3–5 will tackle real-world challenges provided by local NGOs. Mentors from industry will guide participants. Final presentations judged by a panel of experts.',
    category: 'Hackathon',
    impactScore: 5,
    feasibilityScore: 3,
    status: 'SHORTLISTED',
  },
  {
    title: 'Web3 & Blockchain Workshop Series',
    description:
      'Three-session workshop introducing smart contract development with Solidity, DeFi concepts, and NFT creation. Each session is 2 hours with hands-on coding exercises. Participants need only basic JavaScript knowledge.',
    category: 'Workshop',
    impactScore: 4,
    feasibilityScore: 4,
    status: 'SELECTED',
  },
  {
    title: 'Industry Panel: Breaking into Big Tech',
    description:
      'Invite 4–6 alumni working at FAANG companies to share their journey, interview tips, and career advice. Live Q&A session. Recording distributed to members who cannot attend.',
    category: 'Panel',
    impactScore: 5,
    feasibilityScore: 5,
    status: 'SHORTLISTED',
  },
  {
    title: 'Open-Source Contribution Sprint',
    description:
      'A weekend event where members select beginner-friendly open-source repositories and work together to submit meaningful PRs. Includes a brief intro to Git collaboration workflows and OSS etiquette.',
    category: 'Workshop',
    impactScore: 4,
    feasibilityScore: 5,
    status: 'DRAFT',
  },
  {
    title: 'Cybersecurity CTF Competition',
    description:
      'Capture The Flag competition with challenges ranging from easy to expert. Categories include reverse engineering, web exploitation, cryptography, and forensics. Cash prizes for top 3 teams.',
    category: 'Hackathon',
    impactScore: 4,
    feasibilityScore: 3,
    status: 'DRAFT',
  },
  {
    title: 'Tech Club Networking Night',
    description:
      'Casual mixer for club members and invited guests from local startups. Board games, tech trivia, and light refreshments. Great opportunity to build connections in a relaxed setting.',
    category: 'Social',
    impactScore: 3,
    feasibilityScore: 5,
    status: 'DRAFT',
  },
  {
    title: 'Machine Learning Study Group',
    description:
      'Bi-weekly study group working through a structured ML curriculum (fast.ai or Andrew Ng). Members present topics in rotation, share notebooks, and collaborate on a final mini-project.',
    category: 'Workshop',
    impactScore: 4,
    feasibilityScore: 4,
    status: 'DRAFT',
  },
  {
    title: 'Startup Pitch Night',
    description:
      'Members pitch their startup ideas in 5-minute presentations to a panel of judges including professors and local entrepreneurs. Feedback-focused, not competitive. Encourages entrepreneurial thinking.',
    category: 'Other',
    impactScore: 4,
    feasibilityScore: 4,
    status: 'DRAFT',
  },
  {
    title: 'DevOps & Cloud Bootcamp',
    description:
      'A one-day intensive bootcamp covering Docker, Kubernetes basics, CI/CD pipelines, and AWS fundamentals. Attendees get hands-on access to a shared cloud environment for labs.',
    category: 'Workshop',
    impactScore: 5,
    feasibilityScore: 2,
    status: 'DRAFT',
  },
  {
    title: 'Women in Tech Speaker Series',
    description:
      'Monthly speaker series featuring women leaders in the tech industry. Each session focuses on a different career path—engineering, product, design, VC. Open to the entire university.',
    category: 'Tech Talk',
    impactScore: 5,
    feasibilityScore: 4,
    status: 'DRAFT',
  },
]

async function main() {
  console.log('🌱  Starting seed...')

  // Clean existing data
  await prisma.vote.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.idea.deleteMany()
  await prisma.sprintSession.deleteMany()
  await prisma.user.deleteMany()
  console.log('  ✓  Cleared existing data')

  // Admin
  const adminEmail    = process.env.SEED_ADMIN_EMAIL    ?? 'admin@techclub.edu'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123'

  const admin = await prisma.user.create({
    data: {
      name:         'Tech Club Admin',
      email:        adminEmail,
      passwordHash: await hash(adminPassword),
      role:         'ADMIN',
    },
  })
  console.log(`  ✓  Admin created: ${admin.email}`)

  // Members
  const memberPw = await hash('Member@123')
  const members = await Promise.all(
    memberData.map((m) =>
      prisma.user.create({
        data: { name: m.name, email: m.email, passwordHash: memberPw, role: 'MEMBER' },
      })
    )
  )
  console.log(`  ✓  ${members.length} members created`)

  // Sprint
  const sprint = await prisma.sprintSession.create({
    data: {
      title:       'Spring 2024 Event Ideation Sprint',
      description: 'Our bi-annual sprint to collectively decide on the best events for the upcoming semester.',
      status:      'VOTING',
    },
  })
  console.log(`  ✓  Sprint session created: "${sprint.title}"`)

  // Ideas
  const allUsers = [admin, ...members]
  const createdIdeas = await Promise.all(
    ideaData.map((idea, i) =>
      prisma.idea.create({
        data: {
          ...idea,
          authorId: allUsers[i % allUsers.length].id,
          sprintId: sprint.id,
        },
      })
    )
  )
  console.log(`  ✓  ${createdIdeas.length} ideas created`)

  // Votes — each user votes on 3–7 random ideas
  const voteEntries: { userId: string; ideaId: string }[] = []
  for (const user of allUsers) {
    const shuffled   = [...createdIdeas].sort(() => Math.random() - 0.5)
    const voteCount  = Math.floor(Math.random() * 5) + 3
    const toVote     = shuffled.slice(0, voteCount)
    for (const idea of toVote) {
      if (!voteEntries.find((v) => v.userId === user.id && v.ideaId === idea.id)) {
        voteEntries.push({ userId: user.id, ideaId: idea.id })
      }
    }
  }
  await prisma.vote.createMany({ data: voteEntries })
  console.log(`  ✓  ${voteEntries.length} votes created`)

  // Comments
  const sampleComments = [
    'This is a fantastic idea! I would definitely attend.',
    'We tried something similar last year and it was a huge success.',
    'Could we partner with the CS department for resources?',
    'I have connections with a few industry folks who might want to mentor.',
    'Love the concept. Would it be possible to record the sessions?',
    'We should promote this to other clubs as well.',
    'This fits perfectly with our semester goals.',
    'I am happy to help organise this if we move forward.',
    'Might be resource-intensive. Should we plan it for next semester?',
    'Great idea! Lets make sure to advertise early.',
  ]

  const commentEntries = createdIdeas.flatMap((idea, ideaIdx) =>
    [0, 1, 2].map((commentIdx) => ({
      content: sampleComments[(ideaIdx + commentIdx) % sampleComments.length],
      userId:  allUsers[(ideaIdx + commentIdx + 1) % allUsers.length].id,
      ideaId:  idea.id,
    }))
  )
  await prisma.comment.createMany({ data: commentEntries })
  console.log(`  ✓  ${commentEntries.length} comments created`)

  console.log('\n🎉  Seed complete!')
  console.log(`\n   Admin  → ${adminEmail} / ${adminPassword}`)
  console.log(`   Member → alice@techclub.edu / Member@123`)
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
