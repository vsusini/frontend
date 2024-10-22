import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { Staking } from '@/types';
import { formatNumber, nativeToUi } from '@/utils';

export default function StakingRewardsWaitingToBeClaimed({
  alpStakingAccount,
  adxStakingAccount,
  titleClassName,
  bodyClassName,
}: {
  alpStakingAccount: Staking;
  adxStakingAccount: Staking;
  titleClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <StyledContainer
      title="Staking rewards (available, pending claims)"
      subTitle="Rewards from past rounds (resolved), waiting to be claimed."
      className="w-auto grow"
      titleClassName={titleClassName}
      bodyClassName="flex sm:flex-row grow flex-col"
    >
      <StyledSubContainer>
        <div className={titleClassName}>ALP Staking</div>

        <div className="m-auto flex-col">
          <div className="flex items-center">
            <div className={bodyClassName}>
              {alpStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(
                  nativeToUi(
                    alpStakingAccount.resolvedRewardTokenAmount,
                    alpStakingAccount.rewardTokenDecimals,
                  ),
                  0,
                )
                : '-'}
            </div>
            <div className="ml-1">USDC</div>
          </div>

          <div className="flex items-center">
            <div className={bodyClassName}>
              {alpStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(
                  nativeToUi(
                    alpStakingAccount.resolvedLmRewardTokenAmount,
                    window.adrena.client.adxToken.decimals,
                  ),
                  0,
                )
                : '-'}
            </div>
            <div className="ml-1">ADX</div>
          </div>
        </div>
      </StyledSubContainer>

      <StyledSubContainer>
        <div className={titleClassName}>ADX Staking</div>

        <div className="m-auto flex-col">
          <div className="flex items-center">
            <div className={bodyClassName}>
              {adxStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(
                  nativeToUi(
                    adxStakingAccount.resolvedRewardTokenAmount,
                    adxStakingAccount.rewardTokenDecimals,
                  ),
                  0,
                )
                : '-'}
            </div>
            <div className="ml-1">USDC</div>
          </div>

          <div className="flex items-center">
            <div className={bodyClassName}>
              {adxStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(
                  nativeToUi(
                    adxStakingAccount.resolvedLmRewardTokenAmount,
                    window.adrena.client.adxToken.decimals,
                  ),
                  0,
                )
                : '-'}
            </div>
            <div className="ml-1">ADX</div>
          </div>
        </div>
      </StyledSubContainer>
    </StyledContainer>
  );
}
