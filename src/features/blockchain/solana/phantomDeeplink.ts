import nacl from 'tweetnacl';
import bs58 from 'bs58';

export interface PhantomDeeplinkKeys {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface PhantomConnectResponse {
  publicKey: string;
  session: string;
}

const DAPP_KEYPAIR_KEY = 'phantom_dapp_keypair';

export function getOrCreateDappKeypair(): PhantomDeeplinkKeys {
  let stored = localStorage.getItem(DAPP_KEYPAIR_KEY);
  if (!stored) {
    stored = sessionStorage.getItem(DAPP_KEYPAIR_KEY);
    if (stored) {
      localStorage.setItem(DAPP_KEYPAIR_KEY, stored);
      sessionStorage.removeItem(DAPP_KEYPAIR_KEY);
      console.log('📦 Migrated Phantom dApp keypair from sessionStorage to localStorage');
    }
  }
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        publicKey: new Uint8Array(parsed.publicKey),
        secretKey: new Uint8Array(parsed.secretKey)
      };
    } catch (e) {
      console.warn('Failed to parse stored keypair, generating new one');
    }
  }
  
  const keyPair = nacl.box.keyPair();
  
  localStorage.setItem(DAPP_KEYPAIR_KEY, JSON.stringify({
    publicKey: Array.from(keyPair.publicKey),
    secretKey: Array.from(keyPair.secretKey)
  }));
  
  return keyPair;
}

export function buildPhantomConnectUrl(cluster: 'devnet' | 'mainnet-beta' | 'testnet' = 'devnet'): string {
  const dappKeyPair = getOrCreateDappKeypair();
  const appUrl = window.location.origin;
  const returnPath = window.location.pathname || "/";
  const redirectLink = `${appUrl}${returnPath}?phantom_action=connect`;
  
  const params = new URLSearchParams({
    dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
    cluster,
    app_url: appUrl,
    redirect_link: redirectLink
  });
  
  return `https://phantom.app/ul/v1/connect?${params.toString()}`;
}

export function parsePhantomCallback(): PhantomConnectResponse | null {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  if (params.get('phantom_action') !== 'connect') {
    return null;
  }

  console.log('🔍 Processing Phantom callback...');
  
  const data = params.get('data');
  const nonce = params.get('nonce');
  const phantomPublicKey = params.get('phantom_encryption_public_key');
  
  console.log('📦 Phantom callback parameters:', {
    hasData: !!data,
    hasNonce: !!nonce,
    hasPhantomPublicKey: !!phantomPublicKey
  });
  
  if (!data || !nonce || !phantomPublicKey) {
    console.warn('⚠️ Missing Phantom callback parameters - still waiting for Phantom response');
    console.log('Available params:', {
      data: data ? data.substring(0, 20) + '...' : 'missing',
      nonce: nonce ? nonce.substring(0, 20) + '...' : 'missing',
      phantomPublicKey: phantomPublicKey ? phantomPublicKey.substring(0, 20) + '...' : 'missing'
    });
    return null;
  }
  
  try {
    console.log('🔐 Decrypting Phantom response...');
    const dappKeyPair = getOrCreateDappKeypair();
    
    const sharedSecret = nacl.box.before(
      bs58.decode(phantomPublicKey),
      dappKeyPair.secretKey
    );
    
    const decrypted = nacl.box.open.after(
      bs58.decode(data),
      bs58.decode(nonce),
      sharedSecret
    );
    
    if (!decrypted) {
      console.error('❌ Failed to decrypt Phantom response');
      return null;
    }
    
    const connectData = JSON.parse(new TextDecoder().decode(decrypted));
    console.log('✅ Phantom response decrypted successfully:', {
      public_key: connectData.public_key?.substring(0, 8) + '...',
      session: connectData.session?.substring(0, 20) + '...'
    });
    
    const phantomSession = JSON.stringify({
      publicKey: phantomPublicKey,
      session: connectData.session
    });
    localStorage.setItem('phantom_session', phantomSession);
    sessionStorage.setItem('phantom_session', phantomSession);
    
    return {
      publicKey: connectData.public_key,
      session: connectData.session
    };
  } catch (error) {
    console.error('❌ Error parsing Phantom callback:', error);
    return null;
  }
}

export function clearPhantomSession(): void {
  sessionStorage.removeItem('phantom_session');
  localStorage.removeItem('phantom_session');
}

export function hasPhantomSession(): boolean {
  return !!localStorage.getItem('phantom_session') || !!sessionStorage.getItem('phantom_session');
}
