import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import solLogo from '@/../public/images/sol.svg';
import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { ImageRef, PositionHistoryExtended, Token } from '@/types';

import FeesPaidTooltip from './FeesPaidTooltip';

interface TokenImageProps {
  symbol: string;
  image: ImageRef;
}

const TokenImage: React.FC<TokenImageProps> = ({ symbol, image }) => (
  <Image
    className="w-[1em] h-[1em] mr-1"
    src={symbol === 'JITOSOL' ? solLogo : image}
    width={200}
    height={200}
    alt={`${symbol === 'JITOSOL' ? 'SOL' : symbol} logo`}
  />
);

interface DateDisplayProps {
  date: string | number | Date;
}

const formatDate = (date: string | number | Date) => {
  const d = new Date(date);
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  let hour = d.getHours();
  const minute = d.getMinutes().toString().padStart(2, '0');
  const ampm = hour >= 12 ? 'pm' : 'am';
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'
  return `${month} ${day},${hour}:${minute}${ampm}`;
};

const DateDisplay: React.FC<DateDisplayProps> = ({ date }) => (
  <p className="text-xs font-mono opacity-50">{formatDate(date)}</p>
);

interface TokenSymbolProps {
  symbol: string;
  pathname: string;
  side: 'long' | 'short';
}

const TokenSymbol: React.FC<TokenSymbolProps> = ({ symbol, pathname, side }) =>
  pathname !== '/trade' ? (
    <Link href={`/trade?pair=USDC_${symbol}&action=${side}`} target="">
      <div className="uppercase underline font-boldy text-sm">{symbol}</div>
    </Link>
  ) : (
    <div className="uppercase font-boldy text-sm opacity-90">{symbol}</div>
  );

const useResizeObserver = (ref: React.RefObject<HTMLElement>) => {
  const [isSmallSize, setIsSmallSize] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (!ref.current) return;
      setIsSmallSize(ref.current.clientWidth <= 400);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [ref]);

  return isSmallSize;
};

