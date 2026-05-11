export interface SolflareConnectResponse {
  publicKey: string;
}

export function buildSolflareConnectUrl(cluster: 'devnet' | 'mainnet-beta' | 'testnet' = 'devnet'): string {
  const appUrl = window.location.origin;
  const returnPath = window.location.pathname || "/";
  const redirectLink = `${appUrl}${returnPath}?solflare_action=connect`;
  
  const params = new URLSearchParams({
    cluster,
    app_url: appUrl,
    redirect_link: redirectLink
  });
  
  return `https://solflare.com/ul/v1/connect?${params.toString()}`;
}

export function parseSolflareCallback(): SolflareConnectResponse | null {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  
  if (params.get('solflare_action') !== 'connect') {
    return null;
  }
  
  const publicKey = params.get('public_key') || params.get('publicKey');
  
  if (!publicKey) {
    console.error('Missing Solflare public key in callback');
    return null;
  }
  
  try {
    const sessionData = JSON.stringify({
      publicKey,
      connectedAt: Date.now()
    });
    localStorage.setItem('solflare_session', sessionData);
    sessionStorage.setItem('solflare_session', sessionData);
    
    return {
      publicKey
    };
  } catch (error) {
    console.error('Error parsing Solflare callback:', error);
    return null;
  }
}

export function clearSolflareSession(): void {
  sessionStorage.removeItem('solflare_session');
  localStorage.removeItem('solflare_session');
}

export function hasSolflareSession(): boolean {
  return !!localStorage.getItem('solflare_session') || !!sessionStorage.getItem('solflare_session');
}
