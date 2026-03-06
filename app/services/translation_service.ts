import { TranslationServiceClient } from '@google-cloud/translate'

const translationClient = new TranslationServiceClient()

// Common languages for translation
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'id', name: 'Indonesian' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ru', name: 'Russian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
]

// Get the default language from environment (this is the source language for content)
export function getSourceLanguage(): string {
  return process.env.DEFAULT_LANGUAGE || 'en'
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string> {
  // Use provided source language, or fall back to the configured default language
  const source = sourceLanguage ?? getSourceLanguage()
  // Get project ID from environment or use default
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT

  if (!projectId) {
    throw new Error('Google Cloud project ID not configured')
  }

  const request = {
    parent: `projects/${projectId}/locations/global`,
    contents: [text],
    mimeType: 'text/html', // Preserve HTML formatting
    sourceLanguageCode: source,
    targetLanguageCode: targetLanguage,
  }

  const [response] = await translationClient.translateText(request)

  if (!response.translations || response.translations.length === 0) {
    throw new Error('No translation returned')
  }

  return response.translations[0].translatedText || text
}

export async function translateMultiple(
  texts: string[],
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string[]> {
  // Use provided source language, or fall back to the configured default language
  const source = sourceLanguage ?? getSourceLanguage()
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT

  if (!projectId) {
    throw new Error('Google Cloud project ID not configured')
  }

  const parent = `projects/${projectId}/locations/global`

  // Split texts into chunks to stay under the API's ~30k character limit
  const MAX_CHARS = 25000
  const chunks: string[][] = []
  let currentChunk: string[] = []
  let currentSize = 0

  for (const text of texts) {
    const textLen = text.length
    if (currentChunk.length > 0 && currentSize + textLen > MAX_CHARS) {
      chunks.push(currentChunk)
      currentChunk = []
      currentSize = 0
    }
    currentChunk.push(text)
    currentSize += textLen
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk)
  }

  // Translate each chunk and combine results
  const allTranslations: string[] = []
  for (const chunk of chunks) {
    const [response] = await translationClient.translateText({
      parent,
      contents: chunk,
      mimeType: 'text/html',
      sourceLanguageCode: source,
      targetLanguageCode: targetLanguage,
    })

    if (!response.translations) {
      throw new Error('No translations returned')
    }

    allTranslations.push(...response.translations.map((t) => t.translatedText || ''))
  }

  return allTranslations
}