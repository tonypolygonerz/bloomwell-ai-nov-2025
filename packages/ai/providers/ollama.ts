interface OllamaRequest {
  model: string
  messages: Array<{ role: string; content: string }>
  stream?: boolean
}

interface OllamaOpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

interface OllamaNativeResponse {
  message: {
    role: string
    content: string
  }
  done: boolean
}

export class OllamaCloudClient {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.ollama.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async chat(request: OllamaRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        stream: false,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Ollama API error: ${error}`)
    }

    const data = (await response.json()) as OllamaOpenAIResponse | OllamaNativeResponse

    // Handle OpenAI-compatible format
    if ('choices' in data && data.choices[0]) {
      return data.choices[0].message.content
    }

    // Handle native Ollama format
    if ('message' in data) {
      return data.message.content
    }

    throw new Error('Unexpected response format from Ollama API')
  }
}

