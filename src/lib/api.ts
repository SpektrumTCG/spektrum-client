import { getAccessToken } from "@privy-io/react-auth"

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
  return fetch(input, { ...init, headers })
}
