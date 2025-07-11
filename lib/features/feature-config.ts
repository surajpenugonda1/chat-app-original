export interface FeatureConfig {
  id: string
  name: string
  description: string
  enabled: boolean
  adminOnly: boolean
  userRoles?: string[]
  dependencies?: string[]
}

export const FEATURE_FLAGS: Record<string, FeatureConfig> = {
  // Core Features
  CHAT_BASIC: {
    id: "CHAT_BASIC",
    name: "Basic Chat",
    description: "Basic text messaging functionality",
    enabled: true,
    adminOnly: false,
  },

  // Message Features
  MESSAGE_COPY: {
    id: "MESSAGE_COPY",
    name: "Copy Messages",
    description: "Allow users to copy message content",
    enabled: true,
    adminOnly: false,
  },

  MESSAGE_CODE_RENDERING: {
    id: "MESSAGE_CODE_RENDERING",
    name: "Code Rendering",
    description: "Syntax highlighting for code blocks",
    enabled: true,
    adminOnly: false,
  },

  MESSAGE_REACTIONS: {
    id: "MESSAGE_REACTIONS",
    name: "Message Reactions",
    description: "React to messages with emojis",
    enabled: true,
    adminOnly: false,
  },

  MESSAGE_EDIT: {
    id: "MESSAGE_EDIT",
    name: "Edit Messages",
    description: "Allow users to edit their messages",
    enabled: false,
    adminOnly: false,
  },

  MESSAGE_DELETE: {
    id: "MESSAGE_DELETE",
    name: "Delete Messages",
    description: "Allow users to delete their messages",
    enabled: false,
    adminOnly: true,
  },

  // Media Features
  AUDIO_RECORDING: {
    id: "AUDIO_RECORDING",
    name: "Audio Recording",
    description: "Record and send voice messages",
    enabled: true,
    adminOnly: false,
  },

  FILE_UPLOAD: {
    id: "FILE_UPLOAD",
    name: "File Upload",
    description: "Upload and share files",
    enabled: true,
    adminOnly: false,
  },

  IMAGE_UPLOAD: {
    id: "IMAGE_UPLOAD",
    name: "Image Upload",
    description: "Upload and share images",
    enabled: true,
    adminOnly: false,
    dependencies: ["FILE_UPLOAD"],
  },

  // Chat Features
  CHAT_HISTORY: {
    id: "CHAT_HISTORY",
    name: "Chat History",
    description: "Save and load conversation history",
    enabled: true,
    adminOnly: false,
  },

  CHAT_EXPORT: {
    id: "CHAT_EXPORT",
    name: "Export Chat",
    description: "Export chat conversations",
    enabled: false,
    adminOnly: true,
  },

  TYPING_INDICATORS: {
    id: "TYPING_INDICATORS",
    name: "Typing Indicators",
    description: "Show when AI is typing",
    enabled: true,
    adminOnly: false,
  },

  // Persona Features
  PERSONA_SELECTION: {
    id: "PERSONA_SELECTION",
    name: "Multiple Personas",
    description: "Select and manage multiple personas",
    enabled: true,
    adminOnly: false,
  },

  PERSONA_CUSTOM: {
    id: "PERSONA_CUSTOM",
    name: "Custom Personas",
    description: "Create custom AI personas",
    enabled: false,
    adminOnly: true,
  },

  // Advanced Features
  VOICE_PLAYBACK: {
    id: "VOICE_PLAYBACK",
    name: "Voice Playback",
    description: "Text-to-speech for AI responses",
    enabled: false,
    adminOnly: false,
  },

  MESSAGE_SEARCH: {
    id: "MESSAGE_SEARCH",
    name: "Message Search",
    description: "Search through chat history",
    enabled: true,
    adminOnly: false,
    dependencies: ["CHAT_HISTORY"],
  },

  DARK_MODE: {
    id: "DARK_MODE",
    name: "Dark Mode",
    description: "Toggle between light and dark themes",
    enabled: true,
    adminOnly: false,
  },

  // Admin Features
  USER_MANAGEMENT: {
    id: "USER_MANAGEMENT",
    name: "User Management",
    description: "Manage user accounts and permissions",
    enabled: true,
    adminOnly: true,
  },

  ANALYTICS: {
    id: "ANALYTICS",
    name: "Analytics",
    description: "Track usage and performance metrics",
    enabled: false,
    adminOnly: true,
  },
}
