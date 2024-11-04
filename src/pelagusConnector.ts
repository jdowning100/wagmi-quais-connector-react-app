// pelagusConnector.ts

import { createConnector } from '@wagmi/core';
import { createConfig, http } from '@wagmi/core';
import { quais } from 'quais';
import { Quai } from './chain';
import { AbstractProvider, Eip1193Provider } from 'quais';
export type PelagusConnectorParameters = {};



declare global {
  interface Window {
    pelagus?: Eip1193Provider & AbstractProvider;
  }
}

export const wagmiConfig = createConfig({
    connectors: [pelagusConnector()],
    chains: [Quai],
    transports: { 
        [Quai.id]: http("https://rpc.quai.network/cyprus1"), 
    },
  });

export function pelagusConnector(parameters: PelagusConnectorParameters = {}) {
  return createConnector(
    ({ emitter }) => {
      // Create the provider using Quais and Pelagus
      const provider =
        typeof window !== 'undefined' && window.pelagus
          ? new quais.BrowserProvider(window.pelagus)
          : undefined;

      // Event handlers
      const onAccountsChanged = (accounts: string[]) => {
        emitter.emit('change', { accounts: accounts as `0x${string}`[] });
      };

      const onChainChanged = (chainIdHex: string) => {
        const chainId = parseInt(chainIdHex, 16);
        emitter.emit('change', { chainId });
      };

      const onDisconnect = () => {
        emitter.emit('disconnect');
      };

      // Setup event listeners
      const setupListeners = () => {
        if (!window.pelagus?.on) return;

        window.pelagus.on('accountsChanged', onAccountsChanged);
        window.pelagus.on('chainChanged', onChainChanged);
        window.pelagus.on('disconnect', onDisconnect);
      };

      // Remove event listeners
      const removeListeners = () => {
        if (!window.pelagus?.removeListener) return;

        window.pelagus.removeListener('accountsChanged', onAccountsChanged);
        window.pelagus.removeListener('chainChanged', onChainChanged);
        window.pelagus.removeListener('disconnect', onDisconnect);
      };

      // Methods
      const connect = async (config?: { chainId?: number; isReconnecting?: boolean }) => {
        if (!provider) throw new Error('Pelagus wallet not found');

        // Get accounts using provider.send
        const accounts: string[] = await provider.send('requestAccounts', []);
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found');
        }

        // Get chain ID
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        // Set up event listeners
        setupListeners();

        emitter.emit('connect', { chainId, accounts: accounts as `0x${string}`[] });

        return {
          accounts: accounts as `0x${string}`[],
          chainId,
        };
      };

      const disconnect = async () => {
        // Pelagus might not support programmatic disconnect
        // Remove event listeners
        removeListeners();

        emitter.emit('disconnect');
      };

      const getAccount = async () => {
        if (!provider) throw new Error('Pelagus wallet not found');
        const accounts: string[] = await provider.send('quai_accounts', []);
        return accounts[0];
      };

      const getAccounts = async () => {
        if (!provider) throw new Error('Pelagus wallet not found');
        const accounts: string[] = await provider.send('quai_accounts', []);
        return accounts as `0x${string}`[];
      };

      const getChainId = async () => {
        if (!provider) throw new Error('Pelagus wallet not found');
        const network = await provider.getNetwork();
        return Number(network.chainId);
      };

      const getProvider = async () => {
        return provider;
      };

      const isAuthorized = async () => {
        if (!provider) return false;
        try {
          const accounts: string[] = await provider.send('quai_accounts', []);
          return accounts && accounts.length > 0;
        } catch {
          return false;
        }
      };
      return {
        id: 'pelagus',
        name: 'Pelagus',
        icon: '', // Optional icon URL
        type: 'pelagus',
        ready: typeof window !== 'undefined' && !!window.pelagus,
        connect,
        disconnect,
        getAccount,
        getAccounts,
        getChainId,
        getProvider,
        isAuthorized,
        // Events
        onAccountsChanged,
        onChainChanged,
        onDisconnect,
        setupListeners,
        removeListeners,
      };
    }
  );
}
