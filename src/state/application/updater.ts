import { useEffect, useState } from 'react'
import { useDebounce, useActiveWeb3React } from '../../hooks'
import { updateBlockNumber, updatePrices } from './actions'
import { useDispatch } from 'react-redux'
import { usePair } from '../../data/Reserves'
import { Token } from '@uniswap/sdk'
import { useTokenPrices } from './hooks'

export default function Updater() {
  const { library, chainId } = useActiveWeb3React()
  const dispatch = useDispatch()
  const tokenPrices = useTokenPrices();

  const [maxBlockNumber, setMaxBlockNumber] = useState<number | null>(null)
  const pairBetween = usePair(new Token(chainId? chainId: 785,"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18, "CXS", "CXS" ), new Token(chainId? chainId: 785, "0x432E4997060F2385Bdb32cDc8Be815C6b22a8a61", 18, "NEXTEP", "NEXTEP"))
  // because blocks arrive in bunches with longer polling periods, we just want
  // to process the latest one.
  const debouncedMaxBlockNumber = useDebounce<number | null>(maxBlockNumber, 100)

  // update block number
  useEffect(() => {
    if (!library || !chainId) return

    const blockListener = (blockNumber: number) => {
      setMaxBlockNumber(maxBlockNumber => {
        if (typeof maxBlockNumber !== 'number') return blockNumber
        return Math.max(maxBlockNumber, blockNumber)
      })
    }

    setMaxBlockNumber(null)

    library
      .getBlockNumber()
      .then(blockNumber => dispatch(updateBlockNumber({ chainId, blockNumber })))
      .catch(error => console.error(`Failed to get block number for chainId ${chainId}`, error))

    library.on('block', blockListener)
    return () => {
      library.removeListener('block', blockListener)
    }
  }, [dispatch, chainId, library])

  useEffect(() => {
    if (!chainId || !debouncedMaxBlockNumber) return
    dispatch(updateBlockNumber({ chainId, blockNumber: debouncedMaxBlockNumber }))
  }, [chainId, debouncedMaxBlockNumber, dispatch])

  // update CXS price
  useEffect(() => {
    if (!chainId) return
    fetch('https://yls75hawkfxwckvlyzeczup4zq0myxer.lambda-url.us-east-1.on.aws/')
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      if(json.result) {
        dispatch(updatePrices({ symbol: 'CXS', value: parseFloat(json.data[0].ticker.latest) }));
      }
    });
  }, [dispatch, chainId, pairBetween])

  // update NEXTEP price based on CXS price
  useEffect(() => {
    if (!chainId || !pairBetween || !tokenPrices['CXS']) return
    const price = parseFloat(pairBetween.reserve1.toExact()) / parseFloat(pairBetween.reserve0.toExact()) * tokenPrices['CXS'];
    dispatch(updatePrices({ symbol: 'NEXTEP', value: price }));
  }, [dispatch, chainId, pairBetween, tokenPrices])

  return null
}
