import React from 'react';
import { TooltipProps } from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import { twMerge } from 'tailwind-merge';

import { formatNumber, formatPercentage, formatPriceInfo } from '@/utils';

export default function CustomRechartsToolTip({
  active,
  payload,
  label,
  isValueOnly,
  format = 'currency',
  suffix = '',
  isPieChart,
  precision = 2,
}: TooltipProps<ValueType, NameType> & {
  isValueOnly?: boolean;
  format?: 'currency' | 'percentage' | 'number';
  suffix?: string;
  isPieChart?: boolean;
  precision?: number;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-third p-3 border border-white rounded-lg min-w-[12em]">
        {label && <p className="text-lg mb-2 font-mono">{label}</p>}
        {payload.map((item) => (
          <div
            key={item.dataKey}
            className="text-sm font-mono flex gap-3 justify-between"
            style={{ color: item.color }}
          >
            {!isValueOnly && !isPieChart && (
              <span style={{ color: item.color }}>{item.dataKey}:</span>
            )}

            {!isValueOnly && isPieChart && (
              <span style={{ color: item.color }}>{item.payload.name}:</span>
            )}

            <span
              className={twMerge('font-mono', isValueOnly && 'text-lg')}
              style={{ color: item.color }}
            >
              {format === 'currency'
                ? formatPriceInfo(Number(item.value), precision, precision)
                : format === 'percentage'
                  ? formatPercentage(Number(item.value), precision)
                  : formatNumber(Number(item.value), precision)}

              {suffix}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
