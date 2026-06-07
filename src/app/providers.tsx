"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        // Email/Google users get an embedded Solana wallet at first login, so
        // every account has a wallet address — the backend keys players on it.
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
        // Dashboard has external Solana wallet login (Phantom etc.) enabled;
        // the SDK doesn't bundle connectors, they must be passed explicitly.
        externalWallets: {
          solana: {
            // shouldAutoConnect default true makes Privy eager-reconnect every
            // wallet-standard wallet on load; MetaMask's adapter does this
            // "loudly" and pops a connect prompt without user action.
            connectors: toSolanaWalletConnectors({ shouldAutoConnect: false }),
          },
        },
        appearance: {
          theme: "dark",
          accentColor: "#f97316",
          walletChainType: "solana-only",
          // MetaMask registers itself as a Solana wallet-standard connector,
          // so solana-only no longer hides it. Pin the list explicitly.
          walletList: ["phantom", "solflare", "backpack"],
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-center" richColors />
      </QueryClientProvider>
    </PrivyProvider>
  )
}
