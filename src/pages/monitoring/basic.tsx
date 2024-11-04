import React from 'react';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import ALPPriceChart from '@/components/pages/global/ALPPrice/ALPPriceChart';
import AumChart from '@/components/pages/global/Aum/AumChart';
import CompositionChart from '@/components/pages/global/Composition/CompositionChart';
import FeesChart from '@/components/pages/global/Fees/FeesChart';
import OpenInterestChart from '@/components/pages/global/OpenInterest/OpenInterestChart';
import { RealizedPnlChart } from '@/components/pages/global/RealizedPnl/RealizedPnlChart';
import { UnrealizedPnlChart } from '@/components/pages/global/UnrealizedPnl/UnrealizedPnlChart';
import UtilizationChart from '@/components/pages/global/UtilizationChart/UtilizationChart';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { PoolInfo } from '@/hooks/usePoolInfo';
import { PageProps } from '@/types';

export default function BasicMonitoring({
  mainPool,
}: // custodies,
  // poolInfo,
  PageProps & {
    poolInfo: PoolInfo | null;
  }) {
  const isSmallScreen = Boolean(useBetterMediaQuery('(max-width: 500px)'));

  return (
    <div className="flex flex-col gap-2 p-2">
      {mainPool && (
        <StyledContainer className="p-0">
          <div className="flex flex-wrap justify-between">
            <NumberDisplay
              title="TOTAL TRADING VOLUME"
              nb={mainPool.totalTradingVolume}
              format="currency"
              precision={0}
              className='border-0 min-w-[12em]'
              bodyClassName='text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl'
              headerClassName='pb-2'
              titleClassName='text-[0.7em] sm:text-[0.7em]'
            />

            <NumberDisplay
              title="TOTAL LIQUIDATION VOLUME"
              nb={mainPool.totalLiquidationVolume}
              format="currency"
              precision={0}
              className='border-0 min-w-[12em]'
              bodyClassName='text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl'
              headerClassName='pb-2'
              titleClassName='text-[0.7em] sm:text-[0.7em]'
            />

            <NumberDisplay
              title="TOTAL ALP VOLUME"
              nb={mainPool.totalAddRemoveLiquidityVolume}
              format="currency"
              precision={0}
              className='border-0 min-w-[12em]'
              bodyClassName='text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl'
              headerClassName='pb-2'
              titleClassName='text-[0.7em] sm:text-[0.7em]'
            />

            <NumberDisplay
              title="TOTAL FEES"
              nb={mainPool.totalFeeCollected}
              format="currency"
              precision={0}
              className='border-0 min-w-[12em]'
              bodyClassName='text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl'
              headerClassName='pb-2'
              titleClassName='text-[0.7em] sm:text-[0.7em]'
            />
          </div>
        </StyledContainer>
      )}
      <StyledContainer className="flex gap-6">
        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <AumChart />
          <UtilizationChart />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <CompositionChart />
          <OpenInterestChart isSmallScreen={isSmallScreen} />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <UnrealizedPnlChart isSmallScreen={isSmallScreen} />
          <RealizedPnlChart isSmallScreen={isSmallScreen} />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <FeesChart isSmallScreen={isSmallScreen} />
          <ALPPriceChart />
        </div>
      </StyledContainer>
    </div>
  );
}
