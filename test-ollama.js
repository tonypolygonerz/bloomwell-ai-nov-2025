const { OllamaCloudClient } = require('./packages/ai/providers/ollama.ts')

async function test() {
  console.log('Testing Ollama Cloud connection...\n')

  const client = new OllamaCloudClient({
    apiKey: process.env.OLLAMA_CLOUD_API_KEY,
  })

  try {
    // Test 1: Health check
    console.log('1. Running health check...')
    const health = await client.healthCheck()
    console.log('   ✅ Health check passed:', JSON.stringify(health, null, 2))

    // Test 2: Chat
    console.log('\n2. Testing chat with largest DeepSeek model...')
    const largestModel = await client.getLargestDeepSeekModel()
    console.log(`   Using model: ${largestModel}`)

    const response = await client.chat({
      model: largestModel,
      messages: [
        { role: 'user', content: 'Say "Hello from DeepSeek v3.1!" in exactly those words.' },
      ],
    })
    console.log('   ✅ Chat response:', response)

    console.log('\n🎉 All tests passed!')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

test()
