// Multi-Wallet Detection Utility for Solana
// Detection order: 1) Legacy injection  2) PWA deep links  3) Wallet Standard (overrides deep links)
// See: https://github.com/wallet-standard/wallet-standard
import { isStandalonePWA } from '@/lib/pwaUtils';
import { buildPhantomConnectUrl, parsePhantomCallback } from './phantomDeeplink';
import { buildBackpackConnectUrl } from './backpackDeeplink';
import { buildSolflareConnectUrl } from './solflareDeeplink';
import { getWallets } from '@wallet-standard/app';
import type { Wallet, WalletWithFeatures } from '@wallet-standard/base';
import { address, isAddress } from '@solana/kit';

export const WALLET_ICONS: Record<string, string> = {
  phantom: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgdmlld0JveD0iMCAwIDEwOCAxMDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwOCIgaGVpZ2h0PSIxMDgiIHJ4PSIyNCIgZmlsbD0iIzRFNDRDRSIvPjxwYXRoIGQ9Ik03OC44IDQ0LjRjLTIuOCAwLTUuMi0yLjMtNS4yLTUuMnMyLjMtNS4yIDUuMi01LjIgNS4yIDIuMyA1LjIgNS4yLTIuMyA1LjItNS4yIDUuMnptLTQ5LjYgMGMtMi44IDAtNS4yLTIuMy01LjItNS4yczIuMy01LjIgNS4yLTUuMiA1LjIgMi4zIDUuMiA1LjItMi4zIDUuMi01LjIgNS4yem00OS42LTI2LjRIMjkuMkMxNy42IDE4IDggMjcuNiA4IDM5LjJ2MjkuNmMwIDExLjYgOS42IDIxLjIgMjEuMiAyMS4yaDQ5LjZjMTEuNiAwIDIxLjItOS42IDIxLjItMjEuMlYzOS4yYzAtMTEuNi05LjYtMjEuMi0yMS4yLTIxLjJ6IiBmaWxsPSIjZmZmIi8+PC9zdmc+',
  solflare: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgdmlld0JveD0iMCAwIDEwOCAxMDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwOCIgaGVpZ2h0PSIxMDgiIHJ4PSIyNCIgZmlsbD0iIzEyMTIxMiIvPjxwYXRoIGQ9Ik01NCAyMGMtNC40IDAtOCAzLjYtOCA4czMuNiA4IDggOCA4LTMuNiA4LTgtMy42LTgtOC04em0wIDQ4Yy04LjggMC0xNi03LjItMTYtMTZzNy4yLTE2IDE2LTE2IDE2IDcuMiAxNiAxNi03LjIgMTYtMTYgMTZ6bTAtNDBjLTEzLjIgMC0yNCAxMC44LTI0IDI0czEwLjggMjQgMjQgMjQgMjQtMTAuOCAyNC0yNC0xMC44LTI0LTI0LTI0eiIgZmlsbD0iI0ZDNTQxRCIvPjxjaXJjbGUgY3g9IjU0IiBjeT0iNTIiIHI9IjgiIGZpbGw9IiNGQzU0MUQiLz48L3N2Zz4=',
  jupiter: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgdmlld0JveD0iMCAwIDEwOCAxMDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwOCIgaGVpZ2h0PSIxMDgiIHJ4PSIyNCIgZmlsbD0iIzE5MUQzMiIvPjxjaXJjbGUgY3g9IjU0IiBjeT0iNTQiIHI9IjMwIiBzdHJva2U9IiM1N0U1QTAiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjU0IiBjeT0iNTQiIHI9IjE2IiBmaWxsPSIjNTdFNUEwIi8+PGVsbGlwc2UgY3g9IjU0IiBjeT0iNTQiIHJ4PSI0MCIgcnk9IjEwIiBzdHJva2U9IiM1N0U1QTAiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgdHJhbnNmb3JtPSJyb3RhdGUoLTMwIDU0IDU0KSIvPjwvc3ZnPg==',
  seeker: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgdmlld0JveD0iMCAwIDEwOCAxMDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwOCIgaGVpZ2h0PSIxMDgiIHJ4PSIyNCIgZmlsbD0iIzAwRDA4MiIvPjxwYXRoIGQ9Ik01NCAyNGMtMTYuNiAwLTMwIDEzLjQtMzAgMzBzMTMuNCAzMCAzMCAzMCAzMC0xMy40IDMwLTMwLTEzLjQtMzAtMzAtMzB6bTAgNDhjLTkuOSAwLTE4LTguMS0xOC0xOHM4LjEtMTggMTgtMTggMTggOC4xIDE4IDE4LTguMSAxOC0xOCAxOHoiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSI1NCIgY3k9IjU0IiByPSIxMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==',
  backpack: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgdmlld0JveD0iMCAwIDEwOCAxMDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwOCIgaGVpZ2h0PSIxMDgiIHJ4PSIyNCIgZmlsbD0iI0UzMzUzMCIvPjxyZWN0IHg9IjMwIiB5PSIzNCIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ0IiByeD0iOCIgZmlsbD0iI2ZmZiIvPjxyZWN0IHg9IjM4IiB5PSIyMCIgd2lkdGg9IjMyIiBoZWlnaHQ9IjIwIiByeD0iOCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiLz48cmVjdCB4PSI0MCIgeT0iNTgiIHdpZHRoPSIyOCIgaGVpZ2h0PSIxMiIgcng9IjQiIGZpbGw9IiNFMzM1MzAiLz48L3N2Zz4=',
  magicEden: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgdmlld0JveD0iMCAwIDEwOCAxMDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwOCIgaGVpZ2h0PSIxMDgiIHJ4PSIyNCIgZmlsbD0iI0U0MkY3QSIvPjxwYXRoIGQ9Ik0zMCA3OFYzNGw0OCA0NEgzMHoiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNNzggMzBWNzRMNDYgNDZsMzItMTZ6IiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjciLz48L3N2Zz4=',
  trustWallet: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgdmlld0JveD0iMCAwIDEwOCAxMDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwOCIgaGVpZ2h0PSIxMDgiIHJ4PSIyNCIgZmlsbD0iIzMzNzVCQiIvPjxwYXRoIGQ9Ik01NCAyNGMtMTIgMC0yMiA2LTI2IDE0djIwYzAgMTggMjYgMjYgMjYgMjZzMjYtOCAyNi0yNlYzOGMtNC04LTE0LTE0LTI2LTE0eiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiLz48L3N2Zz4=',
  glow: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgdmlld0JveD0iMCAwIDEwOCAxMDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwOCIgaGVpZ2h0PSIxMDgiIHJ4PSIyNCIgZmlsbD0iIzFBMUEyRSIvPjxjaXJjbGUgY3g9IjU0IiBjeT0iNTQiIHI9IjI0IiBmaWxsPSIjRkZENzAwIi8+PGNpcmNsZSBjeD0iNTQiIGN5PSI1NCIgcj0iMzIiIHN0cm9rZT0iI0ZGRDcwMCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjQiLz48L3N2Zz4=',
  coin98: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgdmlld0JveD0iMCAwIDEwOCAxMDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwOCIgaGVpZ2h0PSIxMDgiIHJ4PSIyNCIgZmlsbD0iI0QwOTQyQSIvPjx0ZXh0IHg9IjU0IiB5PSI2MiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIzNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmZmYiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIj5DOTg8L3RleHQ+PC9zdmc+',
};

