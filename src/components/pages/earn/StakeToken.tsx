import Image from 'next/image';
import React from 'react';

import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import { STAKE_MULTIPLIERS } from '@/constant';
import { LockPeriod } from '@/types';
import { formatNumber } from '@/utils';

import lockIcon from '../../../../public/images/Icons/lock.svg';

export default function StakeToken({
  tokenSymbol,
  balance,
  amount,
  setAmount,
  lockPeriod,
  setLockPeriod,
  onStakeAmountChange,
  stakeAmount,
  errorMessage,
}: {
  tokenSymbol: 'ADX' | 'ALP';
  balance: number | null;
  amount: number | null;
  setAmount: (amount: number | null) => void;
  lockPeriod: LockPeriod;
  setLockPeriod: (lockPeriod: LockPeriod) => void;
  onStakeAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  stakeAmount: () => void;
  errorMessage: string;
}) {
  const LOCK_PERIODS: { title: LockPeriod }[] = [
    { title: 0 },
    { title: 30 },
    { title: 60 },
    { title: 90 },
    { title: 180 },
    { title: 360 },
    { title: 720 },
  ];

  return (
    <div className="flex flex-col sm:flex-row lg:flex-col rounded-lg sm:min-w-[400px] h-fit">
      <div className="flex flex-col gap-5 justify-between w-full px-5">
        <div>
          <h3> Stake {tokenSymbol} </h3>
          <p className="opacity-75 mt-1">
            Adrena&apos;s native utility and governance token
          </p>
        </div>

        <div>
          <div className="flex flex-row justify-between mb-2">
            <p className="text-xs opacity-50 font-medium"> Enter Amount</p>
            <p className="text-xs font-medium">
              <span className="opacity-50"> Balance · </span>
              {balance ? `${formatNumber(balance, 2)} ${tokenSymbol}` : '–'}
            </p>
          </div>

          <div className="relative flex flex-row w-full">
            <div className="flex items-center bg-[#242424] border border-gray-300 rounded-l-lg px-3  border-r-none">
              <p className="opacity-50 font-mono text-sm">{tokenSymbol}</p>
            </div>
            <input
              className="w-full bg-dark border border-gray-300 rounded-lg rounded-l-none p-3 px-4 text-xl font-mono"
              type="number"
              onWheel={(e) => {
                // Disable the scroll changing input value
                (e.target as HTMLInputElement).blur();
              }}
              value={amount ?? ''}
              onChange={onStakeAmountChange}
              placeholder="0.00"
            />
            <Button
              className="absolute right-2 bottom-[20%]"
              title="MAX"
              variant="text"
              onClick={() => {
                if (!balance) {
                  return;
                }
                setAmount(balance);
              }}
            />
          </div>
        </div>

        <div>
          <div className="flex flex-row gap-1  mb-2">
            <Image src={lockIcon} width={14} height={14} alt="lock icon" />
            <p className="text-xs opacity-50 font-medium ">
              Choose a lock period (days)
            </p>
          </div>
          <TabSelect
            className="font-mono"
            selected={lockPeriod}
            tabs={LOCK_PERIODS}
            onClick={(title) => {
              setLockPeriod(title);
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 justify-between w-full p-5 ">
        <ul className="flex flex-col gap-2">
          <li className="text-xs opacity-25">Benefits</li>
          <li className="flex flex-row justify-between">
            <p className="text-sm opacity-50"> Days </p>
            <p className="text-sm font-mono"> {lockPeriod} </p>
          </li>
          <li className="flex flex-row justify-between">
            <p className="text-sm opacity-50"> USDC yield</p>
            <p className="text-sm font-mono">
              {STAKE_MULTIPLIERS[lockPeriod].usdc}x
            </p>
          </li>
          <li className="flex flex-row justify-between">
            <p className="text-sm opacity-50"> ADX token yield </p>
            <p className="text-sm font-mono">
              {STAKE_MULTIPLIERS[lockPeriod].adx}x
            </p>
          </li>
          <li className="flex flex-row justify-between">
            <p className="text-sm opacity-50"> Votes </p>
            <p className="text-sm font-mono">
              {STAKE_MULTIPLIERS[lockPeriod].votes}x
            </p>
          </li>
        </ul>

        <Button
          className="w-full"
          size="lg"
          title={errorMessage ? errorMessage : '[S]take'}
          disabled={!!errorMessage}
          onClick={stakeAmount}
        />
      </div>
    </div>
  );
}