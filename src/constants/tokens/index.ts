import { ChainId, Token, WCXS } from '@uniswap/sdk'

import MAINNET_TOKENS from './mainnet'
import TESTNET_TOKENS from './testnet'

type AllTokens = Readonly<{ [chainId in ChainId]: Readonly<{ [tokenAddress: string]: Token }> }>
export const ALL_TOKENS: AllTokens = [
  // WCXS on all chains
  ...Object.values(WCXS),
  // chain-specific tokens
  ...MAINNET_TOKENS,
  ...TESTNET_TOKENS
]
  // remap WCXS to CXS
  .map(token => {
    if (token.equals(WCXS[token.chainId])) {
      ;(token as any).symbol = 'CXS'
      ;(token as any).name = 'CXS'
    }
    return token
  })
  // put into an object
  .reduce<AllTokens>(
    (tokenMap, token) => {
      if (tokenMap[token.chainId][token.address] !== undefined) throw Error('Duplicate tokens.')
      return {
        ...tokenMap,
        [token.chainId]: {
          ...tokenMap[token.chainId],
          [token.address]: token
        }
      }
    },
    {
      [ChainId.MAINNET]: {},
      [ChainId.TESTNET]: {}
    }
  )