export interface SolanaWalletProvider {
  name: string;
  icon: string;
  adapter: any;
  isInstalled: boolean;
  isDeeplink?: boolean;
}

export interface DetectedWallets {
  phantom?: SolanaWalletProvider;
  solflare?: SolanaWalletProvider;
  backpack?: SolanaWalletProvider;
  trustWallet?: SolanaWalletProvider;
  jupiter?: SolanaWalletProvider;
  magicEden?: SolanaWalletProvider;
  glow?: SolanaWalletProvider;
  slope?: SolanaWalletProvider;
  sollet?: SolanaWalletProvider;
  coin98?: SolanaWalletProvider;
  seeker?: SolanaWalletProvider;
  [key: string]: SolanaWalletProvider | undefined;
}

function createDeepLinkAdapter(name: string, urlBuilder: () => string) {
  return {
    isDeeplink: true,
    name,
    connect: async () => {
      console.log(`🔗 Connecting to ${name} via deeplink...`);
      const deepLinkUrl = urlBuilder();
      window.location.href = deepLinkUrl;
    },
    disconnect: async () => { console.log(`Disconnecting ${name} deeplink`); }
  };
}

export function detectSolanaWallets(): DetectedWallets {
  const wallets: DetectedWallets = {};

  if (typeof window === 'undefined') {
    return wallets;
  }

  const win = window as any;
  const inStandalonePWA = isStandalonePWA();

  const phantomCallback = parsePhantomCallback();
  if (phantomCallback) {
    console.log('✅ Phantom callback detected from deeplink:', phantomCallback);
  }

  // --- 1. LEGACY INJECTION DETECTION (window.solana, etc.) ---

  if (win.solana?.isPhantom) {
    wallets.phantom = {
      name: 'Phantom',
      icon: WALLET_ICONS.phantom,
      adapter: win.solana,
      isInstalled: true
    };
    console.log('✅ Phantom found via injection');
  }

  let solflareAdapter = null;
  if (win.solflare?.isSolflare) solflareAdapter = win.solflare;
  else if (win.solana?.isSolflare && !win.solana?.isPhantom) solflareAdapter = win.solana;
  else if (win.SolflareApp) solflareAdapter = win.SolflareApp;

  if (solflareAdapter) {
    if (typeof solflareAdapter.connect === 'function') {
      wallets.solflare = {
        name: 'Solflare',
        icon: WALLET_ICONS.solflare,
        adapter: solflareAdapter,
        isInstalled: true
      };
      console.log('✅ Solflare found via injection');
    } else {
      console.warn('⚠️ Solflare adapter found but missing connect method');
    }
  }

  if (win.backpack?.isBackpack) {
    wallets.backpack = {
      name: 'Backpack',
      icon: WALLET_ICONS.backpack,
      adapter: win.backpack,
      isInstalled: true
    };
  }

  let jupiterAdapter = null;
  if (win.jupiter?.solana?.connect) jupiterAdapter = win.jupiter.solana;
  else if (win.jupiter?.connect) jupiterAdapter = win.jupiter;
  else if (win.solana?.isJupiter) jupiterAdapter = win.solana;
  else if (win.jupiterWallet) jupiterAdapter = win.jupiterWallet;

  if (jupiterAdapter) {
    if (typeof jupiterAdapter.connect === 'function') {
      wallets.jupiter = {
        name: 'Jupiter',
        icon: WALLET_ICONS.jupiter,
        adapter: jupiterAdapter,
        isInstalled: true
      };
      console.log('✅ Jupiter found via injection');
    }
  }

  if (win.trustwallet?.solana) {
    wallets.trustWallet = { name: 'Trust Wallet', icon: WALLET_ICONS.trustWallet, adapter: win.trustwallet.solana, isInstalled: true };
  }
  if (win.glow) {
    wallets.glow = { name: 'Glow', icon: WALLET_ICONS.glow, adapter: win.glow, isInstalled: true };
  }
  if (win.Slope) {
    wallets.slope = { name: 'Slope', icon: WALLET_ICONS.glow, adapter: win.Slope, isInstalled: true };
  }
  if (win.sollet) {
    wallets.sollet = { name: 'Sollet', icon: WALLET_ICONS.glow, adapter: win.sollet, isInstalled: true };
  }
  if (win.coin98?.sol) {
    wallets.coin98 = { name: 'Coin98', icon: WALLET_ICONS.coin98, adapter: win.coin98.sol, isInstalled: true };
  }
  if (win.magicEden?.solana?.isMagicEden) {
    wallets.magicEden = { name: 'Magic Eden', icon: WALLET_ICONS.magicEden, adapter: win.magicEden.solana, isInstalled: true };
  }

  // --- 2. PWA / MOBILE FALLBACKS (Deep Links) ---
  // On mobile browsers and PWA standalone mode, wallets aren't injected into window.
  // We add deep link adapters so users can tap to open their wallet app.
  // These get overridden by Wallet Standard detection in step 3 if the wallet is actually present.

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (inStandalonePWA || isMobile) {
    console.log('📱 Mobile/PWA detected. Adding Deep Links for missing wallets...');

    if (!wallets.phantom) {
      wallets.phantom = {
        name: 'Phantom',
        icon: WALLET_ICONS.phantom,
        adapter: {
          isDeeplink: true,
          connect: async () => {
            console.log('🔗 Connecting to Phantom via deeplink...');
            const url = buildPhantomConnectUrl('devnet');
            window.location.href = url;
            return new Promise((resolve) => {
              (window as any).__phantomConnectResolve = resolve;
            });
          },
          disconnect: async () => { console.log('Disconnecting Phantom deeplink'); }
        },
        isInstalled: true,
        isDeeplink: true
      };
      console.log('✅ Phantom deeplink adapter created for standalone PWA mode');
    }

    if (!wallets.solflare) {
      wallets.solflare = {
        name: 'Solflare',
        icon: WALLET_ICONS.solflare,
        adapter: createDeepLinkAdapter('Solflare', () => buildSolflareConnectUrl('devnet')),
        isInstalled: true,
        isDeeplink: true
      };
      console.log('✅ Solflare deeplink adapter created for standalone PWA mode');
    }

    if (!wallets.backpack) {
      wallets.backpack = {
        name: 'Backpack',
        icon: WALLET_ICONS.backpack,
        adapter: {
          isDeeplink: true,
          connect: async () => {
            console.log('🔗 Connecting to Backpack via deeplink...');
            const url = buildBackpackConnectUrl('devnet');
            window.location.href = url;
            return new Promise(() => {});
          },
          disconnect: async () => { console.log('Disconnecting Backpack deeplink'); }
        },
        isInstalled: true,
        isDeeplink: true
      };
      console.log('✅ Backpack deeplink adapter created for mobile/PWA mode');
    }
  }

  // --- 3. WALLET STANDARD DETECTION (Seeker, etc.) ---
  // Runs AFTER PWA checks so real wallets detected via Standard can override deep link placeholders.

  try {
    const { get: getRegisteredWallets } = getWallets();
    const registeredWallets = getRegisteredWallets();

    console.log(`🔌 Wallet Standard: found ${registeredWallets.length} registered wallet(s)`);

    for (const standardWallet of registeredWallets) {
      const features = Object.keys(standardWallet.features || {});
      const hasSolanaConnect = features.some(f => f.includes('solana:') || f.includes('standard:connect'));

      if (!hasSolanaConnect) continue;

      const walletName = standardWallet.name;
      const normalizedKey = walletName.toLowerCase().replace(/\s+/g, '');

      let walletKey = normalizedKey;
      if (normalizedKey.includes('phantom')) walletKey = 'phantom';
      else if (normalizedKey.includes('solflare')) walletKey = 'solflare';
      else if (normalizedKey.includes('backpack')) walletKey = 'backpack';
      else if (normalizedKey.includes('seeker') || normalizedKey.includes('solanamobile') || normalizedKey.includes('saga')) walletKey = 'seeker';
      else if (normalizedKey.includes('glow')) walletKey = 'glow';
      else if (normalizedKey.includes('magiceden')) walletKey = 'magicEden';
      else if (normalizedKey.includes('jupiter')) walletKey = 'jupiter';

      const existing = wallets[walletKey];

      if (existing && !existing.isDeeplink) {
        console.log(`⏭️ Wallet Standard: skipping "${walletName}" (already detected via injection)`);
        continue;
      }

      const standardAdapter = createWalletStandardAdapter(standardWallet);

      const iconUrl = (standardWallet.icon as string) || WALLET_ICONS[walletKey] || WALLET_ICONS.glow;

      wallets[walletKey] = {
        name: walletName,
        icon: iconUrl,
        adapter: standardAdapter,
        isInstalled: true
      };

      console.log(`✅ Wallet Standard: Registered "${walletName}" as ${walletKey} (overwrote deeplink: ${!!existing?.isDeeplink})`);
    }
  } catch (err) {
    console.warn('⚠️ Wallet Standard detection failed:', err);
  }

  return wallets;
}

