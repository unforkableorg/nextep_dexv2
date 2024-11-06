import React from 'react'
import styled from 'styled-components'
import { Send, Sun, Moon } from 'react-feather'
import { useDarkModeManager } from '../../state/user/hooks'

import { ButtonSecondary } from '../Button'
import { useTokenPrices } from '../../state/application/hooks'
import { Text } from 'rebass'

const FooterFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 1rem;
  width: 100%;
  padding: 1rem;
  background: ${({ theme }) => theme.bg1};
`

export default function Footer() {

  const prices = useTokenPrices();

  const cxsPrice : number = prices['CXS']? prices['CXS'] : 0;
  const nextepPrice : number = prices['NEXTEP']? prices['NEXTEP'] : 0;
  const nextepPricePretty = "$" + nextepPrice.toLocaleString('fr', {maximumFractionDigits: 8});
    
  const cxsPricePretty = prices['CXS']? "$" + prices['CXS'].toLocaleString('fr', {maximumFractionDigits: 4}) : "?";


  return (
    <FooterFrame>
        <Text px="0.5rem">CXS: {cxsPricePretty} NEXTEP: {nextepPricePretty}</Text>
    </FooterFrame>
  )
}
