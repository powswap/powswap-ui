import { AutoColumn } from 'components/Column'
import { CardBGImage, CardSection, DataCard } from 'components/earn/styled'
import { RowBetween } from 'components/Row'
import { usePowBarStats } from 'state/single-stake/hooks'
import styled from 'styled-components/macro'

import { ThemedText } from '../../theme'

const Card = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #888d9b 0%, #33ffa7c2 100%);
`

const MediumHeaderWhite = styled(ThemedText.DeprecatedMediumHeader)`
  color: white;
`
const SubHeaderWhite = styled(ThemedText.DeprecatedSubHeader)`
  color: white;
`
const LargeHeaderWhite = styled(ThemedText.DeprecatedLargeHeader)`
  color: white;
`

export default function StakingAPRCard() {
  const { triToXTRIRatio } = usePowBarStats()
  //const apr = useFetchTriBarAPR()
  // @TODO Use this after prod APR is ready
  // const aprText = (
  //     <>
  //         <LargeHeaderWhite>
  //             {apr == null
  //                 ? 'Loading...'
  //                 : `${apr?.toFixed(2)}%`}
  //         </LargeHeaderWhite>
  //         <SubHeaderWhite>
  //             Yesterday's APR
  //         </SubHeaderWhite>
  //     </>
  // );
  const aprText = <LargeHeaderWhite>Coming Soon</LargeHeaderWhite>

  const triToXTRIRatioFormatted = triToXTRIRatio?.toFixed(6)
  const ratioText = triToXTRIRatioFormatted == null ? 'Loading...' : `1 POW = ${triToXTRIRatioFormatted} sPOW`

  return (
    <Card>
      <CardSection>
        <AutoColumn gap="md">
          <RowBetween>
            <AutoColumn gap="sm" justify="start">
              <MediumHeaderWhite fontWeight={600}>Staking APR</MediumHeaderWhite>
              <SubHeaderWhite>{ratioText}</SubHeaderWhite>
            </AutoColumn>
            <AutoColumn gap="sm" justify="end">
              {aprText}
            </AutoColumn>
          </RowBetween>
        </AutoColumn>
      </CardSection>
      <CardBGImage />
    </Card>
  )
}
