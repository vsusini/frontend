import Image from 'next/image';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useSelector } from '@/store/store';
import { CustodyExtended, PoolExtended } from '@/types';
import { formatNumber, formatPriceInfo, nativeToUi } from '@/utils';

import NumberInfo from '../NumberInfo';
import Table from '../Table';

export default function TradingView({
  mainPool,
  custodies,
}: {
  mainPool: PoolExtended;
  custodies: CustodyExtended[];
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const isBreakpoint = useBetterMediaQuery('(min-width: 800px)');

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-6 w-full">
        <StyledContainer
          headerClassName="text-center justify-center"
          title="POSITIONS NOW"
        >
          <StyledSubContainer>
            <div className="flex items-center">
              <h2>Position count</h2>
              <div className="font-boldy text-sm ml-2 text-txtfade">
                Long / Short
              </div>
            </div>

            <StyledSubSubContainer className="mt-2 flex-col">
              <h2>
                {formatNumber(mainPool.nbOpenLongPositions, 2)} /{' '}
                {formatNumber(mainPool.nbOpenShortPositions, 2)}
              </h2>
            </StyledSubSubContainer>
          </StyledSubContainer>

          <StyledSubContainer>
            <div className="flex items-center">
              <h2>Open Interest</h2>
              <div className="font-boldy text-sm ml-2 text-txtfade">
                Long / Short
              </div>
            </div>

            <StyledSubSubContainer className="mt-2 flex-col">
              <h2>
                {formatPriceInfo(mainPool.longPositions)} /{' '}
                {formatPriceInfo(mainPool.shortPositions)}
              </h2>
            </StyledSubSubContainer>
          </StyledSubContainer>
        </StyledContainer>

        <StyledContainer
          headerClassName="text-center justify-center"
          title="ALL TIME POSITIONS"
        >
          <StyledSubContainer>
            <div className="flex items-center">
              <h2>Open Interest</h2>
              <div className="font-boldy text-sm ml-2 text-txtfade">
                Long / Short
              </div>
            </div>

            <StyledSubSubContainer className="mt-2">
              <h2>
                {formatPriceInfo(mainPool.oiLongUsd)} /{' '}
                {formatPriceInfo(mainPool.oiShortUsd)}
              </h2>
            </StyledSubSubContainer>
          </StyledSubContainer>

          <StyledSubContainer>
            <div className="flex items-center">
              <h2>Profits and Losses</h2>
            </div>

            <StyledSubSubContainer className="mt-2">
              <h2>
                {formatPriceInfo(mainPool.profitsUsd)} /{' '}
                {formatPriceInfo(mainPool.lossUsd * -1)}
              </h2>
            </StyledSubSubContainer>
          </StyledSubContainer>
        </StyledContainer>
      </div>

      <StyledContainer
        title={<h1>POSITIONS NOW BREAKDOWN</h1>}
        className="w-full grow"
      >
        <Table
          isBreakpoint={isBreakpoint}
          rowTitleWidth="20%"
          columnsTitles={['Long', 'Short']}
          data={[
            ...custodies
              .filter((custody) => !custody.isStable)
              .map((custody) => ({
                rowTitle: (
                  <div className="flex items-center">
                    <Image
                      src={custody.tokenInfo.image}
                      alt="token icon"
                      width="16"
                      height="16"
                    />
                    <span className="ml-1 text-base">
                      {custody.tokenInfo.name}
                    </span>
                  </div>
                ),
                values: [
                  <div key="long" className="flex flex-col">
                    <NumberInfo
                      value={nativeToUi(
                        custody.nativeObject.tradeStats.oiLongUsd,
                        custody.decimals,
                      )}
                      denomination={custody.tokenInfo.symbol}
                      precision={custody.decimals}
                    />

                    {tokenPrices[custody.tokenInfo.symbol] ? (
                      <NumberInfo
                        value={
                          nativeToUi(
                            custody.nativeObject.tradeStats.oiLongUsd,
                            custody.decimals,
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                          ) * tokenPrices[custody.tokenInfo.symbol]!
                        }
                      />
                    ) : null}
                  </div>,

                  <div key="short" className="flex flex-col">
                    <NumberInfo
                      value={nativeToUi(
                        custody.nativeObject.tradeStats.oiShortUsd,
                        custody.decimals,
                      )}
                      denomination={custody.tokenInfo.symbol}
                      precision={custody.decimals}
                    />

                    {tokenPrices[custody.tokenInfo.symbol] ? (
                      <NumberInfo
                        value={
                          nativeToUi(
                            custody.nativeObject.tradeStats.oiShortUsd,
                            custody.decimals,
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                          ) * tokenPrices[custody.tokenInfo.symbol]!
                        }
                      />
                    ) : null}
                  </div>,
                ],
              })),
          ]}
        />
      </StyledContainer>
    </>
  );
}
