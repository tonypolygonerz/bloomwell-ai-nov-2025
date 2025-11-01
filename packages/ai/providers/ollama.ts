export interface OllamaCloudConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  created_at?: string;
}

export interface OpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ModelInfo {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parameter_size?: string;
    quantization_level?: string;
    family?: string;
  };
}

export interface ModelsResponse {
  models: ModelInfo[];
}

export class OllamaCloudClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config?: OllamaCloudConfig) {
    this.apiKey = config?.apiKey || process.env.OLLAMA_CLOUD_API_KEY || process.env.OLLAMA_API_KEY || '';
    // Correct Ollama Cloud base URL
    this.baseUrl = config?.baseUrl || process.env.OLLAMA_BASE_URL || 'https://ollama.com';

    if (!this.apiKey) {
      console.error('❌ No Ollama API key found in OLLAMA_CLOUD_API_KEY or OLLAMA_API_KEY');
    }

    console.log(`🔗 Ollama Cloud endpoint: ${this.baseUrl}`);
  }

  private async makeRequest<T = any>(endpoint: string, data?: any, method: string = 'POST'): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();

    console.log(`🚀 Ollama Request: ${method} ${url}`);

    try {
      const requestConfig: RequestInit = {
        method: data ? method : 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'BloomwellAI/1.0'
        },
        signal: AbortSignal.timeout(30000) // 30 second timeout
      };

      if (data) {
        requestConfig.body = JSON.stringify(data);
        console.log(`📤 Request body:`, JSON.stringify(data, null, 2));
      }

      const response = await fetch(url, requestConfig);
      const duration = Date.now() - startTime;

      console.log(`📡 Response: ${response.status} ${response.statusText} (${duration}ms)`);

      if (!response.ok) {
        const errorText = await response.text();

        // Provide specific error messages based on status code
        let errorMessage = `Ollama API Error ${response.status}: ${response.statusText}`;

        if (response.status === 401 || response.status === 403) {
          errorMessage = `Authentication failed. Your API key may be invalid or expired. Status: ${response.status}`;
        } else if (response.status === 404) {
          errorMessage = `Endpoint not found: ${url}. The API endpoint may have changed.`;
        } else if (response.status === 429) {
          errorMessage = `Rate limit exceeded. Please wait before making more requests.`;
        } else if (response.status === 500 || response.status === 503) {
          errorMessage = `Ollama service error (${response.status}). The service may be temporarily unavailable.`;
        }

        errorMessage += `\nURL: ${url}\nResponse: ${errorText}`;

        const error = new Error(errorMessage);
        console.error('❌ Ollama API Error:', error.message);
        throw error;
      }

      const result = await response.json() as T;
      console.log(`✅ Ollama Success (${duration}ms)`);
      return result;

    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Detailed error logging for different failure types
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        const timeoutError = new Error(`Request timed out after ${duration}ms. Ollama Cloud may be slow or unavailable.`);
        console.error(`⏱️ Timeout Error (${duration}ms):`, url);
        throw timeoutError;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        const hostname = new URL(url).hostname;
        const networkError = new Error(
          `Network connection failed to ${hostname}. ` +
          `Possible causes: DNS resolution failed, network connectivity issues, or firewall blocking. ` +
          `Duration: ${duration}ms`
        );
        console.error(`🌐 Network Error (${duration}ms):`, {
          url,
          hostname,
          message: error.message,
          type: 'NETWORK_ERROR'
        });
        throw networkError;
      }

      // If error is already formatted, rethrow it
      if (error.message.includes('Ollama API Error') || error.message.includes('Authentication failed')) {
        throw error;
      }

      // Unexpected error
      console.error(`💥 Unexpected Error (${duration}ms):`, error);
      throw new Error(`Unexpected error communicating with Ollama: ${error.message}`);
    }
  }

  // List available models
  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.makeRequest<ModelsResponse>('/api/tags', undefined, 'GET');
      return response.models || [];
    } catch (error: any) {
      console.error('Failed to list models:', error);
      throw new Error(`Failed to retrieve model list: ${error.message}`);
    }
  }

  // Find largest DeepSeek model
  async getLargestDeepSeekModel(): Promise<string> {
    try {
      const models = await this.listModels();
      const deepSeekModels = models
        .filter(m => m.name.toLowerCase().includes('deepseek'))
        .sort((a, b) => {
          // Sort by size (largest first), then by name
          if (b.size !== a.size) {
            return b.size - a.size;
          }
          // Prefer newer versions
          if (b.name.includes('v3') && !a.name.includes('v3')) return 1;
          if (a.name.includes('v3') && !b.name.includes('v3')) return -1;
          return b.name.localeCompare(a.name);
        });

      console.log('🔍 Available DeepSeek models:', deepSeekModels.map(m => ({
        name: m.name,
        size: `${(m.size / 1e9).toFixed(0)}GB`
      })));

      if (deepSeekModels.length === 0) {
        console.warn('⚠️ No DeepSeek models found, falling back to deepseek-chat');
        return 'deepseek-chat';
      }

      const largestModel = deepSeekModels[0];
      if (!largestModel) {
        console.warn('⚠️ No DeepSeek model found, falling back to deepseek-chat');
        return 'deepseek-chat';
      }

      const largest = largestModel.name;
      const sizeGB = (largestModel.size / 1e9).toFixed(0);
      console.log(`🎯 Selected largest DeepSeek model: ${largest} (${sizeGB}GB)`);
      return largest;

    } catch (error: any) {
      console.error('Failed to get largest DeepSeek model:', error);
      console.warn('⚠️ Falling back to default model: deepseek-chat');
      return 'deepseek-chat'; // fallback
    }
  }

  // Main chat method (Ollama native format)
  async chat(request: ChatRequest): Promise<string> {
    const response = await this.makeRequest<ChatResponse | OpenAIChatResponse>('/api/chat', {
      model: request.model,
      messages: request.messages,
      stream: false,
      ...(request.temperature && { temperature: request.temperature }),
      ...(request.max_tokens && { options: { num_predict: request.max_tokens } })
    });

    // Handle OpenAI-compatible format
    if ('choices' in response && response.choices[0]) {
      return response.choices[0].message.content;
    }

    // Handle native Ollama format
    if ('message' in response) {
      return response.message.content;
    }

    throw new Error('Unexpected response format from Ollama API');
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; models: number; endpoint: string; largestDeepSeek?: string }> {
    try {
      const models = await this.listModels();
      const largestDeepSeek = await this.getLargestDeepSeekModel();
      return {
        status: 'healthy',
        models: models.length,
        endpoint: this.baseUrl,
        largestDeepSeek
      };
    } catch (error: any) {
      throw new Error(`Ollama health check failed: ${error.message}`);
    }
  }

  // Web search method
  async webSearch(query: string, maxResults: number = 5): Promise<any> {
    return this.makeRequest('/api/web_search', { query, max_results: maxResults });
  }

  // Web fetch method
  async webFetch(url: string): Promise<any> {
    return this.makeRequest('/api/web_fetch', { url });
  }
}
