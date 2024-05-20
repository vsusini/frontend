import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import Image from 'next/image';
import React from 'react';

import ADXFeeStreamAnimation from '@/components/buy_adx/ADXFeeStreamAnimation';
import ADXVoteAnimation from '@/components/buy_adx/ADXVoteAnimation';
import Button from '@/components/common/Button/Button';
import StakeAnimation from '@/components/pages/buy_alp_adx/StakeAnimation/StakeAnimation';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';

import orcaIcon from '../../../public/images/orca-icon.png';

export default function BuyADX() {
  return (
    <div className="flex flex-col gap-[200px] lg:gap-[300px] px-7">
      <div className="flex flex-col justify-center items-start w-full h-[800px] z-10">
        <div className="flex flex-row gap-3 items-center">
          <Image
            src={window.adrena.client.adxToken.image}
            className="w-6 h-6"
            alt="adx logo"
          />
          <div>
            <h3 className="inline-block">ADX</h3>{' '}
            <h3 className="inline-block text-txtfade">
              – The Governance Token
            </h3>
          </div>
        </div>
        <h1 className="text-[2.6rem] lg:text-[3rem] uppercase max-w-[840px]">
          DIRECTLY CAPTURE REVENUE AND INFLUENCE THE PROTOCOL WITH THE ADRENA
          TOKEN
        </h1>

        <p className="text-[1.2rem] max-w-[640px] text-txtfade mb-6">
          Accumulate and stake ADX to get proportional control and economic
          value capture
        </p>
        <Button
          title="Buy ADX on Orca"
          href="https://www.orca.so/"
          rightIcon={orcaIcon}
          iconClassName="w-5 h-5"
          size="lg"
          className="mt-4 px-14 py-3 text-base"
        />
      </div>
      <div className="opacity-50">
        <RiveAnimation
          animation="mid-monster"
          layout={
            new Layout({
              fit: Fit.Contain,
              alignment: Alignment.TopRight,
            })
          }
          className="absolute w-full h-full top-0 right-0 -z-10"
        />
      </div>

      <div className="relative flex flex-col lg:flex-row gap-12 justify-between items-center w-full ">
        <div className="relative">
          <h1 className="text-[36px] mb-1">GET PASSIVE INCOME</h1>
          <p className="text-[24px] max-w-[600px]">
            Staked ADX receives 20% of protocol revenue in direct USDC airdrops
          </p>
          <Button
            size="lg"
            title="Stake ADX"
            href={'/stake'}
            className="mt-3"
          />
        </div>

        <ADXFeeStreamAnimation token="ADX" />
      </div>

      <div className="flex flex-col lg:flex-row gap-12 justify-between items-center w-full mb-[100px]">
        <div>
          <h1 className="text-[46px] mb-1">
            1 ADX = 1 VOTE, EXERCISE GOVERNANCE
          </h1>
          {/* <p className="text-[24px] max-w-[800px]">1 ADX = 1 VOTE</p> */}
        </div>

        <ADXVoteAnimation />
      </div>

      <StakeAnimation
        isADX
        title="GET BONUS ADX"
        subtitle="Duration lock ALP for bonus USDC yield and ADX token rewards. The longer you lock, the higher the multipliers"
      />
    </div>
  );
}
