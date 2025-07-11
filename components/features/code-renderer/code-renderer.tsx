// components/features/code-renderer/code-renderer.tsx
"use client"

import { useState, memo } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeRendererProps {
  code: string
  language?: string
  className?: string
  showLineNumbers?: boolean
}

export const CodeRenderer = memo(({ 
  code, 
  language = "text", 
  className,
  showLineNumbers = true 
}: CodeRendererProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `code.${language}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Simple syntax highlighting for common keywords
  const highlightCode = (code: string, lang: string) => {
    // This is a simple implementation. In production, use a library like Prism.js
    const keywords: Record<string, string[]> = {
      javascript: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "class", "import", "export", "from"],
      typescript: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "class", "import", "export", "from", "interface", "type", "enum"],
      python: ["def", "return", "if", "else", "for", "while", "class", "import", "from", "as", "try", "except", "with"],
      java: ["public", "private", "class", "interface", "extends", "implements", "return", "if", "else", "for", "while", "try", "catch"],
    }

    let highlighted = code
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

    // Highlight strings
    highlighted = highlighted.replace(
      /(["'`])(?:(?=(\\?))\2.)*?\1/g,
      '<span class="text-green-600 dark:text-green-400">$&</span>'
    )

    // Highlight numbers
    highlighted = highlighted.replace(
      /\b(\d+)\b/g,
      '<span class="text-blue-600 dark:text-blue-400">$1</span>'
    )

    // Highlight keywords
    const langKeywords = keywords[lang.toLowerCase()] || []
    langKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g")
      highlighted = highlighted.replace(
        regex,
        `<span class="text-purple-600 dark:text-purple-400 font-medium">${keyword}</span>`
      )
    })

    // Highlight comments
    highlighted = highlighted.replace(
      /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
      '<span class="text-gray-500 dark:text-gray-400 italic">$1</span>'
    )

    return highlighted
  }

  const lines = code.split("\n")
  const highlightedCode = highlightCode(code, language)
  const highlightedLines = highlightedCode.split("\n")

  return (
    <div className={cn("relative group", className)}>
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-muted/50 rounded-t-md">
        <span className="text-xs font-medium text-muted-foreground">
          {language}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span className="ml-1 text-xs">Copy</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 px-2"
          >
            <Download className="h-3 w-3" />
            <span className="ml-1 text-xs">Download</span>
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-md border bg-muted/30 pt-10">
        <pre className="p-4">
          <code className="text-sm">
            {showLineNumbers ? (
              <table className="w-full">
                <tbody>
                  {highlightedLines.map((line, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="select-none text-right pr-4 text-muted-foreground text-xs w-12">
                        {index + 1}
                      </td>
                      <td 
                        className="w-full"
                        dangerouslySetInnerHTML={{ 
                          __html: line || "&nbsp;" 
                        }}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
            )}
          </code>
        </pre>
      </div>
    </div>
  )
})

CodeRenderer.displayName = "CodeRenderer"