"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Play } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const CODE_EXAMPLES = [
  {
    id: 1,
    title: "React Component with Animation",
    description: "Animated button component using Framer Motion",
    language: "tsx",
    code: `import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary' 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={\`px-6 py-3 rounded-lg font-semibold transition-all \${
        variant === 'primary' 
          ? 'bg-blue-500 text-white hover:bg-blue-600' 
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
      }\`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      <motion.span
        animate={{ 
          rotateX: isHovered ? 360 : 0 
        }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
};

export default AnimatedButton;`,
    tags: ["React", "TypeScript", "Animation", "Framer Motion"],
  },
  {
    id: 2,
    title: "API Error Handler",
    description: "Comprehensive TypeScript utility for handling API errors",
    language: "typescript",
    code: `export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

export class ApiErrorHandler {
  private static instance: ApiErrorHandler;
  private errorMap: Map<number, string> = new Map();

  private constructor() {
    this.initializeErrorMap();
  }

  public static getInstance(): ApiErrorHandler {
    if (!ApiErrorHandler.instance) {
      ApiErrorHandler.instance = new ApiErrorHandler();
    }
    return ApiErrorHandler.instance;
  }

  private initializeErrorMap(): void {
    this.errorMap.set(400, 'Bad Request');
    this.errorMap.set(401, 'Unauthorized');
    this.errorMap.set(403, 'Forbidden');
    this.errorMap.set(404, 'Not Found');
    this.errorMap.set(500, 'Internal Server Error');
  }

  public handleError(error: any): ApiError {
    if (error.response) {
      return {
        message: error.response.data?.message || 
                this.errorMap.get(error.response.status) || 
                'Unknown error',
        status: error.response.status,
        code: error.response.data?.code,
        details: error.response.data?.details
      };
    } else if (error.request) {
      return {
        message: 'Network error - please check your connection',
        status: 0,
        code: 'NETWORK_ERROR'
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1,
        code: 'UNKNOWN_ERROR'
      };
    }
  }
}`,
    tags: ["TypeScript", "Error Handling", "Singleton Pattern", "API"],
  },
  {
    id: 3,
    title: "CSS Loading Animation",
    description: "Creative CSS-only loading spinner with gradient effects",
    language: "css",
    code: `/* Creative Loading Spinner */
.creative-spinner {
  width: 60px;
  height: 60px;
  position: relative;
  margin: 20px auto;
}

.creative-spinner::before,
.creative-spinner::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  animation: pulse 2s infinite ease-in-out;
}

.creative-spinner::before {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  animation-delay: -1s;
}

.creative-spinner::after {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  background: linear-gradient(45deg, #45b7d1, #96ceb4);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    transform: scale(1);
    opacity: 0.7;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}`,
    tags: ["CSS", "Animation", "Loading", "Gradient"],
  },
  {
    id: 4,
    title: "Python Data Analysis",
    description: "Data analysis script using pandas and matplotlib",
    language: "python",
    code: `import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import numpy as np

class DataAnalyzer:
    def __init__(self, data_file=None):
        self.df = None
        if data_file:
            self.load_data(data_file)
    
    def load_data(self, file_path):
        """Load data from CSV file"""
        try:
            self.df = pd.read_csv(file_path)
            print(f"Data loaded successfully: {self.df.shape}")
            return True
        except Exception as e:
            print(f"Error loading data: {e}")
            return False
    
    def basic_stats(self):
        """Generate basic statistics"""
        if self.df is None:
            return "No data loaded"
        
        stats = {
            'shape': self.df.shape,
            'columns': list(self.df.columns),
            'missing_values': self.df.isnull().sum().to_dict(),
            'data_types': self.df.dtypes.to_dict(),
            'numeric_summary': self.df.describe().to_dict()
        }
        return stats
    
    def create_visualization(self, x_col, y_col, chart_type='scatter'):
        """Create various types of visualizations"""
        if self.df is None:
            return "No data loaded"
        
        plt.figure(figsize=(10, 6))
        
        if chart_type == 'scatter':
            plt.scatter(self.df[x_col], self.df[y_col], alpha=0.6)
        elif chart_type == 'line':
            plt.plot(self.df[x_col], self.df[y_col])
        elif chart_type == 'bar':
            self.df.groupby(x_col)[y_col].mean().plot(kind='bar')
        
        plt.xlabel(x_col)
        plt.ylabel(y_col)
        plt.title(f'{chart_type.title()} Plot: {x_col} vs {y_col}')
        plt.tight_layout()
        plt.show()
    
    def correlation_matrix(self):
        """Generate correlation matrix heatmap"""
        if self.df is None:
            return "No data loaded"
        
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        correlation = self.df[numeric_cols].corr()
        
        plt.figure(figsize=(12, 8))
        sns.heatmap(correlation, annot=True, cmap='coolwarm', center=0)
        plt.title('Correlation Matrix')
        plt.tight_layout()
        plt.show()
        
        return correlation

# Usage example
analyzer = DataAnalyzer()
# analyzer.load_data('your_data.csv')
# stats = analyzer.basic_stats()
# analyzer.create_visualization('column1', 'column2', 'scatter')`,
    tags: ["Python", "Data Analysis", "Pandas", "Matplotlib", "Visualization"],
  },
]

export function DemoCodeExamples() {
  const [selectedExample, setSelectedExample] = useState<number | null>(null)
  const { toast } = useToast()

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast({
        title: "Code copied!",
        description: "Code has been copied to clipboard.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy code to clipboard.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Code Examples Demo</h2>
        <p className="text-muted-foreground">
          These are examples of how code is rendered in the chat interface with syntax highlighting
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CODE_EXAMPLES.map((example) => (
          <Card key={example.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{example.title}</CardTitle>
                <Badge variant="outline">{example.language}</Badge>
              </div>
              <CardDescription>{example.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 mb-4">
                {example.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedExample(example.id)}>
                  <Play className="mr-2 h-4 w-4" />
                  View Code
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleCopy(example.code)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedExample && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{CODE_EXAMPLES.find((e) => e.id === selectedExample)?.title}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedExample(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm">
                <code>{CODE_EXAMPLES.find((e) => e.id === selectedExample)?.code}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">How to Test Code Rendering</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to any chat page (e.g., /chat/1 or /chat/2)</li>
            <li>Ask for code examples using keywords like:</li>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>"Show me a React component example"</li>
              <li>"Create a JavaScript function"</li>
              <li>"Write some CSS code"</li>
              <li>"Give me a TypeScript example"</li>
              <li>"Show me Python code"</li>
            </ul>
            <li>The AI will respond with properly formatted code blocks</li>
            <li>You can copy individual code blocks or entire messages</li>
            <li>Code blocks include syntax highlighting and language detection</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
