import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { PageName } from 'components/AmplitudeAnalytics/constants'
import { Trace } from 'components/AmplitudeAnalytics/Trace'
import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { LightCard } from 'components/Card'
import CurrencyLogo from 'components/CurrencyLogo'
import StakeInputPanel from 'components/stakePow/StakeInputPanel'
import StakePowDataCard from 'components/stakePow/StakePowDataCard'
import { POW_ETHW, SPOW_ETHW } from 'constants/tokens'
import JSBI from 'jsbi'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useCallback, useState } from 'react'
import { useToggleWalletModal } from 'state/application/hooks'
import { useTokenBalance } from 'state/connection/hooks'
import { usePowBar, usePowBarStats } from 'state/single-stake/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import { AutoColumn } from '../../components/Column'
import { CardBGImage, CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import Row, { RowBetween } from '../../components/Row'
import { SwitchLocaleLink } from '../../components/SwitchLocaleLink'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { ExternalLink, ThemedText } from '../../theme'
import { ClickableText, Dots } from '../Pool/styleds'

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
const DataRow = styled(RowBetween)`
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
   flex-direction: column;
   margin: 15px;
 `};
`

const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const StakeClickableText = styled(ClickableText)<{ selected: boolean }>`
  color: ${({ selected, theme }) => (selected ? theme.deprecated_primary1 : theme.deprecated_bg5)};
  font-weight: ${({ selected }) => (selected ? 500 : 400)};
`

const LargeHeaderWhite = styled(ThemedText.LargeHeader)`
  color: white;