export default function PositionHistoryBlock({
  bodyClassName,
  borderColor,
  positionHistory,
}: {
  bodyClassName?: string;
  borderColor?: string;
  positionHistory: PositionHistoryExtended;
}) {
  const blockRef = useRef<HTMLDivElement>(null);
  const isSmallSize = useResizeObserver(blockRef);

  const symbolDisplay =
    positionHistory.token.symbol === 'JITOSOL'
      ? 'SOL'
      : positionHistory.token.symbol === 'WBTC'
      ? 'BTC'
      : positionHistory.token.symbol;

  const renderPositionName = () => (
    <div className="w-32">
      <div className="flex items-center h-full">
        <TokenImage
          symbol={positionHistory.token.symbol}
          image={positionHistory.token.image}
        />
        {window.location.pathname !== '/trade' ? (
          <TokenSymbol
            symbol={positionHistory.token.symbol}
            pathname={window.location.pathname}
            side={positionHistory.side}
          />
        ) : (
          <div className="uppercase font-bold text-sm opacity-90">
            {symbolDisplay}
          </div>
        )}
        <div
          className={twMerge(
            'uppercase font-bold text-xs ml-1 opacity-90',
            positionHistory.side === 'long' ? 'text-green' : 'text-red',
          )}
        >
          {positionHistory.side}
        </div>
      </div>
      <DateDisplay date={positionHistory.entry_date} />
    </div>
  );

  const renderPriceDisplay = (price: number | null, title: string) => (
    <div className="flex flex-col items-center w-24">
      <PriceDisplay price={price} token={positionHistory.token} title={title} />
    </div>
  );

  const renderPnl = () => <div className="w-32">{pnl}</div>;

  const renderExitDate = () => (
    <div className="flex flex-col items-center w-24">
      <div className="flex w-full font-mono text-xxs justify-center items-center">
        {positionHistory.status === 'close' ? (
          <span className="text-blue">Closed on</span>
        ) : positionHistory.status === 'liquidate' ? (
          <span className="text-orange">Liquidated on</span>
        ) : (
          'Exit Date'
        )}
      </div>
      {positionHistory.exit_date ? (
        <DateDisplay date={positionHistory.exit_date} />
      ) : (
        <p className="text-xs font-mono opacity-50">-</p>
      )}
    </div>
  );

  const renderFeesPaid = () => <div className="w-24">{feesPaid}</div>;

  const [showAfterFees, setShowAfterFees] = useState(true); // State to manage fee display

  const pnl = (
    <div className="flex flex-col items-center min-w-[8em] w-[8em]">
      <div className="flex w-full font-mono text-xxs text-txtfade opacity-90 justify-center items-center">
        PnL
        <label className="flex items-center ml-1 cursor-pointer">
          <Switch
            className="mr-0.5"
            checked={!showAfterFees}
            onChange={() => setShowAfterFees(!showAfterFees)}
            size="small"
          />
          <span className="ml-0.5 text-xxs text-gray-600 whitespace-nowrap w-6 text-center">
            {showAfterFees ? 'w/o fees' : 'w/ fees'}
          </span>
        </label>
      </div>
      {positionHistory.pnl ? (
        <div className="flex items-center justify-center w-full">
          <FormatNumber
            nb={
              showAfterFees
                ? positionHistory.pnl + positionHistory.fees
                : positionHistory.pnl
            }
            format="currency"
            className={`mr-0.5 opacity-90 font-bold text-sm text-${
              (showAfterFees
                ? positionHistory.pnl + positionHistory.fees
                : positionHistory.pnl) > 0
                ? 'green'
                : 'redbright'
            }`}
            minimumFractionDigits={2}
            precision={2}
            isDecimalDimmed={false}
          />

          <FormatNumber
            nb={
              ((showAfterFees
                ? positionHistory.pnl + positionHistory.fees
                : positionHistory.pnl) /
                positionHistory.entry_collateral_amount) *
              100
            }
            format="percentage"
            prefix="("
            suffix=")"
            precision={2}
            isDecimalDimmed={false}
            className={`text-xxs opacity-90 text-${
              (showAfterFees
                ? positionHistory.pnl + positionHistory.fees
                : positionHistory.pnl) > 0
                ? 'green'
                : 'redbright'
            }`}
          />
        </div>
      ) : (
        '-'
      )}
    </div>
  );

  const pnlValue = showAfterFees
    ? positionHistory.pnl + positionHistory.fees
    : positionHistory.pnl;

  const percentage = positionHistory.entry_collateral_amount
    ? (pnlValue / positionHistory.entry_collateral_amount) * 100
    : null;

  {
    percentage !== null ? (
      <FormatNumber
        nb={percentage}
        format="percentage"
        prefix="("
        suffix=")"
        precision={2}
        isDecimalDimmed={false}
        className={`text-xxs opacity-90 text-${
          pnlValue > 0 ? 'green' : 'redbright'
        }`}
      />
    ) : null;
  }

  const feesPaid = (
    <div className="flex flex-col items-center">
      <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
        Fees Paid
      </div>
      <FeesPaidTooltip
        entryFees={0}
        exitFees={positionHistory.exit_fees}
        borrowFees={positionHistory.borrow_fees}
      >
        <div className="flex cursor-help">
          <span className="border-b border-dotted border-gray">
            <FormatNumber
              nb={positionHistory.exit_fees + positionHistory.borrow_fees}
              format="currency"
              className="text-xs text-red"
            />
          </span>
        </div>
      </FeesPaidTooltip>
    </div>
  );

  interface PriceDisplayProps {
    price: number | null;
    token: Token;
    title: string;
  }

  const PriceDisplay: React.FC<PriceDisplayProps> = ({
    price,
    token,
    title,
  }) => {
    const decimals = token.symbol === 'BONK' ? 8 : 2;

    return (
      <div className="flex flex-col items-center w-24">
        <div className="w-full font-mono text-xxs text-txtfade text-center">
          {title}
        </div>
        <FormatNumber
          nb={price}
          format="currency"
          className="text-xs"
          minimumFractionDigits={decimals}
          precision={decimals}
        />
      </div>
    );
  };

  return (
    <div
      className={twMerge(
        'min-w-[300px] w-full border rounded-lg border-dashed border-bcolor',
        bodyClassName,
        borderColor,
      )}
      key={positionHistory.position_id}
      ref={blockRef}
    >
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-2 px-5 py-2 opacity-90">
        <div>{renderPositionName()}</div>
        <div>
          {renderPriceDisplay(positionHistory.entry_price, 'Entry Price')}
        </div>
        <div>
          {renderPriceDisplay(positionHistory.exit_price, 'Exit Price')}
        </div>
        <div>{renderPnl()}</div>
        <div>{renderExitDate()}</div>
        <div className="ml-auto">{renderFeesPaid()}</div>
      </div>
    </div>
  );
}
