import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { formatNumber, formatPriceInfo } from '@/utils';

interface FormatNumberProps {
  nb?: number | null;
  format?: 'number' | 'currency' | 'percentage';
  precision?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  className?: string;
  placeholderClassName?: string;
  isDecimalDimmed?: boolean;
  minimumFractionDigits?: number;
  precisionIfPriceDecimalsBelow?: number;
  isLoading?: boolean;
}

const FormatNumber = forwardRef<HTMLParagraphElement, FormatNumberProps>(
  (
    {
      nb,
      format = 'number',
      precision = 2,
      prefix = '',
      suffix = '',
      placeholder = '-',
      className,
      placeholderClassName,
      isDecimalDimmed = true,
      minimumFractionDigits = 0,
      precisionIfPriceDecimalsBelow = 6,
      isLoading = false,
    },
    ref,
  ) => {
    if (isLoading) {
      return (
        <div
          className={twMerge(
            'top-0 left-0 h-full w-[100px] p-3 bg-third rounded-lg z-10 transition-opacity duration-300',
            isLoading ? 'animate-pulse opacity-100' : 'opacity-0',
          )}
        />
      );
    }

    if (nb === null || typeof nb === 'undefined') {
      return (
        <p
          ref={ref}
          className={twMerge('font-mono', className, placeholderClassName)}
        >
          {placeholder}
        </p>
      );
    }

    let num = formatNumber(
      nb,
      precision,
      minimumFractionDigits,
      precisionIfPriceDecimalsBelow,
    );

    if (format === 'currency') {
      num = formatPriceInfo(
        nb,
        precision,
        minimumFractionDigits,
        precisionIfPriceDecimalsBelow,
      );
    }

    if (format === 'percentage') {
      num = Number(nb).toFixed(precision);
    }

    const integer = num.split('.')[0];
    const decimal = num.split('.')[1];

    return (
      <p ref={ref} className={twMerge('font-mono inline-block', className)}>
        {prefix}
        {integer}
        {decimal && (
          <span
            className={twMerge(
              'font-mono',
              isDecimalDimmed && 'opacity-50',
              className,
            )}
          >
            .{decimal}
          </span>
        )}
        {format === 'percentage' && '%'}
        {suffix}
      </p>
    );
  },
);

FormatNumber.displayName = 'FormatNumber';
export default FormatNumber;
