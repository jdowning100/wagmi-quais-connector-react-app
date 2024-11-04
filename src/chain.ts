import { type Chain } from 'viem'

export const Quai = {
  id: 9000,
  name: 'Quai Network',
  nativeCurrency: { name: 'Quai', symbol: 'QUAI', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.quai.network/cyprus1'] },
  },
  blockExplorers: {
    default: { name: 'QuaiScan', url: 'https://quaiscan.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14353601,
    },
  },
  sourceId: 9000,
  testnet: true,
} as const satisfies Chain