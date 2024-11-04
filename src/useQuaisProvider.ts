import { BrowserProvider, JsonRpcSigner } from 'quais'
import { useMemo } from 'react'
import type { Account, Chain, Client, Transport } from 'viem'
import { type Config, useConnectorClient } from 'wagmi'

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  if (!window.pelagus) {
    console.log("No pelagus provider found.")
    return;
  } else {
    return new BrowserProvider(window.pelagus);
  }
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useQuaisSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient<Config>({ chainId })
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client])
}