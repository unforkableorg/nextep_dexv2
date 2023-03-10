import { useMemo } from 'react'
import { WCXS, Token, TokenAmount, Trade, ChainId, Pair } from '@uniswap/sdk'
import { useActiveWeb3React } from './index'
import { usePair } from '../data/Reserves'

function useAllCommonPairs(tokenA?: Token, tokenB?: Token): Pair[] {
  const { chainId } = useActiveWeb3React()

  // check for direct pair between tokens
  const pairBetween = usePair(tokenA, tokenB)

  // get token<->WCXS pairs
  const aToETH = usePair(tokenA, WCXS[chainId as ChainId])
  const bToETH = usePair(tokenB, WCXS[chainId as ChainId])

  // only pass along valid pairs, non-duplicated pairs
  return useMemo(
    () =>
      [pairBetween, aToETH, bToETH]
        // filter out invalid pairs
        .filter((p): p is Pair => !!p)
        // filter out duplicated pairs
        .filter(
          (p, i, pairs) => i === pairs.findIndex(pair => pair?.liquidityToken.address === p.liquidityToken.address)
        ),
    [pairBetween, aToETH, bToETH]
  )
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(amountIn?: TokenAmount, tokenOut?: Token): Trade | null {
  const inputToken = amountIn?.token
  const outputToken = tokenOut

  const allowedPairs = useAllCommonPairs(inputToken, outputToken)
  console.log("allowed", allowedPairs)

  return useMemo(() => {
    if (amountIn && tokenOut && allowedPairs.length > 0) {
      return Trade.bestTradeExactIn(allowedPairs, amountIn, tokenOut)[0] ?? null
    }
    return null
  }, [allowedPairs, amountIn, tokenOut])
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(tokenIn?: Token, amountOut?: TokenAmount): Trade | null {
  const inputToken = tokenIn
  const outputToken = amountOut?.token

  const allowedPairs = useAllCommonPairs(inputToken, outputToken)

  return useMemo(() => {
    if (tokenIn && amountOut && allowedPairs.length > 0) {
      return Trade.bestTradeExactOut(allowedPairs, tokenIn, amountOut)[0] ?? null
    }
    return null
  }, [allowedPairs, tokenIn, amountOut])
}
