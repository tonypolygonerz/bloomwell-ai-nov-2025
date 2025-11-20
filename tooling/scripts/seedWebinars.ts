import prisma from '@bloomwell/db'

// Host profiles
const hosts = [
  {
    name: 'Sarah Martinez, CPA',
    title: 'Nonprofit Financial Consultant',
    bio: 'Sarah has guided over 200 organizations through the nonprofit formation process and specializes in financial planning for emerging nonprofits. With 15 years of experience in nonprofit accounting and tax compliance, she helps organizations navigate complex financial regulations and build sustainable funding models.',
  },
  {
    name: 'Dr. Michael Chen',
    title: 'Nonprofit Strategy Consultant',
    bio: 'Dr. Chen is a recognized expert in nonprofit strategy and organizational development, having worked with over 150 nonprofits to improve their impact and operational efficiency. He holds a Ph.D. in Organizational Psychology and specializes in helping organizations scale their programs while maintaining mission focus.',
  },
  {
    name: 'Jennifer Williams, CFRE',
    title: 'Fundraising Specialist',
    bio: 'Jennifer is a Certified Fund Raising Executive with 20 years of experience helping nonprofits raise over $50 million in funding. She specializes in major donor cultivation, grant writing, and developing comprehensive fundraising strategies that align with organizational values and goals.',
  },
  {
    name: 'Robert Thompson, JD',
    title: 'Legal & Governance Expert',
    bio: 'Robert is an attorney specializing in nonprofit law, board governance, and compliance issues. He has helped establish over 100 nonprofit organizations and provides ongoing legal counsel to boards on governance best practices, risk management, and regulatory compliance.',
  },
]

// Utility function to generate URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100) // Limit length
}

// Utility function to generate unique jitsiRoomId
function generateJitsiRoomId(slug: string, index: number): string {
  return `bloomwell-webinar-${slug}-${Date.now()}-${index}`
}

// Utility function to create Pacific timezone date
function createPacificDate(
  year: number,
  month: number, // 0-indexed (0 = January)
  day: number,
  hour: number,
  minute: number = 0
): Date {
  // Create date string in ISO format (assumes Pacific time)
  // Pacific time is UTC-8 (PST) or UTC-7 (PDT)
  // November/December 2025 should be PST (UTC-8), January 2026 should be PST (UTC-8)
  // Note: DST ends Nov 2, 2025, so Nov 26+ is PST
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00-08:00`
  const date = new Date(dateStr)
  // Verify the date is valid
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`)
  }
  return date
}

