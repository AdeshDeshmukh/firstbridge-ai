// scripts/seed-scholarships.ts
// Run: pnpm --filter backend tsx scripts/seed-scholarships.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const scholarships = [
  {
    name: 'Gates Scholarship',
    organization: 'Bill & Melinda Gates Foundation',
    amount: 20000,
    deadline: new Date('2026-09-15'),
    description: 'Full scholarship for exceptional minority students with significant financial need.',
    eligibility: 'Must be a minority student, Pell Grant eligible, high academic achievement',
    majors: ['All majors'],
    url: 'https://www.thegatesscholarship.org',
  },
  {
    name: 'Coca-Cola Scholars Program',
    organization: 'Coca-Cola Scholars Foundation',
    amount: 20000,
    deadline: new Date('2026-10-01'),
    description: 'Merit-based scholarship for high-achieving high school seniors.',
    eligibility: 'High school senior, minimum 3.0 GPA',
    majors: ['All majors'],
    url: 'https://www.coca-colascholarsfoundation.org',
  },
  {
    name: 'Dell Scholars Program',
    organization: 'Michael & Susan Dell Foundation',
    amount: 20000,
    deadline: new Date('2026-12-01'),
    description: 'For students who have overcome significant obstacles to pursue higher education.',
    eligibility: 'First-generation college student, demonstrated financial need',
    majors: ['All majors'],
    url: 'https://www.dellscholars.org',
  },
  {
    name: 'Jack Kent Cooke Foundation Scholarship',
    organization: 'Jack Kent Cooke Foundation',
    amount: 55000,
    deadline: new Date('2026-11-15'),
    description: 'The largest private scholarship in the US for high-achieving students with financial need.',
    eligibility: 'High financial need, academic excellence, demonstrated leadership',
    majors: ['All majors'],
    url: 'https://www.jkcf.org',
  },
  {
    name: 'Hispanic Scholarship Fund',
    organization: 'Hispanic Scholarship Fund',
    amount: 5000,
    deadline: new Date('2026-02-15'),
    description: 'Scholarships for Hispanic American students in higher education.',
    eligibility: 'Hispanic heritage, minimum 2.5 GPA',
    majors: ['All majors'],
    url: 'https://www.hsf.net',
  },
  {
    name: 'Google Generation Scholarship',
    organization: 'Google',
    amount: 10000,
    deadline: new Date('2026-12-15'),
    description: 'For students with disabilities pursuing degrees in computer science.',
    eligibility: 'Student with disability, pursuing CS degree',
    majors: ['Computer Science', 'Engineering'],
    url: 'https://buildyourfuture.withgoogle.com/scholarships',
  },
  {
    name: 'Society of Women Engineers Scholarship',
    organization: 'Society of Women Engineers',
    amount: 15000,
    deadline: new Date('2026-02-01'),
    description: 'For women pursuing undergraduate or graduate engineering degrees.',
    eligibility: 'Female student, engineering major',
    majors: ['Engineering', 'Computer Science'],
    url: 'https://swe.org/scholarships',
  },
  {
    name: 'Ron Brown Scholar Program',
    organization: 'CAP Charitable Foundation',
    amount: 40000,
    deadline: new Date('2026-11-01'),
    description: 'For African American students demonstrating academic excellence and leadership.',
    eligibility: 'African American student, financial need, community service',
    majors: ['All majors'],
    url: 'https://www.ronbrown.org',
  },
  {
    name: 'NSPE Engineering Scholarship',
    organization: 'National Society of Professional Engineers',
    amount: 2500,
    deadline: new Date('2026-03-01'),
    description: 'For engineering students demonstrating academic excellence.',
    eligibility: 'Engineering student, minimum 3.0 GPA',
    majors: ['Engineering'],
    url: 'https://www.nspe.org',
  },
  {
    name: 'American Institute of Architects Scholarship',
    organization: 'American Institute of Architects',
    amount: 4000,
    deadline: new Date('2026-02-01'),
    description: 'For architecture students with demonstrated financial need.',
    eligibility: 'Architecture student, financial need',
    majors: ['Architecture'],
    url: 'https://www.aia.org',
  },
  {
    name: 'AAUW Career Development Grant',
    organization: 'American Association of University Women',
    amount: 12000,
    deadline: new Date('2026-11-15'),
    description: 'For women preparing for career advancement.',
    eligibility: 'Female student, career development focus',
    majors: ['All majors'],
    url: 'https://www.aauw.org',
  },
  {
    name: 'Horatio Alger Scholarship',
    organization: 'Horatio Alger Association',
    amount: 25000,
    deadline: new Date('2026-10-25'),
    description: 'For students who have overcome adversity and demonstrate integrity.',
    eligibility: 'Demonstrated financial need, overcome adversity, minimum 2.0 GPA',
    majors: ['All majors'],
    url: 'https://scholars.horatioalger.org',
  },
  {
    name: 'Questbridge National College Match',
    organization: 'Questbridge',
    amount: 40000,
    deadline: new Date('2026-09-26'),
    description: 'Full scholarship to top colleges for high-achieving low-income students.',
    eligibility: 'High academic achievement, low family income, first-generation preferred',
    majors: ['All majors'],
    url: 'https://www.questbridge.org',
  },
  {
    name: 'United Negro College Fund',
    organization: 'United Negro College Fund',
    amount: 7500,
    deadline: new Date('2026-03-15'),
    description: 'For African American students at UNCF member institutions.',
    eligibility: 'African American student, attending UNCF member institution',
    majors: ['All majors'],
    url: 'https://www.uncf.org',
  },
  {
    name: 'Tylenol Future Care Scholarship',
    organization: 'McNeil Consumer Healthcare',
    amount: 10000,
    deadline: new Date('2026-06-15'),
    description: 'For students pursuing healthcare-related careers.',
    eligibility: 'Healthcare major, demonstrated financial need',
    majors: ['Nursing', 'Medicine', 'Public Health', 'Biology'],
    url: 'https://www.tylenol.com/news/scholarship',
  },
  {
    name: 'AMS Minority Scholarship',
    organization: 'American Meteorological Society',
    amount: 10000,
    deadline: new Date('2026-02-01'),
    description: 'For underrepresented minority students in atmospheric sciences.',
    eligibility: 'Minority student, atmospheric sciences major, financial need',
    majors: ['Atmospheric Science', 'Environmental Science'],
    url: 'https://www.ametsoc.org',
  },
  {
    name: 'SMART Scholarship',
    organization: 'US Department of Defense',
    amount: 30000,
    deadline: new Date('2026-12-01'),
    description: 'For STEM students pursuing DoD-related careers.',
    eligibility: 'STEM major, US citizen, willing to work for DoD',
    majors: ['Engineering', 'Computer Science', 'Physics', 'Mathematics'],
    url: 'https://www.smartscholarship.org',
  },
  {
    name: 'American Chemical Society Scholars',
    organization: 'American Chemical Society',
    amount: 5000,
    deadline: new Date('2026-03-01'),
    description: 'For underrepresented minority students studying chemistry.',
    eligibility: 'Minority student, chemistry major, minimum 3.0 GPA',
    majors: ['Chemistry', 'Biochemistry'],
    url: 'https://www.acs.org',
  },
  {
    name: 'Davidson Fellows Scholarship',
    organization: 'Davidson Institute',
    amount: 50000,
    deadline: new Date('2026-02-12'),
    description: 'For profoundly gifted young people who complete remarkable projects.',
    eligibility: 'Under 18, completed significant project in STEM or humanities',
    majors: ['All majors'],
    url: 'https://www.davidsongifted.org',
  },
  {
    name: 'Environmental Sustainability Scholarship',
    organization: 'National Environmental Health Association',
    amount: 2000,
    deadline: new Date('2026-02-01'),
    description: 'For students pursuing environmental health and sustainability careers.',
    eligibility: 'Environmental health major, academic merit',
    majors: ['Environmental Science', 'Public Health', 'Biology'],
    url: 'https://www.neha.org',
  },
]

async function seedScholarships() {
  console.log('Seeding scholarships...')

  // Delete existing scholarships first (clean seed)
  await prisma.scholarship.deleteMany({})
  console.log('Cleared existing scholarships')

  // Insert all scholarships
  const created = await prisma.scholarship.createMany({
    data: scholarships.map((s) => ({
      ...s,
      isActive: true,
      sourceVerified: true,
    }))
  })

  console.log(`Created ${created.count} scholarships`)

  // Verify
  const count = await prisma.scholarship.count()
  console.log(`Total scholarships in DB: ${count}`)

  await prisma.$disconnect()
}

seedScholarships()
  .then(() => {
    console.log('Scholarship seeding complete')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Seeding failed:', err)
    process.exit(1)
  })