import { Trans } from '@lingui/macro'
import { PageName } from 'components/AmplitudeAnalytics/constants'
import { Trace } from 'components/AmplitudeAnalytics/Trace'
import styled, { useTheme } from 'styled-components/macro'

import { AutoColumn } from '../../components/Column'
import { CardBGImage, CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import { RowBetween } from '../../components/Row'
import { SwitchLocaleLink } from '../../components/SwitchLocaleLink'
import { ExternalLink, ThemedText } from '../../theme'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    padding: 0px 8px;
  `};
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.deprecated_text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export default function Stake() {
  const theme = useTheme()

  return (
    <Trace page={PageName.POOL_PAGE} shouldLogImpression>
      <>
        <PageWrapper>
          <VoteCard>
            <CardBGImage />
            <CardNoise />
            <CardSection>
              <AutoColumn gap="md">
                <RowBetween>
                  <ThemedText.DeprecatedWhite fontWeight={600}>
                    <Trans>Powswap Single Staking</Trans>
                  </ThemedText.DeprecatedWhite>
                </RowBetween>
                <RowBetween>
                  <ThemedText.DeprecatedWhite fontSize={14}>
                    <Trans>
                      With Powswap, 0.25% of trading fees go directly to the active liquidity providers, while the
                      remaining 0.05% get converted back to $POW (obviously through Powswap). Stake your POW tokens to
                      earn trading fees.
                    </Trans>
                  </ThemedText.DeprecatedWhite>
                </RowBetween>
                <ExternalLink
                  style={{ color: theme.deprecated_white, textDecoration: 'underline' }}
                  target="_blank"
                  href="https://docs.powswap.io/"
                >
                  <ThemedText.DeprecatedWhite fontSize={14}>
                    <Trans>Read more about POW</Trans>
                  </ThemedText.DeprecatedWhite>
                </ExternalLink>
              </AutoColumn>
            </CardSection>
            <CardBGImage />
            <CardNoise />
          </VoteCard>

          <AutoColumn gap="lg" justify="center">
            <AutoColumn gap="md" style={{ width: '100%' }}>
              <EmptyProposals>
                <ThemedText.DeprecatedBody color={theme.deprecated_text3} textAlign="center">
                  <Trans>Single Staking coming soon...</Trans>
                </ThemedText.DeprecatedBody>
              </EmptyProposals>
            </AutoColumn>
          </AutoColumn>
        </PageWrapper>
        <SwitchLocaleLink />
      </>
    </Trace>
  )
}
