'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugAuthPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDebugTests = async () => {
    setLoading(true)
    try {
      // Test debug endpoint
      const response = await fetch('/api/auth/debug')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'roma_descartables@hotmail.com',
          password: 'admin123'
        })
      })
      
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runDebugTests} disabled={loading}>
              {loading ? 'Testing...' : 'Run Debug Tests'}
            </Button>
            <Button onClick={testLogin} disabled={loading} variant="outline">
              {loading ? 'Testing...' : 'Test Login'}
            </Button>
          </div>
          
          {results && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Results:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}