`

enum StakeState {
  stakePOW = 'stakePOW',
  unstakeSPOW = 'unstakeSPOW',
}

const INPUT_CHAR_LIMIT = 18

export default function Stake() {
  const theme = useTheme()
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useToggleWalletModal() // toggle wallet when disconnected

  const [stakeState, setStakeState] = useState<StakeState>(StakeState.stakePOW)
  const [input, _setInput] = useState<string>('')
  const [usingBalance, setUsingBalance] = useState(false)
  const [pendingTx, setPendingTx] = useState(false)
  const { enter, leave } = usePowBar()

  const isStaking = stakeState === StakeState.stakePOW

  const triBalance = useTokenBalance(account ?? undefined, POW_ETHW)
  const xTriBalance = useTokenBalance(account ?? undefined, SPOW_ETHW)

  const balance = isStaking ? triBalance : xTriBalance
  const parsedAmount = usingBalance ? balance : tryParseCurrencyAmount(input, balance?.currency)

  const [approvalState, handleApproval] = useApproveCallback(parsedAmount, SPOW_ETHW.address)

  // Reset input when toggling staking/unstaking
  function handleStakePOW() {
    setStakeState(StakeState.stakePOW)
    setInput('')
  }
  function handleUnstakeSPOW() {
    setStakeState(StakeState.unstakeSPOW)
    setInput('')
  }

  function setInput(v: string) {
    // Allows user to paste in long balances
    const value = v.slice(0, INPUT_CHAR_LIMIT)

    setUsingBalance(false)
    _setInput(value)
  }

  const maxAmountInput: CurrencyAmount<Currency> | undefined = maxAmountSpend(balance)
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))

  const handleClickMax = useCallback(() => {
    if (maxAmountInput) {
      setInput(maxAmountInput.toExact())
      setUsingBalance(true)
    }
  }, [maxAmountInput, setInput])

  function renderApproveButton() {
    if (!isStaking) {
      return null
    }

    return (
      <ButtonConfirmed
        mr="0.5rem"
        onClick={handleApproval}
        confirmed={approvalState === ApprovalState.APPROVED}
        disabled={approvalState !== ApprovalState.NOT_APPROVED}
      >
        {approvalState === ApprovalState.PENDING ? (
          <Dots>Approving</Dots>
        ) : approvalState === ApprovalState.APPROVED ? (
          'Approved'
        ) : (
          'Approve'
        )}
      </ButtonConfirmed>
    )
  }

  function renderStakeButton() {
    // If input does not have value
    if (parsedAmount?.greaterThan(JSBI.BigInt(0)) !== true) {
      return <ButtonPrimary disabled={true}>Enter an amount</ButtonPrimary>
    }

    // If account balance is less than inputted amount
    const insufficientFunds =
      (balance?.equalTo(JSBI.BigInt(0)) ?? false) || parsedAmount?.greaterThan(balance?.asFraction || 0)
    if (insufficientFunds) {
      return (
        <ButtonError error={true} disabled={true}>
          Insufficient Balance
        </ButtonError>
      )
    }

    // If user is unstaking, we don't need to check approval status
    const isDisabled = isStaking ? approvalState !== ApprovalState.APPROVED || pendingTx : pendingTx

    return (
      <ButtonPrimary disabled={isDisabled} onClick={handleStake}>
        {isStaking ? 'Stake' : 'Unstake'}
      </ButtonPrimary>
    )
  }

  async function handleStake() {
    try {
      setPendingTx(true)

      if (isStaking) {
        await enter(parsedAmount)
      } else {
        await leave(parsedAmount)
      }

      setInput('')
    } catch (e) {
      console.error(`Error ${isStaking ? 'Staking' : 'Unstaking'}: `, e)
    } finally {
      setPendingTx(false)
    }
  }

  const { totalTriStaked } = usePowBarStats()
  const totalTriStakedFormatted = totalTriStaked?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return (
    <Trace page={PageName.STAKE_PAGE} shouldLogImpression>
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

          <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
            <DataRow style={{ alignItems: 'baseline', gap: '10px', margin: 0 }}>
              <StakePowDataCard label="Total POW Staked">
                <Row align="center" justifyContent="start">
                  <CurrencyLogo currency={POW_ETHW} size={'20px'} style={{ marginRight: '10px' }} />
                  <ThemedText.DeprecatedBlack fontWeight={400}>
                    {totalTriStakedFormatted ?? 'Loading...'}
                  </ThemedText.DeprecatedBlack>
                </Row>
              </StakePowDataCard>
              <StakePowDataCard label="Balance sPOW">
                <Row align="center" justifyContent="start">
                  <CurrencyLogo currency={SPOW_ETHW} size={'20px'} style={{ marginRight: '10px' }} />
                  <ThemedText.DeprecatedBlack fontWeight={400}>
                    {xTriBalance?.toFixed(4) ?? 0}
                  </ThemedText.DeprecatedBlack>
                </Row>
              </StakePowDataCard>
              <StakePowDataCard label="Unstaked POW">
                <Row align="center" justifyContent="start">
                  <CurrencyLogo currency={POW_ETHW} size={'20px'} style={{ marginRight: '10px' }} />
                  <ThemedText.DeprecatedBlack fontWeight={400}>
                    {triBalance?.toFixed(4) ?? 0}
                  </ThemedText.DeprecatedBlack>
                </Row>
              </StakePowDataCard>
            </DataRow>
          </AutoColumn>

          <AutoColumn style={{ width: '100%' }}>
            <LightCard>
              <AutoColumn gap="20px">
                <RowBetween>
                  <AutoColumn gap="20px" justify="start">
                    <ThemedText.DeprecatedMediumHeader>
                      {isStaking ? 'Stake POW' : 'Unstake sPOW'}
                    </ThemedText.DeprecatedMediumHeader>
                  </AutoColumn>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <StakeClickableText
                        selected={isStaking}
                        style={{ paddingRight: '10px' }}
                        onClick={handleStakePOW}
                      >
                        Stake
                      </StakeClickableText>
                      <StakeClickableText selected={!isStaking} onClick={handleUnstakeSPOW}>
                        Unstake
                      </StakeClickableText>
                    </RowBetween>
                  </AutoColumn>
                </RowBetween>
                <StakeInputPanel
                  value={input!}
                  onUserInput={setInput}
                  showMaxButton={!atMaxAmountInput}
                  currency={isStaking ? POW_ETHW : SPOW_ETHW}
                  id="stake-currency-input"
                  onMax={handleClickMax}
                />
              </AutoColumn>
              <div style={{ marginTop: '1rem' }}>
                {account == null ? (
                  <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
                ) : (
                  <RowBetween>
                    {renderApproveButton()}
                    {renderStakeButton()}
                  </RowBetween>
                )}
              </div>
            </LightCard>
          </AutoColumn>
        </PageWrapper>
        <SwitchLocaleLink />
      </>
    </Trace>
  )
}
