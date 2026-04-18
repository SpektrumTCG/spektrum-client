import nacl from 'tweetnacl';
import bs58 from 'bs58';

export interface BackpackConnectResponse {
  publicKey: string;
  session: string;
}

const BACKPACK_KEYPAIR_KEY = 'backpack_dapp_keypair';

function getOrCreateBackpackKeypair() {
  const stored = localStorage.getItem(BACKPACK_KEYPAIR_KEY);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        publicKey: new Uint8Array(parsed.publicKey),
        secretKey: new Uint8Array(parsed.secretKey)
      };
    } catch (e) {
      console.warn('Failed to parse stored Backpack keypair, generating new one');
    }
  }

  const keyPair = nacl.box.keyPair();

  localStorage.setItem(BACKPACK_KEYPAIR_KEY, JSON.stringify({
    publicKey: Array.from(keyPair.publicKey),
    secretKey: Array.from(keyPair.secretKey)
  }));

  return keyPair;
}

export function buildBackpackConnectUrl(cluster: 'devnet' | 'mainnet-beta' | 'testnet' = 'devnet'): string {
  const dappKeyPair = getOrCreateBackpackKeypair();
  const appUrl = window.location.origin;
  const redirectLink = `${appUrl}?backpack_action=connect`;

  const params = new URLSearchParams({
    redirect_link: redirectLink,
    cluster,
    app_url: appUrl,
    wallet_xxx: bs58.encode(dappKeyPair.publicKey)
  });

  return `https://backpack.app/connect?${params.toString()}`;
}

export function parseBackpackCallback(): BackpackConnectResponse | null {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  if (params.get('backpack_action') !== 'connect') {
    return null;
  }

  const data = params.get('data');
  const nonce = params.get('nonce');
  const backpackPublicKey = params.get('backpack_encryption_public_key') || params.get('phantom_encryption_public_key');

  if (!data || !nonce) {
    const publicKey = params.get('public_key') || params.get('publicKey');
    if (publicKey) {
      console.log('✅ Backpack returned public key directly (unencrypted)');
      localStorage.setItem('backpack_session', JSON.stringify({
        publicKey,
        connectedAt: Date.now()
      }));
      return { publicKey, session: '' };
    }
    console.warn('Missing Backpack callback parameters');
    return null;
  }

  if (!backpackPublicKey) {
    console.warn('Missing Backpack encryption public key');
    return null;
  }

  try {
    console.log('Decrypting Backpack response...');
    const dappKeyPair = getOrCreateBackpackKeypair();

    const sharedSecret = nacl.box.before(
      bs58.decode(backpackPublicKey),
      dappKeyPair.secretKey
    );

    const decrypted = nacl.box.open.after(
      bs58.decode(data),
      bs58.decode(nonce),
      sharedSecret
    );

    if (!decrypted) {
      console.error('Failed to decrypt Backpack response');
      return null;
    }

    const connectData = JSON.parse(new TextDecoder().decode(decrypted));
    console.log('Backpack response decrypted:', {
      public_key: connectData.public_key?.substring(0, 8) + '...'
    });

    localStorage.setItem('backpack_session', JSON.stringify({
      publicKey: connectData.public_key,
      session: connectData.session,
      connectedAt: Date.now()
    }));

    return {
      publicKey: connectData.public_key,
      session: connectData.session
    };
  } catch (error) {
    console.error('Error parsing Backpack callback:', error);
    return null;
  }
}

export function clearBackpackSession(): void {
  localStorage.removeItem('backpack_session');
  sessionStorage.removeItem('backpack_session');
}

export function hasBackpackSession(): boolean {
  return !!localStorage.getItem('backpack_session');
}