// Webinar data with specific dates from user requirements
const webinars = [
  {
    title: 'From Idea to Impact: 7 Steps to Launch Your Nonprofit',
    subtitle: 'Complete guide to starting your nonprofit organization',
    startsAt: createPacificDate(2025, 10, 26, 10), // Nov 26, 2025, 10am PT (month is 0-indexed, so 10 = November)
    hostIndex: 0, // Sarah Martinez - Financial/compliance
  },
  {
    title: '501(c)(3) Tax Exemption: Everything You Need to Know',
    subtitle: 'Navigate the tax exemption process with confidence',
    startsAt: createPacificDate(2025, 10, 27, 15), // Nov 27, 2025, 3pm PT
    hostIndex: 0, // Sarah Martinez - Financial/compliance
  },
  {
    title: 'Grant Writing Fundamentals for First-Time Applicants',
    subtitle: 'Master the essentials of successful grant applications',
    startsAt: createPacificDate(2025, 11, 3, 10), // Dec 3, 2025, 10am PT
    hostIndex: 2, // Jennifer Williams - Fundraising
  },
  {
    title: 'Federal vs Foundation Grants: Which Path is Right for You?',
    subtitle: 'Understand the differences and choose the best funding strategy',
    startsAt: createPacificDate(2025, 11, 4, 15), // Dec 4, 2025, 3pm PT
    hostIndex: 2, // Jennifer Williams - Fundraising
  },
  {
    title: 'Major Donor Cultivation: Building Lasting Relationships',
    subtitle: 'Develop strategies to identify, engage, and retain major donors',
    startsAt: createPacificDate(2025, 11, 10, 10), // Dec 10, 2025, 10am PT
    hostIndex: 2, // Jennifer Williams - Fundraising
  },
  {
    title: 'Board Governance Best Practices for Small Nonprofits',
    subtitle: 'Establish effective governance structures that support your mission',
    startsAt: createPacificDate(2025, 11, 17, 10), // Dec 17, 2025, 10am PT
    hostIndex: 3, // Robert Thompson - Legal/governance
  },
  {
    title: 'Annual Reporting Made Simple: 990s and Compliance',
    subtitle: 'Streamline your annual reporting and stay compliant with IRS requirements',
    startsAt: createPacificDate(2026, 0, 8, 10), // Jan 8, 2026, 10am PT
    hostIndex: 0, // Sarah Martinez - Financial/compliance
  },
  {
    title: 'Volunteer Management: Recruit, Train, and Retain',
    subtitle: 'Build a thriving volunteer program that amplifies your impact',
    startsAt: createPacificDate(2026, 0, 9, 14), // Jan 9, 2026, 2pm PT
    hostIndex: 1, // Dr. Michael Chen - Strategy
  },
  {
    title: 'Diversifying Revenue: Beyond Traditional Fundraising',
    subtitle: 'Explore innovative revenue streams to build financial sustainability',
    startsAt: createPacificDate(2026, 0, 15, 10), // Jan 15, 2026, 10am PT
    hostIndex: 1, // Dr. Michael Chen - Strategy
  },
  {
    title: 'Digital Marketing Strategies for Nonprofit Growth',
    subtitle: 'Leverage digital tools to expand your reach and engage supporters',
    startsAt: createPacificDate(2026, 0, 16, 14), // Jan 16, 2026, 2pm PT
    hostIndex: 1, // Dr. Michael Chen - Strategy
  },
]

async function seedWebinars() {
  console.log('🌱 Starting webinar seed...\n')

  try {
    // Check for existing webinars
    const existingCount = await prisma.webinar.count()
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing webinars in database`)
      console.log('   Skipping seed to avoid duplicates.\n')
      console.log('   To re-seed, delete existing webinars first.')
      return
    }

    let created = 0
    let errors: string[] = []

    for (let i = 0; i < webinars.length; i++) {
      const webinarData = webinars[i]
      const host = hosts[webinarData.hostIndex]

      try {
        const slug = generateSlug(webinarData.title)
        const jitsiRoomId = generateJitsiRoomId(slug, i)

        // Check if slug already exists (shouldn't happen, but safety check)
        const existing = await prisma.webinar.findUnique({
          where: { slug },
        })

        if (existing) {
          console.log(`⚠️  Skipping "${webinarData.title}" - slug already exists`)
          continue
        }

        await prisma.webinar.create({
          data: {
            title: webinarData.title,
            subtitle: webinarData.subtitle,
            slug,
            startsAt: webinarData.startsAt,
            durationM: 60,
            hostName: host.name,
            hostTitle: host.title,
            hostBio: host.bio,
            status: 'PUBLISHED',
            jitsiRoomId,
            maxCapacity: 5000,
          },
        })

        created++
        console.log(`✅ Created: "${webinarData.title}"`)
        console.log(`   Scheduled: ${webinarData.startsAt.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PT`)
        console.log(`   Host: ${host.name}\n`)
      } catch (error) {
        const errorMsg = `Failed to create "${webinarData.title}": ${error}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}\n`)
      }
    }

    console.log('='.repeat(60))
    console.log(`\n📊 Seed Summary:`)
    console.log(`   Created: ${created}/${webinars.length} webinars`)
    if (errors.length > 0) {
      console.log(`   Errors: ${errors.length}`)
      errors.forEach((err) => console.log(`   - ${err}`))
    } else {
      console.log(`   ✅ All webinars created successfully!`)
    }
    console.log('')

    // Verify webinars were created
    const totalWebinars = await prisma.webinar.count()
    console.log(`📈 Total webinars in database: ${totalWebinars}`)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Allow running as a script
if (require.main === module) {
  seedWebinars()
    .then(() => {
      console.log('✨ Seed complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Seed failed:', error)
      process.exit(1)
    })
}

export { seedWebinars }

