import { Pair, Trade } from '@powswap/sdk'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { isTradeBetter } from 'utils/isTradeBetter'

import { BETTER_TRADE_LESS_HOPS_THRESHOLD } from '../constants/misc'
import { useAllCurrencyCombinations } from './useAllCurrencyCombinations'
import { PairState, useV2Pairs } from './useV2Pairs'

function useAllCommonPairs(currencyA?: Currency, currencyB?: Currency): Pair[] {
  const allCurrencyCombinations = useAllCurrencyCombinations(currencyA, currencyB)

  const allPairs = useV2Pairs(allCurrencyCombinations)

  return useMemo(
    () =>
      Object.values(
        allPairs
          // filter out invalid pairs
          .filter((result): result is [PairState.EXISTS, Pair] => Boolean(result[1] !== null))
          .map(([, pair]) => pair)
      ),
    [allPairs]
  )
}

const MAX_HOPS = 3

function toInterfaceTrade(trade: Trade<Currency, Currency, TradeType.EXACT_INPUT | TradeType.EXACT_OUTPUT> | null): {
  state: TradeState
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
} {
  if (trade == null) return { state: TradeState.LOADING, trade: undefined }

  return {
    trade: new InterfaceTrade({
      v2Routes: [
        {
          routev2: trade.route,
          inputAmount: trade.inputAmount,
          outputAmount: trade.outputAmount,
        },
      ],
      v3Routes: [],
      tradeType: trade.tradeType,
    }),
    state: TradeState.VALID,
  }
}

/**
 * Returns the best v2 trade for a desired swap
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useBestV2Trade(
  tradeType: TradeType.EXACT_INPUT | TradeType.EXACT_OUTPUT,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency,
  { maxHops = MAX_HOPS } = {}
): {
  state: TradeState
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
} {
  const [currencyIn, currencyOut] = useMemo(
    () =>
      tradeType === TradeType.EXACT_INPUT
        ? [amountSpecified?.currency, otherCurrency]
        : [otherCurrency, amountSpecified?.currency],
    [tradeType, amountSpecified, otherCurrency]
  )
  const allowedPairs = useAllCommonPairs(currencyIn, currencyOut)

  console.log(allowedPairs)

  return useMemo(() => {
    if (amountSpecified && currencyIn && currencyOut && allowedPairs.length > 0) {
      if (maxHops === 1) {
        const options = { maxHops: 1, maxNumResults: 1 }
        if (tradeType === TradeType.EXACT_INPUT) {
          const amountIn = amountSpecified
          return toInterfaceTrade(Trade.bestTradeExactIn(allowedPairs, amountIn, currencyOut, options)[0] ?? null)
        } else {
          const amountOut = amountSpecified
          return toInterfaceTrade(Trade.bestTradeExactOut(allowedPairs, currencyIn, amountOut, options)[0] ?? null)
        }
      }

      // search through trades with varying hops, find best trade out of them
      let bestTradeSoFar: Trade<Currency, Currency, TradeType.EXACT_INPUT | TradeType.EXACT_OUTPUT> | null = null
      for (let i = 1; i <= maxHops; i++) {
        const options = { maxHops: i, maxNumResults: 1 }
        let currentTrade: Trade<Currency, Currency, TradeType.EXACT_INPUT | TradeType.EXACT_OUTPUT> | null

        if (tradeType === TradeType.EXACT_INPUT) {
          const amountIn = amountSpecified
          currentTrade = Trade.bestTradeExactIn(allowedPairs, amountIn, currencyOut, options)[0] ?? null
        } else {
          const amountOut = amountSpecified
          currentTrade = Trade.bestTradeExactOut(allowedPairs, currencyIn, amountOut, options)[0] ?? null
        }

        // if current trade is best yet, save it
        if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
          bestTradeSoFar = currentTrade
        }
      }
      return toInterfaceTrade(bestTradeSoFar)
    }

    return toInterfaceTrade(null)
  }, [tradeType, amountSpecified, currencyIn, currencyOut, allowedPairs, maxHops])
}
