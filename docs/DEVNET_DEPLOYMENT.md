# Spektrum Devnet Deployment Checklist

This document outlines the steps required to deploy Spektrum to Solana Devnet with MagicBlock Ephemeral Rollups (ER) integration for the on-chain gacha system.

---

## Prerequisites

- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (`solana --version`)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) (`anchor --version` — requires Anchor 0.30.1 via `avm use 0.30.1`)
- [Node.js 20+](https://nodejs.org/)
- A funded devnet wallet (use `solana airdrop 2` to get devnet SOL)
- [Helius API key](https://helius.dev/) (optional but recommended for reliable RPC)

---

## Step 1: Configure Solana CLI for Devnet

```bash
solana config set --url devnet
solana config set --keypair ~/.config/solana/id.json
solana balance  # verify wallet has SOL
```

---

## Step 2: Build the Anchor Program

Run this from your **local machine** (Anchor CLI is not available in the Replit environment):

```bash
cd programs/gacha
anchor build
```

This generates:
- `target/deploy/spektrum_gacha.so` — compiled program binary
- `target/idl/spektrum_gacha.json` — auto-generated IDL (cross-check with `client/src/blockchain/magicblock/idl/spektrumGacha.ts`)

> **Note:** The `magicblock-engine` crate in `Cargo.toml` must be resolvable on crates.io or a local path.
> If it fails, replace with a path dependency: `magicblock-engine = { path = "../../vendor/magicblock-engine", features = ["delegation"] }`

---

## Step 3: Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

Copy the printed **Program ID** — you will need it in the next step.

---

## Step 4: Update Program ID

1. In the Replit **Secrets / Env Vars** panel, update:
   ```
   VITE_GACHA_PROGRAM_ID = <YOUR_DEPLOYED_PROGRAM_ID>
   ```

2. Also update `Anchor.toml` line `spektrum_gacha = "GACHA..."` with the real ID.

3. Update `programs/gacha/src/lib.rs` line `declare_id!(...)` with the real ID.

4. Update `client/src/blockchain/magicblock/idl/spektrumGacha.ts` — when you run `anchor build`, a JSON IDL is generated. If the IDL shape changed, regenerate the TypeScript types from it.

---

## Step 5: Set Environment Variables

Confirm these are set in Replit Secrets / Env Vars:

```env
VITE_SOLANA_NETWORK=devnet
VITE_HELIUS_DEVNET_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
VITE_TREASURY_WALLET=YOUR_TREASURY_WALLET_PUBKEY
VITE_GACHA_PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID
```

The `ERClient` automatically uses devnet ER endpoints when `VITE_SOLANA_NETWORK=devnet`.

---

## Step 6: Initialize the CardPool on Devnet

After deployment, the `CardPool` PDA must be seeded with GENESIS card data from the database. This is a **one-time admin operation**:

```bash
# From the repo root (Replit terminal or local):
npm run init-card-pool
```

The script (`scripts/initializeCardPool.ts`) will:
1. Connect to devnet via `VITE_HELIUS_DEVNET_URL`
2. Load the admin wallet from `~/.config/solana/id.json` (or `ADMIN_KEYPAIR_PATH`)
3. Query the PostgreSQL database for all GENESIS cards + their rarities
4. Call `initialize_card_pool` on-chain to create the `CardPool` PDA
5. Print the PDA address on success

If the CardPool already exists, the script exits safely without making changes.

---

## Step 7: Test the On-Chain Gacha Flow

1. Connect Phantom wallet set to **devnet** network
2. Navigate to Shop → Booster Packs
3. Purchase a pack using devnet SOL
4. The client will:
   - Call `initialize_pack` on Solana to create the BoosterPack PDA
   - Delegate the PDA to the MagicBlock ER validator
   - Call `delegate_and_open` on the ER to set the VRF seed
   - Call `reveal_card` on the ER for each of the 5 slots (gasless, sub-10ms)
   - Call `finalize_session` on the ER to commit state back to Solana
5. Verify cards appear in your collection

---

## SOL Pricing (Devnet)

| Item | Devnet SOL Price |
|------|-----------------|
| Beginner Booster | 0.01 SOL |
| Advanced Booster | 0.03 SOL |
| Expert Booster | 0.05 SOL |
| Premade Deck | 0.05 SOL |

Treasury wallet receives all SOL payments. Set `VITE_TREASURY_WALLET` to your treasury address.

---

## Key Files

| File | Purpose |
|------|---------|
| `Anchor.toml` | Workspace config for anchor build/deploy |
| `programs/gacha/src/lib.rs` | Program entrypoints |
| `programs/gacha/src/instructions/initialize_pack.rs` | Pack creation (uses client nonce for PDA) |
| `programs/gacha/src/instructions/initialize_card_pool.rs` | Card pool setup (admin) |
| `programs/gacha/src/instructions/delegate_and_open.rs` | VRF seed + delegation marker |
| `programs/gacha/src/instructions/reveal_card.rs` | Per-slot VRF reveal (runs on ER) |
| `programs/gacha/src/instructions/finalize_session.rs` | Commit + close (runs on ER) |
| `client/src/blockchain/magicblock/constants.ts` | Program IDs, ER validator addresses |
| `client/src/blockchain/magicblock/erClient.ts` | ER connection management |
| `client/src/blockchain/magicblock/gachaSession.ts` | Full on-chain transaction builder |
| `client/src/blockchain/magicblock/vrfListener.ts` | VRF seed generation (client-side for devnet) |
| `client/src/blockchain/magicblock/idl/spektrumGacha.ts` | TypeScript IDL |
| `scripts/initializeCardPool.ts` | One-time CardPool seeding script |

---

## MagicBlock ER Devnet Endpoints

| Region | RPC | WebSocket |
|--------|-----|-----------|
| US | `https://devnet-us.magicblock.app` | `wss://devnet-us.magicblock.app` |
| EU | `https://devnet-eu.magicblock.app` | `wss://devnet-eu.magicblock.app` |
| Asia | `https://devnet-as.magicblock.app` | `wss://devnet-as.magicblock.app` |

---

## Architecture Notes

**PDA Derivation (BoosterPack):**
```
seeds = ["booster_pack", ownerPublicKey, packNonce_u64_le]
```
The client generates `packNonce` as a random `u64` before sending `initialize_pack`.
This allows the client to compute the PDA address without waiting for Clock state.

**Delegation Model:**
MagicBlock uses external delegation — the client calls `createDelegateInstruction` from
`@magicblock-labs/ephemeral-rollups-sdk` to delegate the account. The Anchor program
itself does not CPI into the delegation program.

**ER Transaction Routing:**
- `initialize_pack` → Solana mainnet/devnet RPC
- Delegation tx → Solana mainnet/devnet RPC
- `delegate_and_open` → ER connection (devnet-us.magicblock.app)
- `reveal_card` (x5) → ER connection (gasless)
- `finalize_session` → ER connection

---

## Status

- [x] Anchor.toml workspace configuration
- [x] BoosterPack PDA uses client nonce (not Clock timestamp)
- [x] `initialize_pack` instruction
- [x] `initialize_card_pool` instruction (with `update_card_pool`)
- [x] `delegate_and_open` instruction
- [x] `reveal_card` instruction (rarity floor enforcement + VRF)
- [x] `finalize_session` instruction
- [x] ER client code (`erClient.ts`) — devnet endpoints configured
- [x] Gacha session lifecycle (`gachaSession.ts`) — real Anchor transactions
- [x] Wallet adapter wiring (`useOnChainGachaStore.ts`)
- [x] VRF listener (`vrfListener.ts`) — client-side seed for devnet
- [x] IDL types (`idl/spektrumGacha.ts`) — complete
- [x] SOL payment flow in shop — devnet transactions
- [x] `VITE_GACHA_PROGRAM_ID` env var set (placeholder — update after deploy)
- [x] `VITE_SOLANA_NETWORK=devnet` env var set
- [x] CardPool initialization script (`scripts/initializeCardPool.ts`)
- [ ] Anchor program compiled (`anchor build` — run from local machine)
- [ ] Anchor program deployed (`anchor deploy --provider.cluster devnet`)
- [ ] `VITE_GACHA_PROGRAM_ID` updated with real deployed program ID
- [ ] `initialize_card_pool` called via `npm run init-card-pool`
