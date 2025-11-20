import { PrismaClient, WebinarStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing webinars
  await prisma.webinar.deleteMany()
  console.log('✅ Cleared existing webinars')

  // Create 10 sample webinars
  const webinars = [
    {
      title: 'Grant Writing Fundamentals for Nonprofits',
      subtitle: 'Master the basics of compelling grant proposals',
      slug: 'grant-writing-fundamentals',
      startsAt: new Date('2025-11-25T14:00:00Z'),
      durationM: 60,
      hostName: 'Sarah Johnson',
      hostTitle: 'Senior Grant Writer',
      hostBio: 'Sarah has helped nonprofits secure over $50M in funding.',
      status: WebinarStatus.PUBLISHED,
      jitsiRoomId: 'grant-writing-fundamentals-2025',
      maxCapacity: 5000,
    },
    {
      title: 'Building Your Nonprofit Budget',
      subtitle: 'Financial planning strategies for mission success',
      slug: 'nonprofit-budget-planning',
      startsAt: new Date('2025-11-27T15:00:00Z'),
      durationM: 90,
      hostName: 'Michael Chen',
      hostTitle: 'Nonprofit CFO',
      hostBio: 'Michael specializes in nonprofit financial management.',
      status: WebinarStatus.PUBLISHED,
      jitsiRoomId: 'nonprofit-budget-planning-2025',
      maxCapacity: 5000,
    },
    {
      title: 'Effective Board Governance',
      subtitle: 'Strengthen your nonprofit board leadership',
      slug: 'board-governance-essentials',
      startsAt: new Date('2025-11-29T13:00:00Z'),
      durationM: 75,
      hostName: 'Dr. Emily Rodriguez',
      hostTitle: 'Board Development Consultant',
      hostBio: 'Dr. Rodriguez has trained over 500 nonprofit boards.',
      status: WebinarStatus.PUBLISHED,
      jitsiRoomId: 'board-governance-essentials-2025',
      maxCapacity: 5000,
    },
    {
      title: 'Digital Marketing for Nonprofits',
      subtitle: 'Amplify your impact through social media',
      slug: 'digital-marketing-nonprofits',
      startsAt: new Date('2025-12-02T16:00:00Z'),
      durationM: 60,
      hostName: 'Jessica Taylor',
      hostTitle: 'Digital Marketing Strategist',
      hostBio: 'Jessica helps nonprofits grow their online presence.',
      status: WebinarStatus.PUBLISHED,
      jitsiRoomId: 'digital-marketing-nonprofits-2025',
      maxCapacity: 5000,
    },
    {
      title: 'Volunteer Recruitment and Retention',
      subtitle: 'Build a thriving volunteer program',
      slug: 'volunteer-management-best-practices',
      startsAt: new Date('2025-12-04T14:30:00Z'),
      durationM: 60,
      hostName: 'David Park',
      hostTitle: 'Volunteer Coordinator',
      hostBio: 'David has managed volunteer programs for 15+ years.',
      status: WebinarStatus.PUBLISHED,
      jitsiRoomId: 'volunteer-management-best-practices-2025',
      maxCapacity: 5000,
    },
    {
      title: 'Fundraising Event Planning',
      subtitle: 'Create memorable events that drive donations',
      slug: 'fundraising-event-strategies',
      startsAt: new Date('2025-12-06T17:00:00Z'),
      durationM: 90,
      hostName: 'Amanda White',
      hostTitle: 'Event Planning Director',
      hostBio: 'Amanda has planned 200+ successful fundraising events.',
      status: WebinarStatus.PUBLISHED,
      jitsiRoomId: 'fundraising-event-strategies-2025',
      maxCapacity: 5000,
    },
    {
      title: 'Impact Measurement and Reporting',
      subtitle: 'Demonstrate your nonprofit\'s effectiveness',
      slug: 'impact-measurement-reporting',
      startsAt: new Date('2025-12-09T15:00:00Z'),
      durationM: 75,
      hostName: 'Dr. James Martinez',
      hostTitle: 'Impact Assessment Specialist',
      hostBio: 'Dr. Martinez helps nonprofits measure and communicate impact.',
      status: WebinarStatus.PUBLISHED,
      jitsiRoomId: 'impact-measurement-reporting-2025',
      maxCapacity: 5000,
    },
    {
      title: 'Donor Cultivation Strategies',
      subtitle: 'Transform one-time givers into lifelong supporters',
      slug: 'donor-cultivation-strategies',
      startsAt: new Date('2025-12-11T14:00:00Z'),
      durationM: 60,
      hostName: 'Rebecca Kim',
      hostTitle: 'Development Director',
      hostBio: 'Rebecca specializes in major gift fundraising.',
      status: WebinarStatus.PUBLISHED,
      jitsiRoomId: 'donor-cultivation-strategies-2025',
      maxCapacity: 5000,
    },
    {
      title: 'Nonprofit Technology Essentials',
      subtitle: 'Leverage tech tools to maximize efficiency',
      slug: 'nonprofit-technology-tools',
      startsAt: new Date('2025-12-13T16:30:00Z'),
      durationM: 60,
      hostName: 'Thomas Anderson',
      hostTitle: 'Technology Consultant',
      hostBio: 'Thomas helps nonprofits adopt the right technology solutions.',
      status: WebinarStatus.PUBLISHED,
      jitsiRoomId: 'nonprofit-technology-tools-2025',
      maxCapacity: 5000,
    },
    {
      title: 'Strategic Planning for Growth',
      subtitle: 'Scale your nonprofit\'s impact sustainably',
      slug: 'strategic-planning-growth',
      startsAt: new Date('2025-12-16T15:00:00Z'),
      durationM: 90,
      hostName: 'Linda Thompson',
      hostTitle: 'Strategy Consultant',
      hostBio: 'Linda guides nonprofits through transformative growth.',
      status: WebinarStatus.PUBLISHED,
      jitsiRoomId: 'strategic-planning-growth-2025',
      maxCapacity: 5000,
    },
  ]

  for (const webinar of webinars) {
    await prisma.webinar.create({
      data: webinar,
    })
    console.log(`✅ Created webinar: ${webinar.title}`)
  }

  console.log('🎉 Database seeded successfully with 10 webinars!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
