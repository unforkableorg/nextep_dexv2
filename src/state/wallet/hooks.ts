import { getAddress } from '@ethersproject/address'
import { ChainId, JSBI, Token, TokenAmount, WCXS } from '@uniswap/sdk'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAllTokens } from '../../hooks/Tokens'
import { useActiveWeb3React } from '../../hooks'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'
import {
  startListeningForBalance,
  startListeningForTokenBalances,
  stopListeningForBalance,
  stopListeningForTokenBalances,
  TokenBalanceListenerKey
} from './actions'
import { balanceKey } from './reducer'

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useETHBalances(uncheckedAddresses?: (string | undefined)[]): { [address: string]: JSBI | undefined } {
  const dispatch = useDispatch<AppDispatch>()
  const { chainId } = useActiveWeb3React()

  const addresses: string[] = useMemo(
    () =>
      uncheckedAddresses
        ? uncheckedAddresses
            .filter((a): a is string => isAddress(a) !== false)
            .map(getAddress)
            .sort()
        : [],
    [uncheckedAddresses]
  )

  // used so that we do a deep comparison in `useEffect`
  const serializedAddresses = JSON.stringify(addresses)

  // add the listeners on mount, remove them on dismount
  useEffect(() => {
    const addresses = JSON.parse(serializedAddresses)
    if (addresses.length === 0) return

    dispatch(startListeningForBalance({ addresses }))
    return () => {
      dispatch(stopListeningForBalance({ addresses }))
    }
  }, [serializedAddresses, dispatch])

  const rawBalanceMap = useSelector<AppState, AppState['wallet']['balances']>(({ wallet: { balances } }) => balances)

  return useMemo(() => {
    if (!chainId) return {}
    return addresses.reduce<{ [address: string]: JSBI }>((map, address) => {
      const key = balanceKey({ address, chainId })
      const { value } = rawBalanceMap[key] ?? {}
      if (value) {
        map[address] = JSBI.BigInt(value)
      }
      return map
    }, {})
  }, [chainId, addresses, rawBalanceMap])
}

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[]
): { [tokenAddress: string]: TokenAmount | undefined } {
  const dispatch = useDispatch<AppDispatch>()
  const { chainId } = useActiveWeb3React()

  const validTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens]
  )

  // used so that we do a deep comparison in `useEffect`
  const serializedCombos: string = useMemo(() => {
    return JSON.stringify(
      !address || validTokens.length === 0
        ? []
        : validTokens
            .map(t => t.address)
            .sort()
            .map(tokenAddress => ({ address, tokenAddress }))
    )
  }, [address, validTokens])

  // keep the listeners up to date
  useEffect(() => {
    const combos: TokenBalanceListenerKey[] = JSON.parse(serializedCombos)
    if (combos.length === 0) return

    dispatch(startListeningForTokenBalances(combos))
    return () => {
      dispatch(stopListeningForTokenBalances(combos))
    }
  }, [address, serializedCombos, dispatch])

  const rawBalanceMap = useSelector<AppState, AppState['wallet']['balances']>(({ wallet: { balances } }) => balances)

  return useMemo(() => {
    if (!address || validTokens.length === 0 || !chainId) {
      return {}
    }
    return (
      validTokens.reduce<{ [address: string]: TokenAmount }>((map, token) => {
        const key = balanceKey({ address, chainId, tokenAddress: token.address })
        const { value } = rawBalanceMap[key] ?? {}
        if (value) {
          map[token.address] = new TokenAmount(token, JSBI.BigInt(value))
        }
        return map
      }, {}) ?? {}
    )
  }, [address, validTokens, chainId, rawBalanceMap])
}

// contains the hacky logic to treat the WCXS token input as if it's CXS to
// maintain compatibility until we handle them separately.
export function useTokenBalancesTreatWCXSAsCXS(
  address?: string,
  tokens?: (Token | undefined)[]
): { [tokenAddress: string]: TokenAmount | undefined } {
  const { chainId } = useActiveWeb3React()
  const { tokensWithoutWCXS, includesWCXS } = useMemo(() => {
    if (!tokens || tokens.length === 0) {
      return { includesWCXS: false, tokensWithoutWCXS: [] }
    }
    let includesWCXS = false
    const tokensWithoutWCXS = tokens.filter(t => {
      if (!chainId) return true
      const wcxs = WCXS[chainId as ChainId]
      if(!wcxs) return true
      const isWCXS = t?.equals(wcxs) ?? false
      if (isWCXS) includesWCXS = true
      return !isWCXS
    })
    return { includesWCXS, tokensWithoutWCXS }
  }, [tokens, chainId])

  const balancesWithoutWCXS = useTokenBalances(address, tokensWithoutWCXS)
  const ETHBalance = useETHBalances(includesWCXS ? [address] : [])

  return useMemo(() => {
    if (!chainId || !address) return {}
    if (includesWCXS) {
      const wcxs = WCXS[chainId as ChainId]
      const ethBalance = ETHBalance[address]
      return {
        ...balancesWithoutWCXS,
        ...(ethBalance && wcxs ? { [wcxs.address]: new TokenAmount(wcxs, ethBalance) } : null)
      }
    } else {
      return balancesWithoutWCXS
    }
  }, [balancesWithoutWCXS, ETHBalance, includesWCXS, address, chainId])
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token): TokenAmount | undefined {
  const tokenBalances = useTokenBalances(account, [token])
  if (!token) return
  return tokenBalances[token.address]
}

// mimics the behavior of useAddressBalance
export function useTokenBalanceTreatingWCXSasCXS(account?: string, token?: Token): TokenAmount | undefined {
  const balances = useTokenBalancesTreatWCXSAsCXS(account, [token])
  if (!token) return
  return balances?.[token.address]
}

// mimics useAllBalances
export function useAllTokenBalancesTreatingWCXSasCXS(): {
  [account: string]: { [tokenAddress: string]: TokenAmount | undefined }
} {
  const { account } = useActiveWeb3React()
  const allTokens = useAllTokens()
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens])
  const balances = useTokenBalancesTreatWCXSAsCXS(account ?? undefined, allTokensArray)
  return account ? { [account]: balances } : {}
}
