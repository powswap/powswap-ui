import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { abi as MASTERCHEF_ABI } from 'abis/MasterChef.json'
import JSBI from 'jsbi'
import { ReactNode, useState } from 'react'
import styled from 'styled-components/macro'

import { useContract } from '../../hooks/useContract'
import { StakingInfo } from '../../state/stake/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { CloseIcon, ThemedText } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import FormattedCurrencyAmount from '../FormattedCurrencyAmount'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import { RowBetween } from '../Row'

function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean) {
  return useContract(stakingAddress, MASTERCHEF_ABI, withSignerIfPossible)
}

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: StakingInfo
}

export default function UnstakingModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  const { account } = useWeb3React()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress)

  async function onWithdraw() {
    if (stakingContract && stakingInfo?.stakedAmount) {
      setAttempting(true)
      await stakingContract.withdraw(
        `0x${JSBI.BigInt(stakingInfo.poolId).toString(16)}`,
        `0x${stakingInfo.stakedAmount.quotient.toString(16)}`,
        { gasLimit: 350000 }
      )
    }
  }

  let error: ReactNode | undefined
  if (!account) {
    error = <Trans>Connect a wallet</Trans>
  }
  if (!stakingInfo?.stakedAmount) {
    error = error ?? <Trans>Enter an amount</Trans>
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <ThemedText.DeprecatedMediumHeader>
              <Trans>Withdraw</Trans>
            </ThemedText.DeprecatedMediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          {stakingInfo?.stakedAmount && (
            <AutoColumn justify="center" gap="md">
              <ThemedText.DeprecatedBody fontWeight={600} fontSize={36}>
                {<FormattedCurrencyAmount currencyAmount={stakingInfo.stakedAmount} />}
              </ThemedText.DeprecatedBody>
              <ThemedText.DeprecatedBody>
                <Trans>Deposited liquidity:</Trans>
              </ThemedText.DeprecatedBody>
            </AutoColumn>
          )}
          {stakingInfo?.earnedAmount && (
            <AutoColumn justify="center" gap="md">
              <ThemedText.DeprecatedBody fontWeight={600} fontSize={36}>
                {<FormattedCurrencyAmount currencyAmount={stakingInfo?.earnedAmount} />}
              </ThemedText.DeprecatedBody>
              <ThemedText.DeprecatedBody>
                <Trans>Unclaimed POW</Trans>
              </ThemedText.DeprecatedBody>
            </AutoColumn>
          )}
          <ThemedText.DeprecatedSubHeader style={{ textAlign: 'center' }}>
            <Trans>When you withdraw, your POW is claimed and your liquidity is removed from the mining pool.</Trans>
          </ThemedText.DeprecatedSubHeader>
          <ButtonError disabled={!!error} error={!!error && !!stakingInfo?.stakedAmount} onClick={onWithdraw}>
            {error ?? <Trans>Withdraw & Claim</Trans>}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <ThemedText.DeprecatedBody fontSize={20}>
              <Trans>Withdrawing {stakingInfo?.stakedAmount?.toSignificant(4)} UNI-V2</Trans>
            </ThemedText.DeprecatedBody>
            <ThemedText.DeprecatedBody fontSize={20}>
              <Trans>Claiming {stakingInfo?.earnedAmount?.toSignificant(4)} POW</Trans>
            </ThemedText.DeprecatedBody>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <ThemedText.DeprecatedLargeHeader>
              <Trans>Transaction Submitted</Trans>
            </ThemedText.DeprecatedLargeHeader>
            <ThemedText.DeprecatedBody fontSize={20}>
              <Trans>Withdrew UNI-V2!</Trans>
            </ThemedText.DeprecatedBody>
            <ThemedText.DeprecatedBody fontSize={20}>
              <Trans>Claimed POW!</Trans>
            </ThemedText.DeprecatedBody>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
