import React, { useCallback, useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import AreaRechart from '@/components/ReCharts/AreaRecharts';
import { RechartsData } from '@/types';
import { getGMT } from '@/utils';

export default function AumChart() {
  const [chartData, setChartData] = useState<RechartsData[] | null>(null);
  const [period, setPeriod] = useState<string | null>('7d');
  const periodRef = useRef(period);

  useEffect(() => {
    periodRef.current = period;
    getPoolInfo();
  }, [period]);

  const getPoolInfo = async () => {
    try {
      const dataEndpoint = (() => {
        switch (periodRef.current) {
          case '1d':
            return 'poolinfo';
          case '7d':
            return 'poolinfohourly';
          case '1M':
            return 'poolinfodaily';
          default:
            return 'poolinfo';
        }
      })();

      const dataPeriod = (() => {
        switch (periodRef.current) {
          case '1d':
            return 1;
          case '7d':
            return 7;
          case '1M':
            return 31;
          default:
            return 1;
        }
      })();

      const res = await fetch(
        `https://datapi.adrena.xyz/${dataEndpoint}?aum_usd=true&start_date=${(() => {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - dataPeriod);

          return startDate.toISOString();
        })()}&end_date=${new Date().toISOString()}`,
      );

      const { data } = await res.json();
      const { aum_usd, snapshot_timestamp } = data;

      const timeStamp = snapshot_timestamp.map((time: string) => {
        if (periodRef.current === '1d') {
          return new Date(time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
          });
        }

        if (periodRef.current === '7d') {
          return new Date(time).toLocaleString('en-US', {
            day: 'numeric',
            month: 'numeric',
            hour: 'numeric',
          });
        }

        if (periodRef.current === '1M') {
          return new Date(time).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'numeric',
            timeZone: 'UTC',
          });
        }

        throw new Error('Invalid period');
      });

      const formattedData = aum_usd.map((aum: number, i: string | number) => ({
        time: timeStamp[i],
        value: aum,
      }));

      setChartData(formattedData);
    } catch (e) {
      console.error(e);
    }
  };


  useEffect(() => {
    getPoolInfo();

    const interval = setInterval(() => {
      getPoolInfo();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!chartData) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  return (
    <AreaRechart
      title={'AUM'}
      subValue={chartData[chartData.length - 1].value as number}
      data={chartData}
      labels={[{ name: 'value' }]}
      period={period}
      gmt={period === '1M' ? 0 : getGMT()}
      setPeriod={setPeriod}
      domain={['dataMin', 'dataMax']}
    />
  );
}
