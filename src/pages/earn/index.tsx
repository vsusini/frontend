import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

import Modal from '@/components/common/Modal/Modal';
import StakeBlocks from '@/components/pages/earn/StakeBlocks';
import StakeList from '@/components/pages/earn/StakeList';
import StakeOverview from '@/components/pages/earn/StakeOverview';
import StakeRedeem from '@/components/pages/earn/StakeRedeem';
import StakeToken from '@/components/pages/earn/StakeToken';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { useSelector } from '@/store/store';
import { LockPeriod, PageProps } from '@/types';
import {
  addFailedTxNotification,
  addSuccessTxNotification,
  getDaysRemaining,
  nativeToUi,
} from '@/utils';

import lockIcon from '../../../public/images/Icons/lock.svg';

export default function Earn({ triggerWalletTokenBalancesReload }: PageProps) {
  const wallet = useSelector((s) => s.walletState.wallet);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const adxPrice: number | null =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.adxToken.symbol]) ??
    null;

  const alpPrice: number | null =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.alpToken.symbol]) ??
    null;

  const { stakingAccounts, triggerWalletStakingAccountsReload } =
    useWalletStakingAccounts();

  const [activeStakingToken, setActiveStakingToken] = useState<
    'ADX' | 'ALP' | null
  >(null);

  const [activeRedeemToken, setActiveRedeemToken] = useState<
    'ADX' | 'ALP' | null
  >(null);

  const [lockPeriod, setLockPeriod] = useState<LockPeriod>(0);

  const [amount, setAmount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const adxBalance: number | null =
    walletTokenBalances?.[window.adrena.client.adxToken.symbol] ?? null;

  const alpBalance: number | null =
    walletTokenBalances?.[window.adrena.client.alpToken.symbol] ?? null;

  const owner: PublicKey | null = wallet
    ? new PublicKey(wallet.walletAddress)
    : null;

  const stakeAmount = async () => {
    if (!owner) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!amount) {
      toast.error('Please enter an amount');
      return;
    }

    if (!activeStakingToken) return;

    const stakedTokenMint =
      activeStakingToken === 'ADX'
        ? window.adrena.client.adxToken.mint
        : window.adrena.client.alpToken.mint;

    try {
      const txHash =
        lockPeriod === 0
          ? await window.adrena.client.addLiquidStake({
              owner,
              amount,
              stakedTokenMint,
            })
          : await window.adrena.client.addLockedStake({
              owner,
              amount,
              lockedDays: Number(lockPeriod) as LockPeriod,
              stakedTokenMint,
            });

      addSuccessTxNotification({
        title: 'Successfully Staked ADX',
        txHash,
      });

      setAmount(null);
      setLockPeriod(0);
      triggerWalletTokenBalancesReload();
      triggerWalletStakingAccountsReload();
      setActiveStakingToken(null);
    } catch (error) {
      return addFailedTxNotification({
        title: `Error Staking ${activeStakingToken}`,
        error,
      });
    }
  };

  const handleRemoveLiquidStake = async (amount: number) => {
    if (!owner) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!activeRedeemToken) return;

    const stakedTokenMint =
      activeRedeemToken === 'ADX'
        ? window.adrena.client.adxToken.mint
        : window.adrena.client.alpToken.mint;

    try {
      const txHash = await window.adrena.client.removeLiquidStake({
        owner,
        amount,
        stakedTokenMint,
      });

      addSuccessTxNotification({
        title: 'Successfully Removed Liquid Stake',
        txHash,
      });

      triggerWalletTokenBalancesReload();
      triggerWalletStakingAccountsReload();
      setActiveRedeemToken(null);
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Removing Liquid Stake',
        error,
      });
    }
  };

  const getTotalLiquidStaked = (token: 'ADX' | 'ALP') =>
    stakingAccounts?.[token]?.liquidStake
      ? nativeToUi(
          stakingAccounts[token]!.liquidStake.amount,
          token === 'ALP'
            ? window.adrena.client.alpToken.decimals
            : window.adrena.client.adxToken.decimals,
        )
      : 0;

  const getTotalLockedStake = (token: 'ADX' | 'ALP') => {
    return (
      stakingAccounts?.[token]?.lockedStakes.reduce((acc, stake) => {
        const val = nativeToUi(
          stake.amount,
          token === 'ALP'
            ? window.adrena.client.alpToken.decimals
            : window.adrena.client.adxToken.decimals,
        );

        return acc + val;
      }, 0) ?? 0
    );
  };

  const getTotalStaked = (token: 'ADX' | 'ALP') =>
    getTotalLiquidStaked(token) + getTotalLockedStake(token);

  const getTotalReedemableLockedStake = (token: 'ADX' | 'ALP') => {
    return (
      stakingAccounts?.[token]?.lockedStakes.reduce((acc, stake) => {
        const daysRemaining = getDaysRemaining(
          stake.stakeTime,
          stake.lockDuration,
        );

        if (daysRemaining <= 0) {
          const val = nativeToUi(
            stake.amount,
            token === 'ALP'
              ? window.adrena.client.alpToken.decimals
              : window.adrena.client.adxToken.decimals,
          );

          return acc + val;
        }
        return acc;
      }, 0) ?? 0
    );
  };

  const getTotalReedemableStake = (token: 'ADX' | 'ALP') => {
    return getTotalReedemableLockedStake(token) + getTotalLiquidStaked(token);
  };

  const onStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '' || activeStakingToken === null) {
      setAmount(null);
      setErrorMessage('');
      return;
    }
    const balance =
      activeStakingToken === 'ALP' ? alpBalance ?? 0 : adxBalance ?? 0;

    const minAmount =
      activeStakingToken === 'ALP'
        ? nativeToUi(new BN(1), window.adrena.client.alpToken.decimals)
        : nativeToUi(new BN(1), window.adrena.client.adxToken.decimals);

    if (Number(value) > balance) {
      setErrorMessage('Insufficient balance');
    } else if (Number(value) < minAmount) {
      setErrorMessage(
        `Minimum stake amount is ${minAmount} ${activeStakingToken}`,
      );
    } else {
      setErrorMessage('');
    }

    setAmount(Number(value));
  };

  const adxDetails = {
    token: { ...window.adrena.client.adxToken },
    balance: adxBalance,
    totalLiquidStaked: wallet ? getTotalLiquidStaked('ADX') : null,
    totalLiquidStakedUSD:
      wallet && adxPrice ? adxPrice * getTotalLiquidStaked('ADX') : null,
    totalLockedStake: wallet ? getTotalLockedStake('ADX') : null,

    totalLockedStakeUSD:
      wallet && adxPrice ? adxPrice * getTotalLockedStake('ADX') : null,
    totalStaked: wallet ? getTotalStaked('ADX') : null,
    totalReedemableStake: wallet ? getTotalReedemableStake('ADX') : null,
    totalReedemableStakeUSD:
      wallet && adxPrice ? adxPrice * getTotalReedemableStake('ADX') : null,
  };

  const alpDetails = {
    token: { ...window.adrena.client.alpToken },
    balance: alpBalance,
    totalLiquidStaked: wallet ? getTotalLiquidStaked('ALP') : null,
    totalLiquidStakedUSD:
      wallet && alpPrice ? alpPrice * getTotalLiquidStaked('ALP') : null,
    totalLockedStake: wallet ? getTotalLockedStake('ALP') : null,

    totalLockedStakeUSD:
      wallet && alpPrice ? alpPrice * getTotalLockedStake('ALP') : null,
    totalStaked: wallet ? getTotalStaked('ALP') : null,
    totalReedemableStake: wallet ? getTotalReedemableStake('ALP') : null,
    totalReedemableStakeUSD:
      wallet && alpPrice ? alpPrice * getTotalReedemableStake('ALP') : null,
  };

  const isBigScreen = useBetterMediaQuery('(min-width: 950px)');

  return (
    <>
      <h2>Earn</h2>
      <p>
        Governed by the Adrena community, conferring control and economic reward
        to the collective.
      </p>
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="w-full">
          <div className="flex flex-col lg:flex-row gap-5 mt-8">
            <StakeOverview
              tokenDetails={adxDetails}
              setActiveToken={setActiveStakingToken}
              setActiveRedeemToken={setActiveRedeemToken}
            />
            <StakeOverview
              tokenDetails={alpDetails}
              setActiveToken={setActiveStakingToken}
              setActiveRedeemToken={setActiveRedeemToken}
            />
          </div>
          <div className="flex flex-col gap-3 bg-gray-200 border border-gray-300 rounded-lg p-4 mt-8">
            <div className="flex flex-row gap-2 items-center mb-3">
              <Image src={lockIcon} width={16} height={16} alt="lock icon" />
              <h4>My Locked Stake</h4>
            </div>

            {wallet &&
              (isBigScreen ? (
                <StakeList stakePositions={stakingAccounts} />
              ) : (
                <StakeBlocks stakePositions={stakingAccounts} />
              ))}
          </div>
        </div>

        <AnimatePresence>
          {activeStakingToken && (
            <Modal
              title={`Stake ${activeStakingToken}`}
              close={() => {
                setAmount(null);
                setLockPeriod(0);
                setActiveStakingToken(null);
              }}
            >
              <StakeToken
                tokenSymbol={activeStakingToken}
                amount={amount}
                setAmount={setAmount}
                onStakeAmountChange={onStakeAmountChange}
                errorMessage={errorMessage}
                stakeAmount={stakeAmount}
                balance={activeStakingToken === 'ADX' ? adxBalance : alpBalance}
                lockPeriod={lockPeriod}
                setLockPeriod={setLockPeriod}
              />
            </Modal>
          )}

          {activeRedeemToken && (
            <Modal
              title={`Redeem ${activeRedeemToken}`}
              close={() => setActiveRedeemToken(null)}
            >
              <StakeRedeem
                tokenSymbol={activeRedeemToken}
                totalLiquidStaked={getTotalReedemableStake(activeRedeemToken)}
                handleRemoveLiquidStake={handleRemoveLiquidStake}
              />
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}