function createWalletStandardAdapter(standardWallet: Wallet) {
  let connectedAccount: any = null;

  const adapter = {
    isWalletStandard: true,
    _standardWallet: standardWallet,

    get publicKey() {
      if (connectedAccount?.address) {
        try {
          const addr = address(connectedAccount.address);
          return { toString: () => addr, toBase58: () => addr };
        } catch {
          return null;
        }
      }
      if (standardWallet.accounts && standardWallet.accounts.length > 0) {
        try {
          const addr = address(standardWallet.accounts[0].address);
          return { toString: () => addr, toBase58: () => addr };
        } catch {
          return null;
        }
      }
      return null;
    },

    connect: async (options?: any) => {
      const connectFeature = (standardWallet.features as any)['standard:connect'];
      if (!connectFeature?.connect) {
        throw new Error(`${standardWallet.name} does not support standard:connect`);
      }

      const result = await connectFeature.connect();
      const accounts = result?.accounts || standardWallet.accounts || [];

      if (accounts.length > 0) {
        connectedAccount = accounts[0];
        const addr = address(accounts[0].address);
        return { publicKey: { toString: () => addr, toBase58: () => addr } };
      }

      throw new Error(`${standardWallet.name} connected but no accounts found`);
    },

    disconnect: async () => {
      const disconnectFeature = (standardWallet.features as any)['standard:disconnect'];
      if (disconnectFeature?.disconnect) {
        await disconnectFeature.disconnect();
      }
      connectedAccount = null;
    },

    signTransaction: async (transaction: any) => {
      const signFeature = (standardWallet.features as any)['solana:signTransaction'];
      if (!signFeature?.signTransaction) {
        throw new Error(`${standardWallet.name} does not support solana:signTransaction`);
      }
      return signFeature.signTransaction(transaction);
    },

    signAllTransactions: async (transactions: any[]) => {
      const signFeature = (standardWallet.features as any)['solana:signAllTransactions'];
      if (signFeature?.signAllTransactions) {
        return signFeature.signAllTransactions(transactions);
      }
      return Promise.all(transactions.map((tx: any) => adapter.signTransaction(tx)));
    },

    signMessage: async (message: Uint8Array) => {
      const signMessageFeature = (standardWallet.features as any)['solana:signMessage'];
      if (!signMessageFeature?.signMessage) {
        throw new Error(`${standardWallet.name} does not support solana:signMessage`);
      }
      const result = await signMessageFeature.signMessage({ message, account: connectedAccount || standardWallet.accounts[0] });
      return result[0]?.signature || result?.signature || result;
    }
  };

  return adapter;
}

