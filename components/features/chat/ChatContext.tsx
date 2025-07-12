"use client";

import React, { createContext, useContext, useState } from "react";
import type { Persona } from "@/lib/types";

interface ChatContextType {
  personas: Persona[];
  setPersonas: (p: Persona[]) => void;
  currentPersonaId: string | null;
  currentConversationId: string | null;
  setCurrentConversationId: (id: string) => void;
  setCurrentPersonaId: (id: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [currentPersonaId, setCurrentPersonaId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  return (
    <ChatContext.Provider value={{
      personas, setPersonas,
      currentPersonaId, setCurrentPersonaId,
      isSidebarCollapsed, setIsSidebarCollapsed,
      currentConversationId, setCurrentConversationId
    }}>
      {children}
    </ChatContext.Provider>
  );
}; 