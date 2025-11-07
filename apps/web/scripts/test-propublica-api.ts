#!/usr/bin/env tsx
/**
 * Test script for ProPublica API integration
 * 
 * This script tests:
 * 1. Direct ProPublica API calls
 * 2. Our Next.js API route
 * 3. Data mapping (especially `strein` field)
 * 4. Error handling
 * 5. Environment variable configuration
 * 
 * Usage: npx tsx apps/web/scripts/test-propublica-api.ts
 */

const PROPUBLICA_SEARCH_URL = 'https://projects.propublica.org/nonprofits/api/v2/search.json'
const NEXTJS_API_URL = 'http://localhost:3000/api/onboarding/propublica'
const TEST_QUERY = 'VIETNAMESE PHAP TANG'

interface ProPublicaOrg {
  ein: number | string
  strein?: string
  name: string
  city: string
  state: string
  ntee_code: string
  subseccd?: number
  [key: string]: any
}

interface ProPublicaResponse {
  total_results: number
  organizations: ProPublicaOrg[]
  num_pages: number
  cur_page: number
  per_page: number
  search_query: string
  api_version: number
}

/**
 * Test direct ProPublica API call
 */
async function testDirectProPublicaAPI(query: string): Promise<void> {
  console.log('\n🔍 Testing Direct ProPublica API...')
  console.log(`Query: "${query}"`)
  console.log(`URL: ${PROPUBLICA_SEARCH_URL}?q=${encodeURIComponent(query)}`)
  
  try {
    const url = `${PROPUBLICA_SEARCH_URL}?q=${encodeURIComponent(query)}`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Bloomwell-AI-Test/1.0',
      },
    })

    console.log(`Status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API Error: ${errorText}`)
      return
    }

    const data = (await response.json()) as ProPublicaResponse
    
    console.log(`✅ Success! Found ${data.total_results} results`)
    console.log(`API Version: ${data.api_version}`)
    console.log(`Pages: ${data.num_pages}, Current Page: ${data.cur_page}`)
    
    if (data.organizations && data.organizations.length > 0) {
      console.log(`\n📋 First ${Math.min(3, data.organizations.length)} results:`)
      data.organizations.slice(0, 3).forEach((org, idx) => {
        console.log(`\n${idx + 1}. ${org.name}`)
        console.log(`   EIN (numeric): ${org.ein}`)
        console.log(`   STREIN (formatted): ${org.strein || 'NOT PROVIDED'}`)
        console.log(`   Location: ${org.city}, ${org.state}`)
        console.log(`   NTEE Code: ${org.ntee_code || 'N/A'}`)
        
        // Verify field mapping
        if (!org.strein && typeof org.ein === 'number') {
          console.log(`   ⚠️  WARNING: strein field missing, will need to format ein`)
        }
      })
    } else {
      console.log('⚠️  No organizations found')
    }
  } catch (error) {
    console.error(`❌ Error calling ProPublica API:`, error)
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`)
      console.error(`   Stack: ${error.stack}`)
    }
  }
}

/**
 * Test our Next.js API route
 */
async function testNextJSAPI(query: string): Promise<void> {
  console.log('\n🌐 Testing Next.js API Route...')
  console.log(`Query: "${query}"`)
  console.log(`URL: ${NEXTJS_API_URL}?q=${encodeURIComponent(query)}`)
  
  try {
    const url = `${NEXTJS_API_URL}?q=${encodeURIComponent(query)}`
    const response = await fetch(url)

    console.log(`Status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API Error: ${errorText}`)
      const errorData = JSON.parse(errorText)
      console.error(`   Error details:`, errorData)
      return
    }

    const data = await response.json()
    
    if (data.error) {
      console.error(`❌ API returned error: ${data.error}`)
      return
    }

    const organizations = data.organizations || []
    console.log(`✅ Success! Found ${organizations.length} results`)
    
    if (organizations.length > 0) {
      console.log(`\n📋 First ${Math.min(3, organizations.length)} results:`)
      organizations.slice(0, 3).forEach((org: any, idx: number) => {
        console.log(`\n${idx + 1}. ${org.name}`)
        console.log(`   EIN (formatted): ${org.ein}`)
        console.log(`   Location: ${org.city}, ${org.state}`)
        console.log(`   Mission: ${org.mission || 'N/A'}`)
        
        // Verify EIN formatting
        if (org.ein && !org.ein.includes('-')) {
          console.log(`   ⚠️  WARNING: EIN not formatted (should be XX-XXXXXXX format)`)
        } else if (org.ein && org.ein.includes('-')) {
          console.log(`   ✅ EIN is properly formatted`)
        }
      })
    } else {
      console.log('⚠️  No organizations found')
    }
  } catch (error) {
    console.error(`❌ Error calling Next.js API:`, error)
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`)
      if (error.message.includes('ECONNREFUSED')) {
        console.error(`   💡 Make sure the Next.js dev server is running on port 3000`)
      }
    }
  }
}

