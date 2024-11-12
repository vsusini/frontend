import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import abominationImage from '@/../public/images/abomination.png';
import demonImage from '@/../public/images/demon.png';
import firstImage from '@/../public/images/first-place.svg';
import leviathanImage from '@/../public/images/leviathan.png';
import secondImage from '@/../public/images/second-place.svg';
import spawnImage from '@/../public/images/spawn.png';
import thirdImage from '@/../public/images/third-place.svg';
import FormatNumber from '@/components/Number/FormatNumber';
import { TradingCompetitionLeaderboardAPI } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

import Table from '../monitoring/Table';

const isValidPublicKey = (key: string) => {
    try {
        new PublicKey(key);
        return true;
    } catch (e) {
        return false;
    }
};

export default function LeaderboardTable({
    division,
    index,
    data,
    className,
    nbItemPerPage,
    myDivision,
    handleProfileView
}: {
    division: keyof TradingCompetitionLeaderboardAPI;
    index: number;
    data: TradingCompetitionLeaderboardAPI;
    className?: string;
    nbItemPerPage?: number;
    myDivision: boolean;
    handleProfileView: (nickname: string) => void;
}) {
    const DIVISIONS = {
        Leviathan: {
            img: leviathanImage,
            title: 'Leviathan Division',
            topTradersPercentage: 10,
            color: '[#A45DBD]',
        },
        Abomination: {
            img: abominationImage,
            title: 'Abomination Division',
            topTradersPercentage: 40,
            color: '[#FFD700]',
        },

        Mutant: {
            img: demonImage,
            title: 'Mutant Division',
            topTradersPercentage: 60,
            color: '[#4A90E2]',
        },
        Spawn: {
            img: spawnImage,
            title: 'Spawn Division',
            topTradersPercentage: 80,
            color: '[#4CD964]',
        },
        'No Division': {
            img: null,
            title: 'Unranked',
            topTradersPercentage: null,
            color: '[#163C7D]',
        },
    } as const;

    return (
        <div className={className}>
            {DIVISIONS[division].img ? <Image
                src={DIVISIONS[division].img}
                width={75}
                height={75}
                alt=""
                className="rounded-full border-2 border-yellow-600 h-[6em] w-[6em]"
            /> : null}

            <div className="flex flex-row items-center gap-3 mt-3">
                <h3 className={twMerge("font-boldy capitalize", division === 'No Division' ? 'ml-auto mr-auto' : '')}>{DIVISIONS[division].title}</h3>

                <Tippy content={`Top ${DIVISIONS[division].topTradersPercentage} percentile of traders by traded VOLUME, minus the ones on previous divisions.`} arrow>
                    <div className={twMerge(`capitalize text-sm tracking-widest font-boldy ${division === 'No Division' ? 'hidden' : ''}`, `text-${DIVISIONS[division].color}`)}>
                        TIER {index}
                        <div className={`border-b-2 border-dotted border-gray-400 mt-0`}></div>
                    </div>
                </Tippy>

                {myDivision ? <div className='font-boldy text-xs bg-yellow-900 bg-opacity-40 rounded-lg border border-yellow-900 pt-1 pr-2 pl-2 pb-1 w-20 text-center'>Your division</div> : null}
            </div>

            <div className="mt-3">
                <Table
                    className="bg-transparent gap-1 border-none p-0"
                    columnTitlesClassName="text-sm opacity-50"
                    columnsTitles={[
                        <span className='ml-4 opacity-50' key='rank'>#</span>,
                        'Trader',
                        <span className='ml-auto mr-auto opacity-50' key='pnl'>PnL</span>,
                        <span className='ml-auto mr-auto opacity-50' key='volume'>Volume</span>,
                        <span className='ml-auto opacity-50' key='rewards'>Rewards</span>,
                    ]}
                    rowHovering={true}
                    pagination={true}
                    paginationClassName='scale-[80%] p-0'
                    nbItemPerPage={nbItemPerPage}
                    nbItemPerPageWhenBreakpoint={3}
                    rowClassName="bg-[#0B131D] hover:bg-[#1F2730] py-0 items-center"
                    rowTitleWidth="0%"
                    isFirstColumnId
                    data={(data[division] ?? []).map((d, i) => {
                        return {
                            rowTitle: '',
                            values: [
                                d.rank < 4 && division !== 'No Division' ? (
                                    <Image
                                        src={
                                            d.rank === 1
                                                ? firstImage
                                                : d.rank === 2
                                                    ? secondImage
                                                    : d.rank === 3
                                                        ? thirdImage
                                                        : ''
                                        }
                                        width={40}
                                        height={40}
                                        alt="rank"
                                        className='h-8 w-8'
                                        key={`rank-${i}`}
                                    />
                                ) : (
                                    <p className="text-sm text-center w-[40px]" key={`rank-${i}`}>
                                        {d.rank}
                                    </p>
                                ),

                                d.username
                                    ? isValidPublicKey(d.username)
                                        ? <p key={`trader-${i}`} className={twMerge('text-xs font-boldy opacity-50', d.connected ? 'text-yellow-600' : '')}>{getAbbrevWalletAddress(d.username)}</p>
                                        : <p key={`trader-${i}`} className={twMerge('text-xs font-boldy hover:underline transition duration-300 cursor-pointer', d.connected ? 'text-yellow-600 ' : '')} onClick={() => handleProfileView(d.username)}>{d.username}</p>
                                    : <p key={`trader-${i}`} className='text-xs font-boldy'>-</p>
                                ,

                                <div className='flex items-center justify-end md:justify-center grow' key={`pnl-${i}`}>
                                    <FormatNumber
                                        nb={d.pnl}
                                        format="currency"
                                        className={twMerge('text-xs font-boldy', d.pnl >= 0 ? 'text-green' : 'text-red')}
                                        isDecimalDimmed={false}

                                    />
                                </div>,

                                <div className='flex items-center justify-end md:justify-center grow' key={`volume-${i}`}>
                                    <FormatNumber
                                        nb={d.volume}
                                        isDecimalDimmed={false}
                                        isAbbreviate={true}
                                        className='text-xs'
                                        format="currency"

                                        isAbbreviateIcon={false}
                                    />
                                </div>,

                                <div className='flex flex-col items-end ml-auto' key={`rewards-${i}`}>
                                    {d.adxRewards ? <div className='flex'>
                                        <FormatNumber
                                            nb={d.adxRewards}
                                            className="text-green text-xs font-boldy"
                                            prefix='+'
                                            suffixClassName="text-green"
                                            isDecimalDimmed={false}
                                        />

                                        <span className='flex text-green font-boldy text-xs ml-1'>ADX</span>
                                    </div> : null}

                                    {d.adxRewards ? <div className='flex'>
                                        <FormatNumber
                                            nb={d.jtoRewards}
                                            className="text-green text-xs font-boldy"
                                            suffix=""
                                            prefix='+'
                                            suffixClassName="text-green"
                                            isDecimalDimmed={false}
                                        />
                                        <span className='flex text-green font-boldy text-xs ml-1'>JTO</span>
                                    </div> : null}

                                    {d.adxRewards === 0 && d.jtoRewards === 0 ? <span className='h-[2.64em]'>--</span> : null}
                                </div>
                            ],
                        };
                    })}
                />
            </div>
        </div>
    );
}
