import { Connection } from '@solana/web3.js';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { addNotification } from '@/utils';

import Button from '../common/Button/Button';
import Switch from '../common/Switch/Switch';
import InfoAnnotation from '../pages/monitoring/InfoAnnotation';

export default function RPCSettings({
  activeRpc,
  rpcInfos,
  autoRpcMode,
  customRpcLatency,
  customRpcUrl,
  favoriteRpc,
  setAutoRpcMode,
  setCustomRpcUrl,
  setFavoriteRpc,
}: {
  activeRpc: {
    name: string;
    connection: Connection;
  };
  rpcInfos: {
    name: string;
    latency: number | null;
  }[];
  customRpcLatency: number | null;
  autoRpcMode: boolean;
  customRpcUrl: string | null;
  favoriteRpc: string | null;
  setAutoRpcMode: (autoRpcMode: boolean) => void;
  setCustomRpcUrl: (customRpcUrl: string | null) => void;
  setFavoriteRpc: (favoriteRpc: string) => void;
}) {
  const [editCustomRpcUrl, setEditCustomRpcUrl] = useState<string | null>(
    customRpcUrl,
  );

  return (
    <div>
      <div className="flex mb-3">
        {window.adrena.cluster === 'devnet' ? (
          <h2 className="text-blue-500 pr-1">Devnet</h2>
        ) : null}
        <h2 className="flex">RPC endpoints</h2>
      </div>

      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-1 items-center">
          <p className="font-medium">Automatic switch</p>
          <InfoAnnotation
            text={
              <p>
                Automatically selects the best RPC endpoint based on latency
              </p>
            }
            className="w-3"
          />
        </div>

        <Switch
          checked={autoRpcMode}
          onChange={() => {
            setAutoRpcMode(!autoRpcMode);

            addNotification({
              title: `Automatic switch ${autoRpcMode ? 'disabled' : 'enabled'}`,
              duration: 'fast',
            });
          }}
        />
      </div>

      <div className="w-full h-[1px] bg-bcolor my-3" />

      <div className="w-full flex mb-2">
        <div className="text-xs text-gray-500">Preferred</div>
        <div className="text-xs text-gray-500 ml-auto">Latency</div>
      </div>

      <ul
        className={twMerge(
          'flex flex-col gap-2 opacity-100 transition-opacity duration-300',
          autoRpcMode && 'opacity-30 pointer-events-none',
        )}
      >
        {[
          ...rpcInfos,
          {
            name: 'Custom RPC',
            latency: customRpcLatency,
          },
        ]?.map((rpc) => (
          <li className="flex flex-row flex-wrap" key={rpc.name}>
            <div
              className="w-full flex justify-between items-center cursor-pointer"
              onClick={() => {
                setFavoriteRpc(rpc.name);
              }}
            >
              <div className="flex flex-row gap-2 items-center">
                <div className="w-10 flex items-center justify-center">
                  <input
                    type="radio"
                    checked={rpc.name === favoriteRpc}
                    onChange={() => {
                      // Handle the click on the level above
                    }}
                    className="cursor-pointer"
                  />
                </div>

                <p
                  className={twMerge(
                    'text-sm font-medium opacity-50 transition-opacity duration-300 hover:opacity-100',
                    rpc.name === favoriteRpc && 'opacity-100',
                  )}
                >
                  {rpc.name}
                </p>

                {activeRpc.name === rpc.name ? (
                  <p className="opacity-50">active</p>
                ) : null}
              </div>

              {rpc.latency !== null ? (
                <div className="flex flex-row gap-1 items-center">
                  <div
                    className={twMerge(
                      'w-[5px] h-[5px] rounded-full',
                      (() => {
                        if (rpc.latency && rpc.latency < 100) return 'bg-green';
                        if (rpc.latency && rpc.latency < 500)
                          return 'bg-orange';
                        return 'bg-red';
                      })(),
                    )}
                  />
                  <p className="text-xs opacity-50 font-mono">
                    {rpc.latency}ms
                  </p>
                </div>
              ) : (
                <div className="text-gray-600 mr-4 text-sm">-</div>
              )}
            </div>

            {rpc.name === 'Custom RPC' ? (
              <div className="flex flex-row gap-2 items-center w-full mt-2">
                <div
                  className={twMerge(
                    'relative w-full  bg-black border border-bcolor rounded-lg overflow-hidden transition duration-300',
                  )}
                >
                  <input
                    type="text"
                    value={editCustomRpcUrl ?? ''}
                    onChange={(e) => {
                      setEditCustomRpcUrl(e.target.value);
                    }}
                    className={twMerge(
                      'w-full h-[40px] p-1 px-3 max-w-[195px] text-ellipsis text-sm bg-black transition duration-300',
                    )}
                    placeholder="Custom RPC URL"
                  />

                  <Button
                    title="Save"
                    disabled={customRpcUrl === editCustomRpcUrl}
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setCustomRpcUrl(editCustomRpcUrl);
                    }}
                    className={twMerge(
                      'text-xs absolute right-2 top-[8px] p-1 px-2 rounded-md',
                    )}
                  />
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}