import React from 'react'
import { Link as HistoryLink } from 'react-router-dom'

import styled from 'styled-components'
import { useTokenBalanceTreatingWCXSasCXS } from '../../state/wallet/hooks'

import Row from '../Row'
import Web3Status from '../Web3Status'

import { Text } from 'rebass'
import { WCXS, ChainId, Token } from '@uniswap/sdk'
import { isMobile } from 'react-device-detect'
import { YellowCard } from '../Card'
import { useActiveWeb3React } from '../../hooks'
import { useDarkModeManager } from '../../state/user/hooks'

import Logo from '../../assets/images/ICON-REVOPAID.png'
import Wordmark from '../../assets/images/LOGO-REVOPAID.png'
//import LogoDark from '../../assets/svg/logo_white.svg'
import WordmarkDark from '../../assets/images/LOGO-REVOPAID.png'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { useTokenPrices } from '../../state/application/hooks'
import { usePair } from '../../data/Reserves'
import { updatePrices } from '../../state/application/actions'
import { useDispatch } from 'react-redux'

const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  width: 100%;
  top: 0;
  position: absolute;
  background: white;
  border-bottom: 1px solid rgb(28, 15, 50);

  pointer-events: none;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 12px 0 0 0;
    width: calc(100%);
    position: relative;
  `};

  z-index: 2;
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
`

const Title = styled.div`
  display: flex;
  align-items: center;
  pointer-events: auto;

  :hover {
    cursor: pointer;
  }
`

const TitleText = styled(Row)`
  width: fit-content;
  white-space: nowrap;
  @media (max-width: 650px) {
    display: none;
  }
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 40px;
  white-space: nowrap;

  :focus {
    border: 1px solid blue;
  }
`

const TestnetWrapper = styled.div`
  white-space: nowrap;
  width: fit-content;
  margin-left: 10px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const NetworkCard = styled(YellowCard)`
  width: fit-content;
  margin-right: 10px;
  border-radius: 0px;
  padding: 8px 12px;
`

export default function Header() {
  const { account, chainId } = useActiveWeb3React()
  const dispatch = useDispatch();

  const userEthBalance = useTokenBalanceTreatingWCXSasCXS(account, WCXS[chainId])
  return (
    <HeaderFrame>
      <RowBetween padding="1rem">
        <HeaderElement>
          <Title>
            {isMobile && (
            <HistoryLink id="link" to="/">
              <img
                style={{ height: '30px', marginLeft: '4px', marginTop: '4px' }}
                src={Logo}
                alt="logo"
              />
            </HistoryLink>
            )}
            {!isMobile && (
              <TitleText>
                <HistoryLink id="link" to="/">
                  <img
                    style={{ height: '66px', marginLeft: '4px', marginTop: '4px' }}
                    src={Wordmark}
                    alt="logo"
                  />
                </HistoryLink>
              </TitleText>
            )}
          </Title>
          </HeaderElement>
        <HeaderElement>
          <TestnetWrapper>
            {!isMobile && chainId === ChainId.TESTNET && <NetworkCard>Testnet</NetworkCard>}
          </TestnetWrapper>
          <AccountElement active={!!account} style={
            { 
              pointerEvents: 'auto'
            }
            }>
            {account && userEthBalance ? (
              <Text style={{ flexShrink: 0 }} px="0.5rem" fontWeight={500}>
                {userEthBalance?.toSignificant(4)} CXS
              </Text>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement>
      </RowBetween>
    </HeaderFrame>
  )
}

