import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import OnchainAccountInfo from '../../monitoring/OnchainAccountInfo';
import NetValueTooltip from '../TradingInputs/NetValueTooltip';

export default function PositionBlockReadOnly({
    bodyClassName,
    borderColor,
    position,
    className,
}: {
    bodyClassName?: string;
    borderColor?: string;
    position: PositionExtended;
    className?: string;
}) {
    const tokenPrices = useSelector((s) => s.tokenPrices);

    const blockRef = useRef<HTMLDivElement>(null);
    const [isSmallSize, setIsSmallSize] = useState(false);

    const liquidable = (() => {
        const tokenPrice = tokenPrices[getTokenSymbol(position.token.symbol)];

        if (
            tokenPrice === null ||
            typeof position.liquidationPrice === 'undefined' ||
            position.liquidationPrice === null
        )
            return;

        if (position.side === 'long') return tokenPrice < position.liquidationPrice;

        // Short
        return tokenPrice > position.liquidationPrice;
    })();

    useEffect(() => {
        const handleResize = () => {
            if (!blockRef.current) return;

            const width = blockRef.current.clientWidth;

            setIsSmallSize(width <= 400);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.addEventListener('resize', handleResize);
        };
    }, []);

    const positionName = (
        <div className={twMerge("flex items-center justify-center h-full  min-w-[12em]", className)}>
            <Image
                className="w-[2em] h-[2em] mr-2"
                src={getTokenImage(position.token)}
                width={200}
                height={200}
                alt={`${getTokenSymbol(position.token.symbol)} logo`}
            />

            <div className="flex flex-col">
                <div className="flex items-center justify-center">
                    {window.location.pathname !== '/trade' ? (
                        <div className="uppercase font-boldy text-sm lg:text-xl">
                            {getTokenSymbol(position.token.symbol)}
                        </div>
                    ) : (
                        <div className="uppercase font-boldy text-sm lg:text-lg">
                            {getTokenSymbol(position.token.symbol)}
                        </div>
                    )}

                    <div
                        className={twMerge(
                            'uppercase font-boldy text-sm lg:text-lg ml-1',
                            position.side === 'long' ? 'text-green' : 'text-red',
                        )}
                    >
                        {position.side}
                    </div>
                    <div className="ml-1 text-xs text-txtfade">
                        <FormatNumber
                            nb={position.initialLeverage}
                            format="number"
                            suffix="x"
                            precision={2}
                            isDecimalDimmed={false}
                            className="text-txtfade"
                        />
                    </div>
                </div>

                <OnchainAccountInfo
                    address={position.pubkey}
                    shorten={true}
                    className="text-xxs"
                    iconClassName="w-2 h-2"
                />
            </div>
        </div>
    );

    const [showAfterFees, setShowAfterFees] = useState(true); // State to manage fee display
    const fees = -((position.exitFeeUsd ?? 0) + (position.borrowFeeUsd ?? 0));

    const pnl = (
        <div className="flex flex-col items-center min-w-[10em] w-[10em]">
            <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                PnL
            </div>
            {position.pnl ? (
                <div className="flex items-center">
                    <FormatNumber
                        nb={showAfterFees ? position.pnl : position.pnl - fees} // Adjusted for fee display
                        format="currency"
                        className={`mr-0.5 font-bold text-${(showAfterFees ? position.pnl : position.pnl - fees) > 0
                            ? 'green'
                            : 'redbright'
                            }`}
                        isDecimalDimmed={false}
                    />

                    <FormatNumber
                        nb={
                            ((showAfterFees ? position.pnl : position.pnl - fees) /
                                position.collateralUsd) *
                            100
                        }
                        format="percentage"
                        prefix="("
                        suffix=")"
                        precision={2}
                        isDecimalDimmed={false}
                        className={`text-xs text-${(showAfterFees ? position.pnl : position.pnl - fees) > 0
                            ? 'green'
                            : 'redbright'
                            }`}
                    />

                    <label className="flex items-center ml-2 cursor-pointer">
                        <label className="flex items-center ml-1 cursor-pointer">
                            <Switch
                                className="mr-0.5"
                                checked={showAfterFees}
                                onChange={() => setShowAfterFees(!showAfterFees)}
                                size="small"
                            />
                            <span className="ml-0.5 text-xxs text-gray-600 whitespace-nowrap w-6 text-center">
                                {showAfterFees ? 'w/ fees' : 'w/o fees'}
                            </span>
                        </label>
                    </label>
                </div>
            ) : (
                '-'
            )}
        </div>
    );

    const netValue = (
        <div className="flex flex-col items-center">
            <div
                className={`flex w-full font-mono text-xxs text-txtfade ${isSmallSize ? 'justify-center' : 'justify-end'
                    } items-center`}
            >
                Net value
            </div>

            <div className="flex">
                {position.pnl ? (
                    <>
                        <NetValueTooltip position={position}>
                            <span className="underline-dashed">
                                <FormatNumber
                                    nb={position.collateralUsd + position.pnl}
                                    format="currency"
                                    className="text-md"
                                />
                            </span>
                        </NetValueTooltip>
                    </>
                ) : (
                    '-'
                )}
            </div>
        </div>
    );

    const ownerInfo = (
        <div className="flex flex-col items-center min-w-[5em] w-[5em]">
            <div className="flex w-full font-mono text-xs text-txtfade justify-center items-center">
                Owner
            </div>
            <OnchainAccountInfo
                address={position.owner}
                shorten={true}
                className="text-xs"
                iconClassName="w-2 h-2"
            />
        </div>
    );

    return (
        <>
            <div
                className={twMerge(
                    'min-w-[250px] w-full flex flex-col border rounded-lg bg-secondary overflow-hidden',
                    bodyClassName,
                    borderColor,
                )}
                key={position.pubkey.toBase58()}
                ref={blockRef}
            >
                {isSmallSize ? (
                    <div className="flex flex-col w-full overflow-hidden items-center">
                        <div className="border-b pb-2 pt-2 flex w-full justify-center">
                            {positionName}
                        </div>
                        <div className="border-b pb-2 pt-2 flex w-full justify-center">
                            {ownerInfo}
                        </div>
                        <div className="border-b pb-2 pt-2 flex w-full justify-center">
                            {pnl}
                        </div>
                        <div className="border-b pb-2 pt-2 flex w-full justify-center">
                            {netValue}
                        </div>
                    </div>
                ) : (
                    <div className="flex border-b pt-2 pl-4 pb-2 pr-4 justify-between items-center overflow-hidden flex-wrap w-full">
                        {positionName}
                        {ownerInfo}
                        {pnl}
                        {netValue}
                    </div>
                )}

                <div className="flex flex-row grow justify-evenly flex-wrap gap-y-2 pb-2 pt-2 pr-2 pl-2">
                    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
                        <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                            Cur. Leverage
                        </div>
                        <div className="flex">
                            <FormatNumber
                                nb={position.currentLeverage}
                                format="number"
                                className="text-gray-400 text-xs lowercase"
                                suffix="x"
                                isDecimalDimmed={false}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
                        <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                            Size
                        </div>
                        <div className="flex">
                            <FormatNumber
                                nb={position.sizeUsd}
                                format="currency"
                                className="text-gray-400 text-xs"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
                        <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                            Collateral
                        </div>
                        <div className="flex">
                            <FormatNumber
                                nb={position.collateralUsd}
                                format="currency"
                                className="text-xs"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col min-w-[5em] w-[5em] items-center">
                        <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                            Entry Price
                        </div>
                        <div className="flex">
                            <FormatNumber
                                nb={position.price}
                                format="currency"
                                precision={position.token.displayPriceDecimalsPrecision}
                                className="text-xs bold"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
                        <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                            Market Price
                        </div>
                        <div className="flex">
                            <FormatNumber
                                nb={tokenPrices[getTokenSymbol(position.token.symbol)]}
                                format="currency"
                                precision={position.token.displayPriceDecimalsPrecision}
                                className="text-gray-400 text-xs bold"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
                        <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                            Liq. Price
                        </div>
                        <div
                            className="flex p-1 rounded"
                            role="button"
                            tabIndex={0}
                        >
                            <FormatNumber
                                nb={position.liquidationPrice}
                                format="currency"
                                precision={position.token.displayPriceDecimalsPrecision}
                                className="text-xs text-orange"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
                        <div className="flex w-full font-mono text-xxs justify-center items-center text-txtfade">
                            Take Profit
                        </div>
                        <div
                            className="flex p-1 rounded"
                            role="button"
                            tabIndex={0}
                        >
                            {position.takeProfitThreadIsSet &&
                                position.takeProfitLimitPrice &&
                                position.takeProfitLimitPrice > 0 ? (
                                <FormatNumber
                                    nb={position.takeProfitLimitPrice}
                                    format="currency"
                                    className="text-xs text-blue"
                                />
                            ) : (
                                <div className="flex text-xs">-</div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
                        <div className="flex w-full font-mono text-xxs justify-center items-center text-txtfade">
                            Stop Loss
                        </div>
                        <div
                            className="flex p-1 rounded"
                            role="button"
                            tabIndex={0}
                        >
                            {position.stopLossThreadIsSet &&
                                position.stopLossLimitPrice &&
                                position.stopLossLimitPrice > 0 ? (
                                <FormatNumber
                                    nb={position.stopLossLimitPrice}
                                    format="currency"
                                    className="text-xs text-blue"
                                />
                            ) : (
                                <div className="flex text-xs">-</div>
                            )}
                        </div>
                    </div>
                </div>

                {liquidable ? (
                    <div className="flex items-center justify-center pt-2 pb-2 border-t">
                        <h2 className="text-red text-xs">Liquidable</h2>
                    </div>
                ) : null}
            </div>
        </>
    );
}