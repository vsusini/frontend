import { PublicKey } from '@solana/web3.js';
import { ReactNode, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { PositionExtended, UserProfileExtended, VestExtended } from '@/types';
import { getTokenSymbol } from '@/utils';

import OnchainAccountInfo from '../monitoring/OnchainAccountInfo';
import Table from '../monitoring/Table';
import TitleAnnotation from '../monitoring/TitleAnnotation';

// Utility function to reduce boilerplate
function onchainAccountData({
  title,
  address,
  program,
}: {
  title: ReactNode;
  address: PublicKey;
  program: 'Adrena';
}) {
  return {
    rowTitle: (
      <div className="flex items-center font-boldy">
        {title} <TitleAnnotation text={program} />
      </div>
    ),
    value: (
      <OnchainAccountInfo className="md:ml-auto text-sm" address={address} shorten={true} />
    ),
  };
}

export default function UserRelatedAdrenaAccounts({
  userProfile,
  userVest,
  positions,
  className,
}: {
  userProfile: false | UserProfileExtended;
  userVest: VestExtended | null;
  positions: PositionExtended[] | null;
  className?: string;
}) {
  const { stakingAccounts } = useWalletStakingAccounts();
  const [data, setData] = useState<
    | {
      rowTitle: ReactNode;
      value: ReactNode;
    }[]
    | null
  >(null);

  useEffect(() => {
    const data: {
      rowTitle: ReactNode;
      value: ReactNode;
    }[] = [];
    const accounts: PublicKey[] = [];

    if (stakingAccounts?.ADX) {
      data.push(
        onchainAccountData({
          title: 'ADX Staking Account',
          address: stakingAccounts.ADX.pubkey,
          program: 'Adrena',
        }),
      );
    }

    if (stakingAccounts?.ALP) {
      data.push(
        onchainAccountData({
          title: 'ALP Staking Account',
          address: stakingAccounts.ALP.pubkey,
          program: 'Adrena',
        }),
      );
    }

    if (userProfile) {
      data.push(
        onchainAccountData({
          title: 'Profile',
          address: userProfile.pubkey,
          program: 'Adrena',
        }),
      );

      accounts.push(userProfile.pubkey);
    }

    if (userVest) {
      data.push(
        onchainAccountData({
          title: 'Vest',
          address: userVest.pubkey,
          program: 'Adrena',
        }),
      );

      accounts.push(userVest.pubkey);
    }

    positions?.forEach((position) => {
      data.push(
        onchainAccountData({
          title: `${getTokenSymbol(position.token.symbol)} ${position.side === 'long' ? 'Long' : 'Short'
            } Position`,
          address: position.pubkey,
          program: 'Adrena',
        }),
      );

      accounts.push(position.pubkey);
    });

    setData(data);
  }, [positions, stakingAccounts, userProfile, userVest]);

  if (!data) return null;

  return (<div className={twMerge("flex w-full bg-third items-center justify-center rounded-tl-none rounded-tr-none rounded-bl-xl rounded-br-xl overflow-hidden", className)}>
    <Table
      className='rounded-none sm:pl-8 sm:pr-6'
      rowHovering={true}
      breakpoint="0px"
      rowTitleWidth="70%"
      data={data}
      rowTitleClassName="text-xs"
      rowClassName='text-xs'
      pagination={true}
      nbItemPerPage={10}
    />
  </div>);
}
