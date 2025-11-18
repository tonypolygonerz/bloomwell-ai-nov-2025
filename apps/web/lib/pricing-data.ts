export const pricingPlans = [
  {
    id: 'monthly',
    name: 'Bloomwell AI Monthly',
    price: '$24.99',
    period: '/month',
    badge: null,
    features: [
      'Access to 73,000+ federal grants',
      'AI-powered grant matching & recommendations',
      '24/7 expert AI assistant with 128K context',
      'Monthly live expert webinars',
      'Real-time grant alerts & notifications',
      'Email support',
    ],
    cta: 'Start Your 14-Day Free Trial',
    subtext: ['14-day free trial', 'No credit card required', 'Cancel anytime'],
  },
  {
    id: 'annual',
    name: 'Bloomwell AI Annual',
    price: '$251.88',
    period: '/year',
    pricePerMonth: '$20.99/month',
    badge: 'SAVE 16%',
    features: [
      'Everything in Monthly, plus:',
      'Save $48 per year',
      'Priority email support',
      'Early access to new features',
    ],
    cta: 'Start Your 14-Day Free Trial',
    subtext: ['14-day free trial', 'No credit card required', 'Cancel anytime'],
  },
  {
    id: 'enterprise-monthly',
    name: 'Bloomwell AI Enterprise Monthly',
    price: '$29.99',
    period: '/month',
    badge: 'MOST POPULAR',
    features: [
      'Access to 73,000+ federal grants',
      'AI-powered grant matching & recommendations',
      '24/7 expert AI assistant with 128K context',
      'Monthly live expert webinars',
      'Real-time grant notifications',
      'Priority email support',
      'Cancel anytime guarantee',
      'Cancel anytime',
    ],
    cta: 'Start Your Free Trial Today',
    subtext: ['No credit card required', 'Cancel anytime'],
  },
  {
    id: 'enterprise-annual',
    name: 'Bloomwell AI Enterprise Annual',
    price: '$767.88',
    period: '/year',
    pricePerMonth: '$63.99/month',
    badge: 'BEST VALUE',
    features: [
      'Everything in Enterprise Monthly, plus:',
      'Save $192 per year',
      'Quarterly strategic planning sessions',
      'Custom integration support',
      'White-glove onboarding',
    ],
    cta: 'Start Your 14-Day Free Trial',
    subtext: ['14-day free trial', 'No credit card required', 'Cancel anytime'],
  },
]

export const comparisonTable = {
  title: 'Why nonprofits choose Bloomwell AI',
  subtitle:
    'Traditional grant consultants cost $150-500/hour and platforms like Instrumentl charge $179-899/month. Get better results for a fraction of the cost.',
  rows: [
    { name: 'Bloomwell AI', price: '$29.99', highlight: true },
    { name: 'Instrumentl', price: '$179-899' },
    { name: 'Grant Consultant', price: '$600-2,000' },
    { name: 'Manual Research', price: '15+ hrs/week' },
  ],
  savings: {
    amount: '$5,000+',
    period: 'per year',
    description: 'compared to traditional solutions',
  },
  features: [
    'Instant Access: Start searching grants in under 2 minutes',
    'Scale With You: Perfect for nonprofits of any size',
    'Always Improving: New features and grants added regularly',
  ],
}

export const pricingDisplay = {
  headline: 'Ready to secure more funding for your mission?',
  subheadline: 'Join hundreds of nonprofits saving time and money with Bloomwell AI',
}
