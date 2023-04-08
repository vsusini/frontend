import { twMerge } from 'tailwind-merge';

import { formatPriceInfo } from '@/utils';

export default function Stats({
  className,
  totalCollectedFees,
  totalVolume,
}: {
  className?: string;
  totalCollectedFees: number | null;
  totalVolume: number | null;
}) {
  return (
    <div
      className={twMerge(
        'border',
        'border-grey',
        'bg-secondary',
        'flex',
        'flex-col',
        'w-[30em]',
        'max-w-full',
        className,
      )}
    >
      <div className="p-4 border-b border-grey">Total Stats</div>
      <div className="p-4 text-sm flex flex-col w-full">
        <div className="flex w-full justify-between">
          <div className="text-txtfade">Total Fees</div>
          <div>{formatPriceInfo(totalCollectedFees)}</div>
        </div>
        <div className="flex w-full justify-between">
          <div className="text-txtfade">Total Volume</div>
          <div>{formatPriceInfo(totalVolume)}</div>
        </div>
      </div>
    </div>
  );
}