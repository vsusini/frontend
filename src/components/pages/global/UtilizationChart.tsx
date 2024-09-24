import React, { useEffect, useState } from 'react';

import LineRechartPercentage from './LineRechartPercentage';

export default function UtilizationChart() {
  const [infos, setInfos] = useState<{
    formattedData: (
      | {
          time: string;
        }
      | { [key: string]: number }
    )[];

    custodiesColors: string[];
  } | null>(null);

  useEffect(() => {
    getCustodyInfo();
  }, []);

  const getCustodyInfo = async () => {
    try {
      const res = await fetch(
        'https://datapi.adrena.xyz/custodyinfo?owned=true&locked=true',
      );
      const { data } = await res.json();
      const { owned, locked, snapshot_timestamp } = data as {
        owned: { [key: string]: string[] };
        locked: { [key: string]: string[] };
        snapshot_timestamp: string[];
      };

      const timeStamp = snapshot_timestamp.map((time: string) =>
        new Date(time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
        }),
      );

      // Each custody keeps an utilization array
      const infos = window.adrena.client.custodies.map((c) => ({
        custody: c,
        values: [] as number[],
      }));

      for (const [custodyKey, ownedValues] of Object.entries(owned)) {
        const custodyInfos = infos.find(
          ({ custody }) => custody.pubkey.toBase58() === custodyKey,
        );

        if (!custodyInfos) continue;

        ownedValues.forEach((ownedValue: string, i: number) => {
          const ownedNb = parseInt(ownedValue, 10);
          const lockedNb = parseInt(locked[custodyKey][i], 10);

          custodyInfos.values.push(ownedNb ? (lockedNb * 100) / ownedNb : 0);
        });
      }

      const formatted = timeStamp.map((time: string, i: number) => ({
        time,
        ...infos.reduce(
          (acc, { custody, values }) => ({
            ...acc,
            [custody.tokenInfo.symbol]: values[i],
          }),
          {} as { [key: string]: number },
        ),
      }));

      setInfos({
        formattedData: formatted,
        custodiesColors: infos.map(({ custody }) => custody.tokenInfo.color),
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!infos) return <div>Loading...</div>;

  return (
    <LineRechartPercentage
      title="Utilization"
      data={infos.formattedData}
      labels={Object.keys(infos.formattedData[0])
        .filter((key) => key !== 'time')
        .map((x, i) => {
          return {
            name: x,
            color: infos.custodiesColors[i],
          };
        })}
    />
  );
}