export function listenForNewWallets(onUpdate: (wallets: DetectedWallets) => void): () => void {
  try {
    const { on } = getWallets();
    const unsubscribe = on('register', () => {
      console.log('🔌 New wallet registered via Wallet Standard, re-detecting...');
      const updated = detectSolanaWallets();
      onUpdate(updated);
    });
    return unsubscribe;
  } catch (err) {
    console.warn('⚠️ Could not listen for wallet registrations:', err);
    return () => {};
  }
}

export function getAvailableWallets(): string[] {
  const wallets = detectSolanaWallets();
  return Object.keys(wallets).filter(key => wallets[key]?.isInstalled);
}

export function hasAnyWallet(): boolean {
  return getAvailableWallets().length > 0;
}

export function getPreferredWallet(detectedWallets?: DetectedWallets): SolanaWalletProvider | null {
  const wallets = detectedWallets ?? detectSolanaWallets();

  if (wallets.phantom) return wallets.phantom;
  if (wallets.solflare) return wallets.solflare;
  if (wallets.magicEden) return wallets.magicEden;
  if (wallets.jupiter) return wallets.jupiter;
  if (wallets.backpack) return wallets.backpack;
  if (wallets.glow) return wallets.glow;
  if (wallets.trustWallet) return wallets.trustWallet;

  const availableWallets = Object.values(wallets).filter(w => w?.isInstalled);
  return availableWallets[0] || null;
}

