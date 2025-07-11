"use client"

import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Mock code responses for demonstration
const MOCK_CODE_RESPONSES: Record<string, string[]> = {
  "1": [
    // Creative Assistant
    "Here's a creative React component for a animated button:\n\n```tsx\nimport React, { useState } from 'react';\nimport { motion } from 'framer-motion';\n\ninterface AnimatedButtonProps {\n  children: React.ReactNode;\n  onClick?: () => void;\n  variant?: 'primary' | 'secondary';\n}\n\nconst AnimatedButton: React.FC<AnimatedButtonProps> = ({ \n  children, \n  onClick, \n  variant = 'primary' \n}) => {\n  const [isHovered, setIsHovered] = useState(false);\n\n  return (\n    <motion.button\n      className={`px-6 py-3 rounded-lg font-semibold transition-all ${\n        variant === 'primary' \n          ? 'bg-blue-500 text-white hover:bg-blue-600' \n          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'\n      }`}\n      whileHover={{ scale: 1.05 }}\n      whileTap={{ scale: 0.95 }}\n      onHoverStart={() => setIsHovered(true)}\n      onHoverEnd={() => setIsHovered(false)}\n      onClick={onClick}\n    >\n      <motion.span\n        animate={{ \n          rotateX: isHovered ? 360 : 0 \n        }}\n        transition={{ duration: 0.3 }}\n      >\n        {children}\n      </motion.span>\n    </motion.button>\n  );\n};\n\nexport default AnimatedButton;\n```\n\nThis component uses Framer Motion for smooth animations and includes hover effects!",

    "Here's a creative CSS animation for a loading spinner:\n\n```css\n/* Creative Loading Spinner */\n.creative-spinner {\n  width: 60px;\n  height: 60px;\n  position: relative;\n  margin: 20px auto;\n}\n\n.creative-spinner::before,\n.creative-spinner::after {\n  content: '';\n  position: absolute;\n  border-radius: 50%;\n  animation: pulse 2s infinite ease-in-out;\n}\n\n.creative-spinner::before {\n  width: 100%;\n  height: 100%;\n  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);\n  animation-delay: -1s;\n}\n\n.creative-spinner::after {\n  width: 80%;\n  height: 80%;\n  top: 10%;\n  left: 10%;\n  background: linear-gradient(45deg, #45b7d1, #96ceb4);\n}\n\n@keyframes pulse {\n  0%, 100% {\n    transform: scale(0);\n    opacity: 1;\n  }\n  50% {\n    transform: scale(1);\n    opacity: 0.7;\n  }\n}\n\n/* Usage */\n.loading-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 200px;\n}\n```\n\nAnd here's how to use it in your HTML:\n\n```html\n<div class=\"loading-container\">\n  <div class=\"creative-spinner\"></div>\n</div>\n```",
  ],

  "2": [
    // Technical Expert
    "Here's a comprehensive TypeScript utility for API error handling:\n\n```typescript\n// api-error-handler.ts\nexport interface ApiError {\n  message: string;\n  status: number;\n  code?: string;\n  details?: Record<string, any>;\n}\n\nexport class ApiErrorHandler {\n  private static instance: ApiErrorHandler;\n  private errorMap: Map<number, string> = new Map();\n\n  private constructor() {\n    this.initializeErrorMap();\n  }\n\n  public static getInstance(): ApiErrorHandler {\n    if (!ApiErrorHandler.instance) {\n      ApiErrorHandler.instance = new ApiErrorHandler();\n    }\n    return ApiErrorHandler.instance;\n  }\n\n  private initializeErrorMap(): void {\n    this.errorMap.set(400, 'Bad Request');\n    this.errorMap.set(401, 'Unauthorized');\n    this.errorMap.set(403, 'Forbidden');\n    this.errorMap.set(404, 'Not Found');\n    this.errorMap.set(500, 'Internal Server Error');\n    this.errorMap.set(502, 'Bad Gateway');\n    this.errorMap.set(503, 'Service Unavailable');\n  }\n\n  public handleError(error: any): ApiError {\n    if (error.response) {\n      // Server responded with error status\n      return {\n        message: error.response.data?.message || this.errorMap.get(error.response.status) || 'Unknown error',\n        status: error.response.status,\n        code: error.response.data?.code,\n        details: error.response.data?.details\n      };\n    } else if (error.request) {\n      // Network error\n      return {\n        message: 'Network error - please check your connection',\n        status: 0,\n        code: 'NETWORK_ERROR'\n      };\n    } else {\n      // Other error\n      return {\n        message: error.message || 'An unexpected error occurred',\n        status: -1,\n        code: 'UNKNOWN_ERROR'\n      };\n    }\n  }\n\n  public async withRetry<T>(\n    apiCall: () => Promise<T>,\n    maxRetries: number = 3,\n    delay: number = 1000\n  ): Promise<T> {\n    let lastError: any;\n    \n    for (let attempt = 1; attempt <= maxRetries; attempt++) {\n      try {\n        return await apiCall();\n      } catch (error) {\n        lastError = error;\n        \n        if (attempt === maxRetries) {\n          throw this.handleError(error);\n        }\n        \n        // Exponential backoff\n        await this.sleep(delay * Math.pow(2, attempt - 1));\n      }\n    }\n    \n    throw this.handleError(lastError);\n  }\n\n  private sleep(ms: number): Promise<void> {\n    return new Promise(resolve => setTimeout(resolve, ms));\n  }\n}\n\n// Usage example\nexport const apiErrorHandler = ApiErrorHandler.getInstance();\n```\n\nAnd here's how to use it in your API calls:\n\n```typescript\n// api-client.ts\nimport axios from 'axios';\nimport { apiErrorHandler } from './api-error-handler';\n\nclass ApiClient {\n  private baseURL: string;\n\n  constructor(baseURL: string) {\n    this.baseURL = baseURL;\n  }\n\n  async get<T>(endpoint: string): Promise<T> {\n    return apiErrorHandler.withRetry(async () => {\n      const response = await axios.get(`${this.baseURL}${endpoint}`);\n      return response.data;\n    });\n  }\n\n  async post<T>(endpoint: string, data: any): Promise<T> {\n    return apiErrorHandler.withRetry(async () => {\n      const response = await axios.post(`${this.baseURL}${endpoint}`, data);\n      return response.data;\n    });\n  }\n}\n\nexport const apiClient = new ApiClient('https://api.example.com');\n```",

    "Here's a robust React hook for managing async operations:\n\n```typescript\n// useAsyncOperation.ts\nimport { useState, useCallback, useRef, useEffect } from 'react';\n\ninterface AsyncState<T> {\n  data: T | null;\n  loading: boolean;\n  error: Error | null;\n}\n\ninterface UseAsyncOperationOptions {\n  onSuccess?: (data: any) => void;\n  onError?: (error: Error) => void;\n  retryCount?: number;\n  retryDelay?: number;\n}\n\nexport function useAsyncOperation<T = any>(\n  asyncFunction: (...args: any[]) => Promise<T>,\n  options: UseAsyncOperationOptions = {}\n) {\n  const [state, setState] = useState<AsyncState<T>>({\n    data: null,\n    loading: false,\n    error: null,\n  });\n\n  const abortControllerRef = useRef<AbortController | null>(null);\n  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);\n  const { onSuccess, onError, retryCount = 0, retryDelay = 1000 } = options;\n\n  const execute = useCallback(\n    async (...args: any[]) => {\n      // Cancel previous request\n      if (abortControllerRef.current) {\n        abortControllerRef.current.abort();\n      }\n\n      // Clear retry timeout\n      if (retryTimeoutRef.current) {\n        clearTimeout(retryTimeoutRef.current);\n      }\n\n      abortControllerRef.current = new AbortController();\n      \n      setState(prev => ({ ...prev, loading: true, error: null }));\n\n      let attempt = 0;\n      const maxAttempts = retryCount + 1;\n\n      const attemptExecution = async (): Promise<void> => {\n        try {\n          const result = await asyncFunction(...args);\n          \n          if (!abortControllerRef.current?.signal.aborted) {\n            setState({ data: result, loading: false, error: null });\n            onSuccess?.(result);\n          }\n        } catch (error) {\n          if (abortControllerRef.current?.signal.aborted) {\n            return; // Request was cancelled\n          }\n\n          attempt++;\n          \n          if (attempt < maxAttempts) {\n            // Retry with exponential backoff\n            const delay = retryDelay * Math.pow(2, attempt - 1);\n            retryTimeoutRef.current = setTimeout(attemptExecution, delay);\n          } else {\n            const finalError = error instanceof Error ? error : new Error(String(error));\n            setState({ data: null, loading: false, error: finalError });\n            onError?.(finalError);\n          }\n        }\n      };\n\n      await attemptExecution();\n    },\n    [asyncFunction, onSuccess, onError, retryCount, retryDelay]\n  );\n\n  const reset = useCallback(() => {\n    setState({ data: null, loading: false, error: null });\n    if (abortControllerRef.current) {\n      abortControllerRef.current.abort();\n    }\n    if (retryTimeoutRef.current) {\n      clearTimeout(retryTimeoutRef.current);\n    }\n  }, []);\n\n  // Cleanup on unmount\n  useEffect(() => {\n    return () => {\n      if (abortControllerRef.current) {\n        abortControllerRef.current.abort();\n      }\n      if (retryTimeoutRef.current) {\n        clearTimeout(retryTimeoutRef.current);\n      }\n    };\n  }, []);\n\n  return {\n    ...state,\n    execute,\n    reset,\n    isIdle: !state.loading && !state.data && !state.error,\n  };\n}\n\n// Usage example:\nconst MyComponent = () => {\n  const { data, loading, error, execute } = useAsyncOperation(\n    async (userId: string) => {\n      const response = await fetch(`/api/users/${userId}`);\n      return response.json();\n    },\n    {\n      retryCount: 3,\n      retryDelay: 1000,\n      onSuccess: (data) => console.log('User loaded:', data),\n      onError: (error) => console.error('Failed to load user:', error),\n    }\n  );\n\n  return (\n    <div>\n      <button onClick={() => execute('123')}>Load User</button>\n      {loading && <p>Loading...</p>}\n      {error && <p>Error: {error.message}</p>}\n      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}\n    </div>\n  );\n};\n```",
  ],

  "3": [
    // Language Tutor
    "Here's a JavaScript function to practice English grammar:\n\n```javascript\n// English Grammar Practice Tool\nclass GrammarPractice {\n  constructor() {\n    this.exercises = {\n      articles: [\n        { sentence: \"I saw ___ elephant at the zoo.\", answer: \"an\", options: [\"a\", \"an\", \"the\"] },\n        { sentence: \"___ sun is shining brightly.\", answer: \"The\", options: [\"A\", \"An\", \"The\"] },\n        { sentence: \"She wants to be ___ doctor.\", answer: \"a\", options: [\"a\", \"an\", \"the\"] }\n      ],\n      tenses: [\n        { sentence: \"I ___ (go) to school yesterday.\", answer: \"went\", tense: \"past simple\" },\n        { sentence: \"She ___ (study) for 3 hours.\", answer: \"has been studying\", tense: \"present perfect continuous\" },\n        { sentence: \"They ___ (play) football tomorrow.\", answer: \"will play\", tense: \"future simple\" }\n      ]\n    };\n    this.score = 0;\n    this.totalQuestions = 0;\n  }\n\n  // Get random exercise\n  getRandomExercise(type = 'articles') {\n    const exercises = this.exercises[type];\n    const randomIndex = Math.floor(Math.random() * exercises.length);\n    return exercises[randomIndex];\n  }\n\n  // Check answer\n  checkAnswer(userAnswer, correctAnswer) {\n    this.totalQuestions++;\n    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();\n    \n    if (isCorrect) {\n      this.score++;\n      return {\n        correct: true,\n        message: \"✅ Correct! Well done!\",\n        explanation: this.getExplanation(correctAnswer)\n      };\n    } else {\n      return {\n        correct: false,\n        message: `❌ Incorrect. The correct answer is: ${correctAnswer}`,\n        explanation: this.getExplanation(correctAnswer)\n      };\n    }\n  }\n\n  // Get explanation for the answer\n  getExplanation(answer) {\n    const explanations = {\n      'a': 'Use \"a\" before consonant sounds',\n      'an': 'Use \"an\" before vowel sounds',\n      'the': 'Use \"the\" for specific or previously mentioned items',\n      'went': 'Past simple tense for completed actions in the past',\n      'has been studying': 'Present perfect continuous for ongoing actions',\n      'will play': 'Future simple for planned future actions'\n    };\n    \n    return explanations[answer.toLowerCase()] || 'Grammar rule explanation';\n  }\n\n  // Get current score\n  getScore() {\n    const percentage = this.totalQuestions > 0 ? (this.score / this.totalQuestions * 100).toFixed(1) : 0;\n    return {\n      correct: this.score,\n      total: this.totalQuestions,\n      percentage: percentage + '%'\n    };\n  }\n\n  // Reset score\n  resetScore() {\n    this.score = 0;\n    this.totalQuestions = 0;\n  }\n}\n\n// Usage example:\nconst grammarTool = new GrammarPractice();\n\n// Get a random article exercise\nconst exercise = grammarTool.getRandomExercise('articles');\nconsole.log('Complete the sentence:', exercise.sentence);\nconsole.log('Options:', exercise.options);\n\n// Check user's answer\nconst result = grammarTool.checkAnswer('an', exercise.answer);\nconsole.log(result.message);\nconsole.log('Explanation:', result.explanation);\n\n// Check current score\nconsole.log('Your score:', grammarTool.getScore());\n```\n\nHere's also a Spanish conjugation helper:\n\n```javascript\n// Spanish Verb Conjugation Helper\nclass SpanishConjugator {\n  constructor() {\n    this.regularVerbs = {\n      'ar': ['hablar', 'caminar', 'estudiar', 'trabajar'],\n      'er': ['comer', 'beber', 'correr', 'leer'],\n      'ir': ['vivir', 'escribir', 'abrir', 'partir']\n    };\n    \n    this.endings = {\n      present: {\n        'ar': ['o', 'as', 'a', 'amos', 'áis', 'an'],\n        'er': ['o', 'es', 'e', 'emos', 'éis', 'en'],\n        'ir': ['o', 'es', 'e', 'imos', 'ís', 'en']\n      },\n      preterite: {\n        'ar': ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],\n        'er': ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],\n        'ir': ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron']\n      }\n    };\n    \n    this.pronouns = ['yo', 'tú', 'él/ella', 'nosotros', 'vosotros', 'ellos/ellas'];\n  }\n\n  // Conjugate a regular verb\n  conjugate(verb, tense = 'present') {\n    const ending = verb.slice(-2);\n    const stem = verb.slice(0, -2);\n    \n    if (!this.endings[tense] || !this.endings[tense][ending]) {\n      return null;\n    }\n    \n    const conjugations = this.endings[tense][ending].map((ending, index) => ({\n      pronoun: this.pronouns[index],\n      conjugation: stem + ending\n    }));\n    \n    return {\n      verb,\n      tense,\n      conjugations\n    };\n  }\n\n  // Get practice exercise\n  getPracticeExercise() {\n    const endings = Object.keys(this.regularVerbs);\n    const randomEnding = endings[Math.floor(Math.random() * endings.length)];\n    const verbs = this.regularVerbs[randomEnding];\n    const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];\n    const randomPronoun = this.pronouns[Math.floor(Math.random() * this.pronouns.length)];\n    \n    return {\n      verb: randomVerb,\n      pronoun: randomPronoun,\n      instruction: `Conjugate \"${randomVerb}\" for \"${randomPronoun}\" in present tense`\n    };\n  }\n}\n\n// Usage:\nconst conjugator = new SpanishConjugator();\n\n// Conjugate a verb\nconst result = conjugator.conjugate('hablar', 'present');\nconsole.log('Conjugations for hablar:');\nresult.conjugations.forEach(item => {\n  console.log(`${item.pronoun}: ${item.conjugation}`);\n});\n\n// Get practice exercise\nconst exercise = conjugator.getPracticeExercise();\nconsole.log(exercise.instruction);\n```",
  ],
}

