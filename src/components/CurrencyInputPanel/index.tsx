import { Pair, Token } from '@uniswap/sdk'
import React, { useState, useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import '@reach/tooltip/styles.css'
import { darken } from 'polished'
import { Field } from '../../state/swap/actions'
import { useTokenBalanceTreatingWCXSasCXS } from '../../state/wallet/hooks'

import TokenLogo from '../TokenLogo'
import DoubleLogo from '../DoubleLogo'
import SearchModal from '../SearchModal'
import { RowBetween } from '../Row'
import { TYPE, CursorPointer } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'

import { useActiveWeb3React } from '../../hooks'
import { useTranslation } from 'react-i18next'
import { useTokenPricesLocal } from '../../state/application/hooks'

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`

const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  height: 2.2rem;
  font-size: 20px;
  font-weight: 500;
  background-color: rgba(128, 115, 150, 0.9);
  border-radius: 8px;
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 0.5rem;
  transition: background-color 350ms;

  :focus,
  :hover {
    background-color: rgb(28, 15, 50);
  }
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
  height: 20px;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  background-color: ${({ theme }) => theme.bg2};
  z-index: 1;
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.bg2};
  background-color: white;
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};

`

const StyledBalanceMax = styled.button`
  height: 28px;
  background-color: ${({ theme }) => theme.primary5};
  border: 1px solid ${({ theme }) => theme.primary5};
  border-radius: 0rem;
  font-size: 0.875rem;

  font-weight: 500;
  cursor: pointer;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.primaryText1};
  :hover {
    border: 1px solid ${({ theme }) => theme.primary1};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`

interface CurrencyInputPanelProps {
  value: string
  field: string
  onUserInput: (field: string, val: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  urlAddedTokens?: Token[]
  onTokenSelection?: (tokenAddress: string) => void
  token?: Token | null
  disableTokenSelect?: boolean
  hideBalance?: boolean
  isExchange?: boolean
  pair?: Pair | null
  hideInput?: boolean
  showSendWithSwap?: boolean
  otherSelectedTokenAddress?: string | null
  id: string
}

export default function CurrencyInputPanel({
  value,
  field,
  onUserInput,
  onMax,
  showMaxButton,
  label = 'Input',
  urlAddedTokens = [], // used
  onTokenSelection = null,
  token = null,
  disableTokenSelect = false,
  hideBalance = false,
  isExchange = false,
  pair = null, // used for double token logo
  hideInput = false,
  showSendWithSwap = false,
  otherSelectedTokenAddress = null,
  id
}: CurrencyInputPanelProps) {
  const { t } = useTranslation()

  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const userTokenBalance = useTokenBalanceTreatingWCXSasCXS(account, token)
  const theme = useContext(ThemeContext)
  const { tokenPrices } = useTokenPricesLocal();

  let totalValue = null;
  if(token && token.symbol) {
    if(tokenPrices && tokenPrices[token.symbol] && value != "")
      totalValue = (tokenPrices[token.symbol] * parseFloat(value)).toLocaleString("fr", {maximumFractionDigits: 2});
  }

  return (
    <InputPanel id={id}>
      <Container hideInput={hideInput}>
        {!hideInput && (
          <LabelRow>
            <RowBetween>
              <TYPE.body color={"rgb(28, 15, 50)"} fontWeight={500} fontSize={14}>
                {label}
              </TYPE.body>
              {account && (
                <CursorPointer>
                  <TYPE.body
                    onClick={onMax}
                    color={theme.text2}
                    fontWeight={500}
                    fontSize={14}
                    style={{ display: 'inline' }}
                  >
                    {!hideBalance && !!token && userTokenBalance
                      ? 'Balance: ' + userTokenBalance?.toSignificant(6)
                      : ' -'}
                  </TYPE.body>
                </CursorPointer>
              )}
            </RowBetween>
          </LabelRow>
        )}
        <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={disableTokenSelect}>
          {!hideInput && (
            <>
              <NumericalInput
                className="token-amount-input"
                value={value}
                onUserInput={val => {
                  onUserInput(field, val)
                }}
              />
              {account && !!token?.address && showMaxButton && label !== 'To' && (
                <StyledBalanceMax onClick={onMax}>MAX</StyledBalanceMax>
              )}
            </>
          )}
          <CurrencySelect
            selected={!!token}
            className="open-currency-select-button"
            onClick={() => {
              if (!disableTokenSelect) {
                setModalOpen(true)
              }
            }}
          >
            <Aligner>
              {isExchange ? (
                <DoubleLogo a0={pair?.token0.address} a1={pair?.token1.address} size={24} margin={true} />
              ) : token?.address ? (
                <TokenLogo address={token?.address} size={'24px'} />
              ) : null}
              {isExchange ? (
                <StyledTokenName className="pair-name-container">
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </StyledTokenName>
              ) : (
                <StyledTokenName className="token-symbol-container" active={Boolean(token && token.symbol)}>
                  {(token && token.symbol && token.symbol.length > 20
                    ? token.symbol.slice(0, 4) +
                      '...' +
                      token.symbol.slice(token.symbol.length - 5, token.symbol.length)
                    : token?.symbol) || t('selectToken')}
                </StyledTokenName>
              )}
              {!disableTokenSelect && <StyledDropDown selected={!!token?.address} />}
            </Aligner>
          </CurrencySelect>
        </InputRow>
        {totalValue && <label>${totalValue}</label>}
      </Container>
      {!disableTokenSelect && (
        <SearchModal
          isOpen={modalOpen}
          onDismiss={() => {
            setModalOpen(false)
          }}
          filterType="tokens"
          urlAddedTokens={urlAddedTokens}
          onTokenSelect={onTokenSelection}
          showSendWithSwap={showSendWithSwap}
          hiddenToken={token?.address}
          otherSelectedTokenAddress={otherSelectedTokenAddress}
          otherSelectedText={field === Field.INPUT ? 'Selected as output' : 'Selected as input'}
        />
      )}
    </InputPanel>
  )
}
