import { getAccessToken } from "@privy-io/react-auth"

// Direct-to-API base URL. When set (production), the browser calls the API
// origin directly instead of relying on the Next.js /api rewrite proxy.
// Empty string in dev → same-origin /api/* → dev rewrite proxies to Express.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

/**
 * fetch wrapper for /api calls. Privy keeps its access token in localStorage
 * (no session cookie like Clerk), so every authenticated request must carry
 * an Authorization bearer header. Works outside React — `getAccessToken` is
 * a module-level export, so zustand stores can use this too.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken().catch(() => null)
  const headers = new Headers(init.headers)
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  return fetch(`${API_BASE}${input}`, { ...init, headers })
}
