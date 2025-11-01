import { NextResponse } from 'next/server'
import { OllamaCloudClient } from '@bloomwell/ai/providers/ollama'

export async function GET() {
  const checks: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    ollamaApiKey: !!(process.env.OLLAMA_API_KEY || process.env.OLLAMA_CLOUD_API_KEY),
    databaseUrl: !!process.env.DATABASE_URL,
  }

  // Test Ollama connectivity
  if (checks.ollamaApiKey) {
    try {
      const ollamaClient = new OllamaCloudClient({
        apiKey: process.env.OLLAMA_CLOUD_API_KEY || process.env.OLLAMA_API_KEY || ''
      })
      const ollamaHealth = await ollamaClient.healthCheck()
      checks.ollama = {
        status: 'connected',
        endpoint: ollamaHealth.endpoint,
        modelsAvailable: ollamaHealth.models,
        largestDeepSeek: ollamaHealth.largestDeepSeek
      }
    } catch (error: any) {
      checks.ollama = {
        status: 'failed',
        error: error.message,
        endpoint: process.env.OLLAMA_BASE_URL || 'https://ollama.com'
      }
    }
  } else {
    checks.ollama = {
      status: 'not_configured',
      message: 'No Ollama API key found in environment'
    }
  }

  const allHealthy = checks.ollamaApiKey && checks.databaseUrl && checks.ollama?.status === 'connected'

  return NextResponse.json({
    status: allHealthy ? 'OK' : 'DEGRADED',
    service: 'Bloomwell AI',
    checks
  })
}