export async function POST(req: Request) {
  const { messages, personaId } = await req.json()

  // Get the last user message
  const lastMessage = messages[messages.length - 1]
  const userMessage = lastMessage?.content?.toLowerCase() || ""

  // Check if user is asking for code examples
  const codeKeywords = [
    "code",
    "example",
    "function",
    "component",
    "script",
    "programming",
    "javascript",
    "typescript",
    "react",
    "css",
    "html",
    "python",
    "sql",
    "show me",
    "create",
    "build",
    "write",
    "implement",
    "demo",
  ]

  const isCodeRequest = codeKeywords.some((keyword) => userMessage.includes(keyword))

  // If it's a code request, return mock code response
  if (isCodeRequest && MOCK_CODE_RESPONSES[personaId]) {
    const responses = MOCK_CODE_RESPONSES[personaId]
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    // Create a readable stream to simulate streaming
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Split response into chunks for streaming effect
        const chunks = randomResponse.split(" ")
        let index = 0

        const sendChunk = () => {
          if (index < chunks.length) {
            const chunk = chunks[index] + " "
            controller.enqueue(encoder.encode(chunk))
            index++
            setTimeout(sendChunk, 50) // Simulate typing speed
          } else {
            controller.close()
          }
        }

        sendChunk()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    })
  }

  // For non-code requests, use the AI SDK
  let systemPrompt = "You are a helpful assistant."

  // Customize system prompt based on persona
  if (personaId === "1") {
    systemPrompt =
      "You are a creative assistant who specializes in creative writing, brainstorming ideas, and generating content. Be imaginative and inspiring. When asked for code examples, provide creative and well-commented code with explanations."
  } else if (personaId === "2") {
    systemPrompt =
      "You are a technical expert who specializes in programming, debugging, and technical explanations. Provide clear, accurate technical information with detailed code examples when requested."
  } else if (personaId === "3") {
    systemPrompt =
      "You are a language tutor who helps people learn new languages, practice conversations, and improve grammar. Be patient and educational. Provide code examples for language learning tools when requested."
  } else if (personaId === "4") {
    systemPrompt =
      "You are a career coach who provides guidance on career development, resume writing, and interview preparation. Be professional and encouraging."
  } else if (personaId === "5") {
    systemPrompt =
      "You are a fitness advisor who provides workout plans, nutrition advice, and health tips. Be motivational and informative."
  } else if (personaId === "6") {
    systemPrompt =
      "You are a travel guide who recommends destinations, helps plan itineraries, and provides travel tips. Be knowledgeable and enthusiastic."
  } else if (personaId === "7") {
    systemPrompt =
      "You are a financial advisor who helps with budgeting, investing basics, and financial planning. Be clear and educational."
  } else if (personaId === "8") {
    systemPrompt =
      "You are a cooking assistant who provides recipes, cooking techniques, and meal planning ideas. Be helpful and descriptive."
  } else if (personaId === "9") {
    systemPrompt =
      "You are a meditation guide who guides through meditation exercises and mindfulness practices. Be calm and soothing."
  } else if (personaId === "10") {
    systemPrompt =
      "You are a movie critic who recommends films, discusses cinema history, and analyzes movie themes. Be insightful and passionate."
  }

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: systemPrompt,
  })

  return result.toDataStreamResponse()
}
