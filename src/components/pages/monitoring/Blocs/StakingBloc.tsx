import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { Staking } from '@/types';
import { getTokenNameByMint, nativeToUi } from '@/utils';

import DateInfo from '../DateInfo';
import NumberInfo from '../NumberInfo';
import Table from '../Table';
import TitleAnnotation from '../TitleAnnotation';

export default function StakingBloc({
  stakedTokenName,
  stakedTokenDecimals,
  className,
  staking,
}: {
  stakedTokenName: 'ADX' | 'ALP';
  stakedTokenDecimals: number;
  staking: Staking;
  className?: string;
}) {
  const rewardTokenName = getTokenNameByMint(staking.rewardTokenMint);

  return (
    <StyledContainer
      title={<h1>{stakedTokenName} Staking</h1>}
      className={className}
    >
      <Table
        rowTitleWidth="15em"
        data={[
          {
            rowTitle: 'Locked Tokens',
            value: (
              <NumberInfo
                value={nativeToUi(staking.nbLockedTokens, stakedTokenDecimals)}
                precision={stakedTokenDecimals}
                denomination={stakedTokenName}
              />
            ),
          },
          {
            rowTitle: 'Reward Token',
            value: rewardTokenName,
          },
          {
            rowTitle: 'Nb Resolved Rounds Stored',
            value: staking.resolvedStakingRounds.length,
          },
          {
            rowTitle: 'Current Round Start Time',
            value: (
              <DateInfo timestamp={staking.currentStakingRound.startTime} />
            ),
          },
        ]}
      />

      <div className="text-lg ml-4 font-special">Resolved Rounds</div>

      <Table
        rowTitleWidth="15em"
        data={[
          {
            // amount of rewards allocated to resolved rounds, claimable (excluding current/next round)
            rowTitle: (
              <div>
                Rewards <TitleAnnotation text="claimable" />
              </div>
            ),
            value: (
              <NumberInfo
                value={nativeToUi(
                  staking.resolvedRewardTokenAmount,
                  staking.rewardTokenDecimals,
                )}
                precision={staking.rewardTokenDecimals}
                denomination={rewardTokenName}
              />
            ),
          },
          {
            // amount of staked token locked in resolved rounds, claimable (excluding current/next round)
            rowTitle: 'Staked Tokens Accounted for Rewards',
            value: (
              <NumberInfo
                value={nativeToUi(
                  staking.resolvedStakedTokenAmount,
                  staking.stakedTokenDecimals,
                )}
                precision={staking.stakedTokenDecimals}
                denomination={stakedTokenName}
              />
            ),
          },
          {
            // amount of lm rewards allocated to resolved rounds, claimable (excluding current/next round)
            rowTitle: (
              <div>
                LM Rewards <TitleAnnotation text="claimable" />
              </div>
            ),
            value: (
              <NumberInfo
                value={nativeToUi(
                  staking.resolvedLmRewardTokenAmount,
                  window.adrena.client.adxToken.decimals,
                )}
                precision={window.adrena.client.adxToken.decimals}
                denomination="ADX"
              />
            ),
          },
          {
            // amount of lm staked token locked in resolved rounds, claimable (excluding current/next round)
            rowTitle: 'Staked Tokens Accounted for LM Rewards',
            value: (
              <NumberInfo
                value={nativeToUi(
                  staking.resolvedLmStakedTokenAmount,
                  staking.stakedTokenDecimals,
                )}
                precision={staking.stakedTokenDecimals}
                denomination={stakedTokenName}
              />
            ),
          },
        ]}
      />
    </StyledContainer>
  );
}