import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, MessageSquare, Shield, Smartphone } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <MessageSquare className="h-5 w-5" />
            <span>NextChat</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Demo Mode - Auto Login Enabled
            </Badge>
            <Link href="/personas">
              <Button>
                Go to Chat App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      🚀 Demo Ready
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      No Login Required
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Connect with AI Personas
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Experience the future of communication with our cutting-edge chat platform. Talk to various AI
                    personas tailored to your needs. <strong>Auto-login is enabled for instant access!</strong>
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/personas">
                    <Button size="lg" className="gap-1.5">
                      Start Chatting Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg">
                      Manual Login
                    </Button>
                  </Link>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 mt-4">
                  <h3 className="font-semibold mb-2">🎯 Quick Start Guide:</h3>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Click "Start Chatting Now" above</li>
                    <li>2. Browse and select any AI persona</li>
                    <li>3. Start chatting immediately!</li>
                  </ol>
                  <p className="text-xs text-muted-foreground mt-2">
                    <strong>Demo Credentials:</strong> demo@example.com / password123
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[450px] w-[350px] rounded-xl bg-gradient-to-b from-purple-500 to-indigo-700 p-1 shadow-2xl">
                  <div className="absolute inset-[1px] rounded-lg bg-background p-4">
                    <div className="flex flex-col h-full space-y-4">
                      <div className="flex items-center space-x-4 border-b pb-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-violet-500"></div>
                        <div>
                          <div className="text-sm font-medium">Creative Assistant</div>
                          <div className="text-xs text-muted-foreground">Online</div>
                        </div>
                      </div>
                      <div className="flex-1 space-y-4 overflow-auto">
                        <div className="flex justify-start">
                          <div className="max-w-[80%] rounded-lg bg-muted p-3 text-sm">
                            Hello! I'm your creative assistant. How can I help you today?
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="max-w-[80%] rounded-lg bg-primary p-3 text-sm text-primary-foreground">
                            I need help with a design project
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="max-w-[80%] rounded-lg bg-muted p-3 text-sm">
                            I'd be happy to help with your design project! What kind of design are you working on?
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 rounded-lg border bg-background p-2">Type a message...</div>
                        <Button size="icon" className="h-8 w-8 shrink-0 rounded-full">
                          <ArrowRight className="h-4 w-4" />
                          <span className="sr-only">Send</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Key Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover what makes our chat application stand out
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Shield className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Auto Authentication</h3>
                <p className="text-center text-muted-foreground">
                  Demo mode with automatic login - no signup required for testing!
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <MessageSquare className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">10 AI Personas</h3>
                <p className="text-center text-muted-foreground">
                  Chat with various AI personas tailored to different needs and interests.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Smartphone className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Responsive Design</h3>
                <p className="text-center text-muted-foreground">
                  Enjoy a seamless experience on any device, from desktop to mobile.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 NextChat. All rights reserved. | Demo Mode Active
          </p>
        </div>
      </footer>
    </div>
  )
}
