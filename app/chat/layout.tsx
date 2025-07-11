// app/chat/layout.tsx
import { ChatProvider } from "@/components/features/chat/ChatContext";
import Sidebar from "@/components/features/chat/sidebar";
import React from "react";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <div className="flex h-screen w-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-background">
          {children}
        </main>
      </div>
    </ChatProvider>
  );
}