interface BraveSearchResult {
  web: {
    results: Array<{
      title: string
      url: string
      description: string
    }>
  }
}

export class BraveSearchClient {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.search.brave.com/res/v1/web/search'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async search(query: string, count = 5): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}?q=${encodeURIComponent(query)}&count=${count}`,
        {
          headers: {
            'X-Subscription-Token': this.apiKey,
          },
        },
      )

      if (!response.ok) {
        return ''
      }

      const data = (await response.json()) as BraveSearchResult
      const results = data.web?.results ?? []

      if (results.length === 0) {
        return ''
      }

      return results
        .map((r) => `Title: ${r.title}\nURL: ${r.url}\nDescription: ${r.description}`)
        .join('\n\n')
    } catch {
      return ''
    }
  }
}
