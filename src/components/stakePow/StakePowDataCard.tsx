import React from 'react'
import styled from 'styled-components/macro'

import { ThemedText } from '../../theme'
import { AutoColumn } from '../Column'
import { CardSection } from '../earn/styled'
import { RowBetween } from '../Row'

type Props = {
  children: React.ReactNode
  label: string
}

const DataColumn = styled(RowBetween)`
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
   flex-direction: row;
 `};
`

export const StyledDataCard = styled(AutoColumn)`
   border: 1px solid black
   border-radius: 12px;
   width: 100%;
   position: relative;
   overflow: hidden;
 `
export default function StakeTriDataCard({ children, label }: Props) {
  return (
    <DataColumn style={{ alignItems: 'baseline' }}>
      <StyledDataCard>
        <CardSection>
          <AutoColumn gap="md">
            <RowBetween>
              <ThemedText.DeprecatedBlack fontWeight={600}>{label}</ThemedText.DeprecatedBlack>
            </RowBetween>
            {children}
          </AutoColumn>
        </CardSection>
      </StyledDataCard>
    </DataColumn>
  )
}