export async function connectToWallet(walletName: string): Promise<{
  publicKey: string;
  provider: any;
} | null> {
  const wallets = detectSolanaWallets();
  const wallet = wallets[walletName];

  if (!wallet || !wallet.isInstalled) {
    console.error(`Wallet ${walletName} is not installed`);
    return null;
  }

  try {
    console.log(`🔌 Attempting to connect to ${wallet.name}...`);

    if (wallet.isDeeplink) {
      await wallet.adapter.connect();

      if (walletName === 'phantom') {
        return new Promise((resolve) => {
          const checkCallback = setInterval(() => {
            const callback = parsePhantomCallback();
            if (callback) {
              clearInterval(checkCallback);
              resolve({ publicKey: callback.publicKey, provider: wallet.adapter });
            }
          }, 500);
          setTimeout(() => { clearInterval(checkCallback); resolve(null); }, 120000);
        });
      }

      return null;
    }

    let response;

    if (walletName === 'solflare') {
      try {
        response = await wallet.adapter.connect({ onlyIfTrusted: false });
      } catch (err: any) {
        console.log('Solflare standard connect failed, trying alternative method...', err);
        if (wallet.adapter.connect) {
          response = await wallet.adapter.connect();
        } else {
          throw err;
        }
      }
    } else {
      response = await wallet.adapter.connect({ onlyIfTrusted: false });
    }

    console.log(`✅ Successfully connected to ${wallet.name}`);

    return {
      publicKey: response.publicKey.toString(),
      provider: wallet.adapter
    };
  } catch (error: any) {
    console.error(`❌ Failed to connect to ${wallet.name}:`, error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    return null;
  }
}

export async function disconnectWallet(provider: any): Promise<void> {
  if (provider && typeof provider.disconnect === 'function') {
    await provider.disconnect();
  }
}
