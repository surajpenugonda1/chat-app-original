import { api } from "./api-client"
import {
  API_ENDPOINTS,
  type PersonasListParams,
  type PersonasListResponse,
  type PersonaApiResponse,
  type CreatePersonaRequest,
  type MessagesListParams,
  type MessagesListResponse,
  type MessageApiResponse,
  type CreateMessageRequest,
  type ConversationApiResponse
} from "./config"
import type { Persona, Message,Conversation } from "./types"

// Transform API persona to our Persona type
function transformPersona(apiPersona: PersonaApiResponse): Persona {
  return {
    id: apiPersona.id.toString(),
    name: apiPersona.name,
    description: apiPersona.description,
    avatarUrl: `/placeholder.svg?height=200&width=200`,
    tags: apiPersona.tags, 
    sampleQuestions: [],
    systemPrompt: apiPersona.system_prompt,
    isActive: apiPersona.is_active,
    isPublic: apiPersona.is_public,
  }
}

// Transform API message to our Message type
function transformMessage(apiMessage: MessageApiResponse): Message {
  return {
    id: apiMessage.id.toString(),
    role: apiMessage.is_from_user ? "user" : "assistant",
    content: apiMessage.content,
    timestamp: apiMessage.created_at,
    messageType: apiMessage.message_type,
  }
}


function transformConversation(apiConversation: ConversationApiResponse): Conversation {
  return {
    id: apiConversation.id.toString(),
    userId: apiConversation.user_id.toString(),
    personaId: apiConversation.persona_id.toString(),
    title: apiConversation.title ,
    status: apiConversation.status,
    metadata: apiConversation.meta_data || {},
    createdAt: apiConversation.created_at,
    updatedAt: apiConversation.updated_at,
  }
}

