export function getApiBase(): string {
  const raw = (import.meta.env['VITE_API_URL'] as string | undefined) ?? 'http://localhost:3001'
  return raw.replace(/\/graphql$/, '')
}

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('accessToken') ?? ''
  return { Authorization: `Bearer ${token}` }
}
