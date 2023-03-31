import { twMerge } from "tailwind-merge";
import Button from "@/components/Button/Button";
import { useSelector } from "@/store/store";
import { formatNumber, formatPriceInfo, nativeToUi } from "@/utils";
import { PositionExtended } from "@/types";

export default function PositionsArray({
  className,
  positions,
  triggerReduceOrClosePosition,
}: {
  className?: string;
  positions: PositionExtended[] | null;
  triggerReduceOrClosePosition: (p: PositionExtended) => void;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const columnStyle = "flex min-w-[5em] w-20 grow shrink-0 items-center";

  return (
    <div
      className={twMerge(
        "bg-secondary",
        "border",
        "border-grey",
        "flex",
        "flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="flex pb-4 border-b border-grey w-full p-4">
        {[
          "Position",
          "Net Value",
          "Size",
          "Collateral",
          "Entry Price",
          "Mark Price",
          "Liq. Price",
        ].map((text) => (
          <div key={text} className={`${columnStyle} text-txtfade`}>
            {text}
          </div>
        ))}

        <div className="w-16">{/* Space for close action*/}</div>
      </div>

      {/* Content */}
      <div className="flex flex-col w-full bg-secondary">
        {!positions?.length ? (
          <div className="mt-5 mb-5 ml-auto mr-auto">No opened position</div>
        ) : null}

        {positions?.map((position) => (
          <div
            key={position.pubkey.toBase58()}
            className="flex pb-4 border-b border-grey w-full p-4"
          >
            <div
              className={twMerge(
                columnStyle,
                "flex-col",
                "justify-center",
                "items-start"
              )}
            >
              <div>{position.token.name}</div>

              <div className="flex">
                <div>{formatNumber(position.leverage, 2)}x</div>
                <div
                  className={twMerge(
                    "ml-1",
                    "capitalize",
                    position.side === "long" ? "text-green-400" : "text-red-400"
                  )}
                >
                  {position.side}
                </div>
              </div>
            </div>

            <div className={columnStyle}>
              {!position.pnl ? "-" : null}

              {position.pnl && !position.pnl.profit.isZero() ? (
                <span className="text-green-400">
                  {formatPriceInfo(nativeToUi(position.pnl.profit, 6))}
                </span>
              ) : null}

              {position.pnl && !position.pnl.loss.isZero() ? (
                <span className="text-red-400">
                  {formatPriceInfo(nativeToUi(position.pnl.loss, 6) * -1)}
                </span>
              ) : null}
            </div>

            <div className={columnStyle}>
              {formatPriceInfo(nativeToUi(position.sizeUsd, 6))}
            </div>

            <div className={columnStyle}>
              {formatPriceInfo(nativeToUi(position.collateralUsd, 6))}
            </div>

            <div className={columnStyle}>
              {formatPriceInfo(nativeToUi(position.price, 6))}
            </div>

            <div className={columnStyle}>
              {tokenPrices[position.token.name]
                ? formatPriceInfo(tokenPrices[position.token.name]!)
                : "-"}
            </div>

            <div className={columnStyle}>
              {position.liquidationPrice
                ? formatPriceInfo(nativeToUi(position.liquidationPrice, 6))
                : "-"}
            </div>

            <Button
              className="w-16 border-0 text-txtfade hover:text-txtregular"
              title={
                <div className="flex flex-col justify-center items-center text-sm">
                  <div>Reduce</div>
                  <div className="flex justify-center items-center">
                    <div className="w-full h-[1px] bg-grey shrink-0" />
                    <div className="text-txtfade ml-1 mr-1">or</div>
                    <div className="w-full h-[1px] bg-grey shrink-0" />
                  </div>
                  <div>Close</div>
                </div>
              }
              onClick={() => {
                triggerReduceOrClosePosition(position);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
