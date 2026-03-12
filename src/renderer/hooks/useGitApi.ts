import { useState, useCallback } from 'react'
import { api } from '../lib/ipc-client'

/**
 * 封装 IPC 调用，提供 loading / error 状态
 */
export function useGitApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const call = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      return result
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知错误'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, call, api }
}