/**
 * Test environment configuration
 */
function testEnvironmentConfig(): void {
  console.log('\n🔧 Testing Environment Configuration...')
  
  const apiKey = process.env.PROPUBLICA_API_KEY
  if (apiKey) {
    console.log(`✅ PROPUBLICA_API_KEY is set (length: ${apiKey.length})`)
  } else {
    console.log(`⚠️  PROPUBLICA_API_KEY is not set`)
    console.log(`   Note: ProPublica API may work without an API key (public endpoint)`)
    console.log(`   However, our code currently requires it. Check lib/propublica.ts`)
  }
}

/**
 * Test error handling
 */
async function testErrorHandling(): Promise<void> {
  console.log('\n🧪 Testing Error Handling...')
  
  // Test with query too short (< 3 characters)
  console.log('\n1. Testing query length validation (< 3 chars)...')
  try {
    const response = await fetch(`${NEXTJS_API_URL}?q=ab`)
    const data = await response.json()
    if (data.organizations && data.organizations.length === 0) {
      console.log('✅ Correctly returns empty array for short queries')
    } else {
      console.log('⚠️  Unexpected response for short query:', data)
    }
  } catch (error) {
    console.error('❌ Error testing short query:', error)
  }
  
  // Test with missing query parameter
  console.log('\n2. Testing missing query parameter...')
  try {
    const response = await fetch(NEXTJS_API_URL)
    const data = await response.json()
    if (data.error && data.error.includes('Missing')) {
      console.log('✅ Correctly returns error for missing parameter')
    } else {
      console.log('⚠️  Unexpected response:', data)
    }
  } catch (error) {
    console.error('❌ Error testing missing parameter:', error)
  }
}

/**
 * Compare direct API vs Next.js API responses
 */
async function compareResponses(query: string): Promise<void> {
  console.log('\n📊 Comparing Direct API vs Next.js API Responses...')
  
  try {
    // Get direct API response
    const directUrl = `${PROPUBLICA_SEARCH_URL}?q=${encodeURIComponent(query)}`
    const directResponse = await fetch(directUrl, {
      headers: { 'User-Agent': 'Bloomwell-AI-Test/1.0' },
    })
    const directData = (await directResponse.json()) as ProPublicaResponse
    
    // Get Next.js API response
    const nextjsUrl = `${NEXTJS_API_URL}?q=${encodeURIComponent(query)}`
    const nextjsResponse = await fetch(nextjsUrl)
    const nextjsData = await nextjsResponse.json()
    
    if (directData.organizations && directData.organizations.length > 0) {
      const directOrg = directData.organizations[0]
      const nextjsOrg = nextjsData.organizations?.[0]
      
      if (nextjsOrg) {
        console.log('\n✅ Both APIs returned results')
        console.log('\nDirect API result:')
        console.log(`  Name: ${directOrg.name}`)
        console.log(`  EIN: ${directOrg.ein} (type: ${typeof directOrg.ein})`)
        console.log(`  STREIN: ${directOrg.strein || 'NOT PROVIDED'}`)
        
        console.log('\nNext.js API result:')
        console.log(`  Name: ${nextjsOrg.name}`)
        console.log(`  EIN: ${nextjsOrg.ein} (type: ${typeof nextjsOrg.ein})`)
        
        // Verify mapping
        const expectedEin = directOrg.strein || String(directOrg.ein)
        if (nextjsOrg.ein === expectedEin) {
          console.log('\n✅ EIN mapping is correct!')
        } else {
          console.log(`\n❌ EIN mapping mismatch!`)
          console.log(`   Expected: ${expectedEin}`)
          console.log(`   Got: ${nextjsOrg.ein}`)
        }
      } else {
        console.log('⚠️  Next.js API returned no results')
      }
    }
  } catch (error) {
    console.error('❌ Error comparing responses:', error)
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('🚀 ProPublica API Test Suite')
  console.log('='.repeat(50))
  
  // Test environment
  testEnvironmentConfig()
  
  // Test direct API
  await testDirectProPublicaAPI(TEST_QUERY)
  
  // Test Next.js API
  await testNextJSAPI(TEST_QUERY)
  
  // Compare responses
  await compareResponses(TEST_QUERY)
  
  // Test error handling
  await testErrorHandling()
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ Test suite completed!')
  console.log('\n💡 Tips:')
  console.log('   - If Next.js API fails, make sure dev server is running')
  console.log('   - If PROPUBLICA_API_KEY is missing, check if API works without it')
  console.log('   - Verify field mapping matches ProPublica API documentation')
}

// Run tests
main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})




