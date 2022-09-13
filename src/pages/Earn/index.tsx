import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { NavBarVariant, useNavBarFlag } from 'featureFlags/flags/navBar'
import styled, { useTheme } from 'styled-components/macro'

import { OutlineCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import PoolCard from '../../components/earn/PoolCard'
import { CardBGImage, CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import Loader from '../../components/Loader'
import { RowBetween } from '../../components/Row'
import { useStakingInfoV2 } from '../../state/stake/hooks'
import { ExternalLink, ThemedText } from '../../theme'
import { Countdown } from './Countdown'

const PageWrapper = styled(AutoColumn)<{ navBarFlag: boolean }>`
  padding: ${({ navBarFlag }) => (navBarFlag ? '68px 8px 0px' : '0px')};
  max-width: 640px;
  width: 100%;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding: ${({ navBarFlag }) => (navBarFlag ? '48px 8px 0px' : '0px 8px 0px')};
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: ${({ navBarFlag }) => (navBarFlag ? '20px' : '0px')};
  }
`

const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`

const DataRow = styled(RowBetween)`
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
flex-direction: column;
`};
`

export default function Earn() {
  const navBarFlag = useNavBarFlag()
  const navBarFlagEnabled = navBarFlag === NavBarVariant.Enabled
  const theme = useTheme()
  const { chainId } = useWeb3React()

  // staking info for connected account
  const stakingInfos = useStakingInfoV2()
  //const infoV2 = useStakingInfoV2()
  //console.log(infoV2)

  // toggle copy if rewards are inactive
  // const stakingRewardsExist = Boolean(typeof chainId === 'number' && (STAKING_REWARDS_INFO[chainId]?.length ?? 0) > 0)
  const stakingRewardsExist = true

  return (
    <PageWrapper gap="lg" justify="center" navBarFlag={navBarFlagEnabled}>
      <TopSection gap="md">
        <DataCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <ThemedText.DeprecatedWhite fontWeight={600}>
                  <Trans>Powswap liquidity mining</Trans>
                </ThemedText.DeprecatedWhite>
              </RowBetween>
              <RowBetween>
                <ThemedText.DeprecatedWhite fontSize={14}>
                  <Trans>
                    Deposit your Liquidity Provider tokens to receive POW, the POW!Swap protocol governance token.
                  </Trans>
                </ThemedText.DeprecatedWhite>
              </RowBetween>{' '}
              <ExternalLink
                style={{ color: theme.deprecated_white, textDecoration: 'underline' }}
                href="https://docs.powswap.org"
                target="_blank"
              >
                <ThemedText.DeprecatedWhite fontSize={14}>
                  <Trans>Read more about POW</Trans>
                </ThemedText.DeprecatedWhite>
              </ExternalLink>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </DataCard>
      </TopSection>

      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        <DataRow style={{ alignItems: 'baseline' }}>
          <ThemedText.DeprecatedMediumHeader style={{ marginTop: '0.5rem' }}>
            <Trans>Participating pools</Trans>
          </ThemedText.DeprecatedMediumHeader>
          <Countdown exactEnd={stakingInfos?.[0]?.periodFinish} />
        </DataRow>

        <PoolSection>
          {stakingRewardsExist && stakingInfos?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : !stakingRewardsExist || stakingInfos?.length === 0 ? (
            <OutlineCard>
              <Trans>No active pools</Trans>
            </OutlineCard>
          ) : (
            stakingInfos?.map((stakingInfo) => {
              // need to sort by added liquidity here
              return <PoolCard key={stakingInfo.stakingRewardAddress} stakingInfo={stakingInfo} />
            })
          )}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}
