import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { TokenPricesState } from '@/reducers/tokenPricesReducer';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';

export const calculatePnLandLiquidationPrice = (
  position: PositionExtended,
  tokenPrices: TokenPricesState,
) => {
  // Calculate PnL
  const pnl = window.adrena.client.calculatePositionPnL({
    position,
    tokenPrices,
  });

  if (pnl === null) return null;

  const { profitUsd, lossUsd, borrowFeeUsd } = pnl;

  position.profitUsd = profitUsd;
  position.lossUsd = lossUsd;
  position.borrowFeeUsd = borrowFeeUsd;
  position.pnl = profitUsd + -lossUsd;
  position.pnlMinusFees = position.pnl + borrowFeeUsd + position.exitFeeUsd;
  position.currentLeverage =
    position.sizeUsd / (position.collateralUsd + position.pnl);

  // Calculate liquidation price
  const liquidationPrice = window.adrena.client.calculateLiquidationPrice({
    position,
  });

  if (liquidationPrice !== null) {
    position.liquidationPrice = liquidationPrice;
  }
};

let lastDealtTrickReload = 0;
let lastCall = 0;

export default function usePositions(): {
  positions: PositionExtended[] | null;
  triggerPositionsReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const wallet = useSelector((s) => s.walletState.wallet);
  const [positions, setPositions] = useState<PositionExtended[] | null>(null);

  const tokenPrices = useSelector((s) => s.tokenPrices);

  useEffect(() => {
    // Reset when loading the hook
    lastCall = 0;
  }, []);

  const loadPositions = useCallback(async () => {
    if (!wallet || !tokenPrices) {
      setPositions(null);
      return;
    }

    const loadPosition =
      lastDealtTrickReload !== trickReload || lastCall < Date.now() - 10000;

    if (loadPosition) lastCall = Date.now();

    lastDealtTrickReload = trickReload;

    if (loadPosition) {
      try {
        const freshPositions =
          (loadPosition
            ? await window.adrena.client.loadUserPositions(
              new PublicKey(wallet.walletAddress),
            )
            : positions) ?? [];

        freshPositions.forEach((position) => {
          calculatePnLandLiquidationPrice(position, tokenPrices);
        });

        setPositions(freshPositions);
      } catch (e) {
        console.log('Error loading positions', e, String(e));
      }

      return;
    }

    if (positions === null) {
      return;
    }

    positions.forEach((position) => {
      calculatePnLandLiquidationPrice(position, tokenPrices);
    });
  }, [wallet, tokenPrices]);

  useEffect(() => {
    loadPositions();

    const interval = setInterval(async () => {
      await loadPositions();
    }, 5000); // Every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [loadPositions, trickReload, window.adrena.client.connection]);

  return {
    positions,
    triggerPositionsReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