// Fetch personas from API
export async function fetchPersonas(params: PersonasListParams = {}): Promise<Persona[]> {
  try {
    console.log("Fetching personas from API...")

    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append("page", params.page.toString())
    if (params.limit) queryParams.append("limit", params.limit.toString())
    if (params.search) queryParams.append("search", params.search)

    const url = `${API_ENDPOINTS.PERSONAS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    const response: PersonasListResponse = await api.get(url)

    console.log("Personas fetched successfully:", response)

    return response.items.map(transformPersona)
  } catch (error: any) {
    console.error("Fetch personas error:", error)

    // // Fallback to mock data if API is not available
    // if (error.status === 0 || error.status >= 500) {
    //   console.warn("API unavailable, using mock personas")
    //   return getMockPersonas()
    // }

    throw new Error(error.message || "Failed to fetch personas")
  }
}

export async function fetchPersonaById(id: string): Promise<Persona> {
  try {
    console.log("Fetching persona by ID:", id)

    const response: PersonaApiResponse = await api.get(API_ENDPOINTS.PERSONAS.DETAIL(id))

    console.log("Persona fetched successfully:", response)

    return transformPersona(response)
  } catch (error: any) {
    console.error("Fetch persona error:", error)

    // Fallback to mock data if API is not available
    if (error.status === 0 || error.status >= 500) {
      console.warn("API unavailable, using mock persona")
      const mockPersonas = getMockPersonas()
      const persona = mockPersonas.find((p) => p.id === id)
      if (!persona) {
        throw new Error("Persona not found")
      }
      return persona
    }

    throw new Error(error.message || "Failed to fetch persona")
  }
}

export async function fetchConversationById(id: string): Promise<Conversation> {
  try {
    console.log("Fetching persona by ID:", id)

    const response: ConversationApiResponse = await api.get(API_ENDPOINTS.CONVERSATIONS.BY_PERSONA(id))

    console.log("Conversation fetched successfully:", response)

    return transformConversation(response)
  } catch (error: any) {
    console.error("Fetch persona error:", error)

    // Fallback to mock data if API is not available
    if (error.status === 0 || error.status >= 500) {
      console.warn("API unavailable, using mock persona")
    }

    throw new Error(error.message || "Failed to fetch persona")
  }
}

// Create new persona
export async function createPersona(personaData: CreatePersonaRequest): Promise<Persona> {
  try {
    console.log("Creating persona:", personaData)

    const response: PersonaApiResponse = await api.post(API_ENDPOINTS.PERSONAS.CREATE, personaData)

    console.log("Persona created successfully:", response)

    return transformPersona(response)
  } catch (error: any) {
    console.error("Create persona error:", error)
    throw new Error(error.message || "Failed to create persona")
  }
}

export async function assignPersonaToUser(personaId: string)
{
  const response: PersonaApiResponse = await api.post(API_ENDPOINTS.PERSONAS.ASSIGN(personaId), {persona_id: personaId})
  console.log(response)
  return response
}

// Fetch user's assigned personas
export async function fetchUserAssignedPersonas(): Promise<Persona[]> {
  try {
    console.log("Fetching user's assigned personas...")

    // For now, we'll use the same endpoint as fetchPersonas but with a user filter
    // This assumes the backend supports filtering by user assignment
    const response: PersonasListResponse = await api.get(`${API_ENDPOINTS.PERSONAS.LIST}?is_attached=true`)

    console.log("User's assigned personas fetched successfully:", response)

    return response.items.map(transformPersona)
  } catch (error: any) {
    console.error("Fetch user assigned personas error:", error)

    // Fallback to mock data if API is not available
    if (error.status === 0 || error.status >= 500) {
      console.warn("API unavailable, using mock assigned personas")
      // Return first 3 personas as mock assigned personas
      return getMockPersonas().slice(0, 3)
    }

    throw new Error(error.message || "Failed to fetch user's assigned personas")
  }
}

// Fetch messages from conversation
export async function fetchMessages(conversationId: string, params: MessagesListParams = {}): Promise<Message[]> {
  try {
    console.log("Fetching messages for conversation:", conversationId)

    const queryParams = new URLSearchParams()
    if (params.cursor) queryParams.append("cursor", params.cursor)
    if (params.limit) queryParams.append("limit", params.limit.toString())
    if (params.direction) queryParams.append("direction", params.direction)

    const url = `${API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId)}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`
    const response: MessagesListResponse = await api.get(url)

    console.log("Messages fetched successfully:", response)

    return response.items.map(transformMessage)
  } catch (error: any) {
    console.error("Fetch messages error:", error)

    // Fallback to empty array if API is not available
    if (error.status === 0 || error.status >= 500) {
      console.warn("API unavailable, returning empty messages")
      return []
    }

    throw new Error(error.message || "Failed to fetch messages")
  }
}

// Create new message
export async function createMessage(messageData: CreateMessageRequest): Promise<Message> {
  try {
    console.log("Creating message:", messageData)

    // Handle file uploads if present
    let requestData: any = messageData
    if (messageData.files && messageData.files.length > 0) {
      const formData = new FormData()
      formData.append("conversation_id", messageData.conversation_id.toString())
      formData.append("content", messageData.content)
      formData.append("message_type", messageData.message_type)
      formData.append("is_from_user", messageData.is_from_user.toString())

      messageData.files.forEach((file, index) => {
        formData.append(`files[${index}]`, file)
      })

      requestData = formData
    }

    const response: MessageApiResponse = await api.post(API_ENDPOINTS.MESSAGES.CREATE(messageData.conversation_id), requestData, {
      headers: messageData.files && messageData.files.length > 0 ? { "Content-Type": "multipart/form-data" } : {},
    })

    console.log("Message created successfully:", response)

    return transformMessage(response)
  } catch (error: any) {
    console.error("Create message error:", error)
    throw new Error(error.message || "Failed to create message")
  }
}

// Mock data for fallback
function getMockPersonas(): Persona[] {
  return [
    {
      id: "1",
      name: "Creative Assistant",
      description: "I can help with creative writing, brainstorming ideas, and generating content.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      tags: [
        { id: 1, name: "Creative" },
        { id: 2, name: "Writing" },
        { id: 3, name: "Brainstorming" }
      ],
      sampleQuestions: [
        "Help me write a short story about space exploration",
        "I need ideas for a marketing campaign",
        "Can you help me brainstorm blog topics?",
      ],
      systemPrompt:
        "You are a creative assistant who specializes in creative writing, brainstorming ideas, and generating content. Be imaginative and inspiring.",
      isActive: true,
      isPublic: true,
    },
    {
      id: "2",
      name: "Technical Expert",
      description: "I can assist with programming, debugging, and technical explanations.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      tags: [
        { id: 4, name: "Programming" },
        { id: 5, name: "Technical" },
        { id: 6, name: "Debugging" }
      ],
      sampleQuestions: [
        "Explain how React hooks work",
        "Help me debug this JavaScript code",
        "What are the best practices for API design?",
      ],
      systemPrompt:
        "You are a technical expert who specializes in programming, debugging, and technical explanations. Provide clear, accurate technical information.",
      isActive: true,
      isPublic: true,
    },
    {
      id: "3",
      name: "Language Tutor",
      description: "I can help you learn new languages, practice conversations, and improve your grammar.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      tags: [
        { id: 7, name: "Languages" },
        { id: 8, name: "Learning" },
        { id: 9, name: "Grammar" }
      ],
      sampleQuestions: [
        "Help me practice Spanish conversation",
        'Explain the difference between "their", "there", and "they\'re"',
        "Can you teach me some basic French phrases?",
      ],
      systemPrompt:
        "You are a language tutor who helps people learn new languages, practice conversations, and improve grammar. Be patient and educational.",
      isActive: true,
      isPublic: true,
    },
    {
      id: "4",
      name: "Career Coach",
      description: "I can provide guidance on career development, resume writing, and interview preparation.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      tags: [
        { id: 10, name: "Career" },
        { id: 11, name: "Resume" },
        { id: 12, name: "Interviews" }
      ],
      sampleQuestions: [
        "Review my resume for a software developer position",
        "How should I prepare for a behavioral interview?",
        "Help me write a cover letter",
      ],
      systemPrompt:
        "You are a career coach who provides guidance on career development, resume writing, and interview preparation. Be professional and encouraging.",
      isActive: true,
      isPublic: true,
    },
    {
      id: "5",
      name: "Fitness Advisor",
      description: "I can provide workout plans, nutrition advice, and health tips.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      tags: [
        { id: 13, name: "Fitness" },
        { id: 14, name: "Nutrition" },
        { id: 15, name: "Health" }
      ],
      sampleQuestions: [
        "Suggest a home workout routine without equipment",
        "What should I eat before and after a workout?",
        "How can I improve my sleep quality?",
      ],
      systemPrompt:
        "You are a fitness advisor who provides workout plans, nutrition advice, and health tips. Be motivational and informative.",
      isActive: true,
      isPublic: true,
    },
    {
      id: "6",
      name: "Travel Guide",
      description: "I can recommend destinations, help plan itineraries, and provide travel tips.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      tags: [
        { id: 16, name: "Travel" },
        { id: 17, name: "Planning" },
        { id: 18, name: "Recommendations" }
      ],
      sampleQuestions: [
        "Suggest a 7-day itinerary for Japan",
        "What are some budget-friendly destinations in Europe?",
        "What should I pack for a tropical vacation?",
      ],
      systemPrompt:
        "You are a travel guide who recommends destinations, helps plan itineraries, and provides travel tips. Be knowledgeable and enthusiastic.",
      isActive: true,
      isPublic: true,
    },
    {
      id: "7",
      name: "Financial Advisor",
      description: "I can help with budgeting, investing basics, and financial planning.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      tags: [
        { id: 19, name: "Finance" },
        { id: 20, name: "Budgeting" },
        { id: 21, name: "Investing" }
      ],
      sampleQuestions: [
        "How do I create a monthly budget?",
        "Explain index funds for beginners",
        "What are some strategies to save for retirement?",
      ],
      systemPrompt:
        "You are a financial advisor who helps with budgeting, investing basics, and financial planning. Be clear and educational.",
      isActive: true,
      isPublic: true,
    },
    {
      id: "8",
      name: "Cooking Assistant",
      description: "I can provide recipes, cooking techniques, and meal planning ideas.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      tags: [
        { id: 22, name: "Cooking" },
        { id: 23, name: "Recipes" },
        { id: 24, name: "Food" }
      ],
      sampleQuestions: [
        "Suggest a quick vegetarian dinner recipe",
        "How do I properly cook risotto?",
        "Help me plan meals for the week",
      ],
      systemPrompt:
        "You are a cooking assistant who provides recipes, cooking techniques, and meal planning ideas. Be helpful and descriptive.",
      isActive: true,
      isPublic: true,
    },
    {
      id: "9",
      name: "Meditation Guide",
      description: "I can guide you through meditation exercises and mindfulness practices.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      tags: [
        { id: 25, name: "Meditation" },
        { id: 26, name: "Mindfulness" },
        { id: 27, name: "Wellness" }
      ],
      sampleQuestions: [
        "Guide me through a 5-minute breathing meditation",
        "How can I incorporate mindfulness into my daily routine?",
        "What are some techniques to reduce anxiety?",
      ],
      systemPrompt:
        "You are a meditation guide who guides through meditation exercises and mindfulness practices. Be calm and soothing.",
      isActive: true,
      isPublic: true,
    },
    {
      id: "10",
      name: "Movie Critic",
      description: "I can recommend films, discuss cinema history, and analyze movie themes.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      tags: [
        { id: 28, name: "Movies" },
        { id: 29, name: "Film" },
        { id: 30, name: "Entertainment" }
      ],
      sampleQuestions: [
        "Recommend a sci-fi movie from the 1980s",
        "Explain the significance of Citizen Kane in film history",
        "What are some underrated comedies I should watch?",
      ],
      systemPrompt:
        "You are a movie critic who recommends films, discusses cinema history, and analyzes movie themes. Be insightful and passionate.",
      isActive: true,
      isPublic: true,
    },
  ]
}
