import { useEffect, useRef, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";

import TabSelect from "@/components/TabSelect/TabSelect";
import useListenToPythTokenPricesChange from "@/hooks/useListenToPythTokenPricesChange";
import { Token } from "@/types";
import useWatchWalletBalance from "@/hooks/useWatchWalletBalance";
import TradingInputs from "@/components/trading/TradingInputs/TradingInputs";
import Button from "@/components/Button/Button";
import WalletAdapter from "@/components/WalletAdapter/WalletAdapter";
import { useSelector } from "@/store/store";
import TradingChart from "@/components/trading/TradingChart/TradingChart";
import SwapDetails from "@/components/trading/SwapDetails/SwapDetails";
import PositionDetails from "@/components/trading/PositionDetails/PositionDetails";
import useAdrenaClient from "@/hooks/useAdrenaClient";
import { uiToNative } from "@/utils";

import styles from "./index.module.scss";
import Positions from "@/components/trading/Positions/Positions";
import TradingChartHeader from "@/components/trading/TradingChartHeader/TradingChartHeader";
import usePositions from "@/hooks/usePositions";

type Action = "long" | "short" | "swap";

export default function Trade() {
  useListenToPythTokenPricesChange();
  useWatchWalletBalance();

  const client = useAdrenaClient();
  const [selectedAction, setSelectedAction] = useState<Action>("long");
  const walletAdapterRef = useRef<HTMLDivElement>(null);
  const wallet = useSelector((s) => s.wallet);
  const connected = !!wallet;
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const positions = usePositions();

  const [inputAValue, setInputAValue] = useState<number | null>(null);
  const [inputBValue, setInputBValue] = useState<number | null>(null);
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);

  // Unused for now
  const [leverage, setLeverage] = useState<number | null>(null);

  // Setup
  useEffect(() => {
    if (!client) return;

    if (!tokenA) {
      setTokenA(client.tokens[0]);
    }

    if (!tokenB) {
      setTokenB(
        selectedAction === "swap"
          ? client.tokens[0]
          : client.tokens.filter((t) => !t.isStable)[0]
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Only call when the user get initialized or we change of action
    client,
    selectedAction,
  ]);

  const handleExecuteButton = async () => {
    if (!connected || !client) {
      walletAdapterRef.current?.click();
      return;
    }

    if (
      !tokenA ||
      !tokenB ||
      !tokenPrices[tokenB.name] ||
      !inputAValue ||
      !inputBValue ||
      !leverage
    ) {
      console.log("Missing data to open position");
      return;
    }

    if (selectedAction === "swap") {
      return client.swap({
        owner: new PublicKey(wallet.walletAddress),
        amountIn: uiToNative(inputAValue, 6),

        // TODO
        // How to handle slippage?
        // the inputBValue should take fees into account, for now it doesn't.
        minAmountOut: new BN(0),
        mintA: tokenA.mint,
        mintB: tokenB.mint,
      });
    }

    return client.openPositionWithSwap({
      owner: new PublicKey(wallet.walletAddress),
      mintA: tokenA.mint,
      mintB: tokenA.mint,
      amountA: uiToNative(inputAValue, 6),
      price: uiToNative(tokenPrices[tokenB.name]!, 6),
      collateral: uiToNative(inputBValue, 6).div(new BN(leverage)),
      size: uiToNative(inputBValue, 6),
      side: selectedAction,
    });
  };

  const buttonTitle = (() => {
    // If wallet not connected, then user need to connect wallet
    if (!connected) {
      return "Connect wallet";
    }

    if (inputAValue === null || inputBValue === null) {
      return "Enter an amount";
    }

    // Loading, should happens quickly
    if (!tokenA) {
      return "...";
    }

    const walletTokenABalance = walletTokenBalances?.[tokenA.name];

    // Loading, should happens quickly
    if (typeof walletTokenABalance === "undefined") {
      return "...";
    }

    // If user wallet balance doesn't have enough tokens, tell user
    if (!walletTokenABalance || inputAValue > walletTokenABalance) {
      return `Insufficient ${tokenA.name} balance`;
    }

    return "Execute";
  })();

  return (
    <div className={styles.trade}>
      <div className={styles.trade__view}>
        {/* Trading chart header */}
        {client && tokenB ? (
          <TradingChartHeader
            className={styles.trade__view_header}
            tokenList={
              selectedAction === "short" || selectedAction === "long"
                ? client.tokens.filter((t) => !t.isStable)
                : client.tokens
            }
            selected={tokenB}
            onChange={(t: Token) => {
              console.log("SetTokenB", t);
              setTokenB(t);
            }}
          />
        ) : null}

        <div className={styles.trade__view_trading}>
          {/* Display trading chart for appropriate token */}
          {tokenA && tokenB ? (
            <>
              {selectedAction === "short" || selectedAction === "long" ? (
                <TradingChart token={tokenB} />
              ) : null}

              {selectedAction === "swap" ? (
                <TradingChart token={tokenA.isStable ? tokenB : tokenA} />
              ) : null}
            </>
          ) : null}
        </div>

        <>
          {positions ? (
            <>
              <div className={styles.trade__view_trading_position}>
                Positions ({positions.length})
              </div>

              <Positions
                className={styles.trade__view_positions}
                positions={positions}
              />
            </>
          ) : null}
        </>
      </div>

      <div className={styles.trade__panel}>
        <TabSelect
          selected={selectedAction}
          tabs={[
            { title: "long", icon: "/images/long.svg" },
            { title: "short", icon: "/images/short.svg" },
            { title: "swap", icon: "/images/swap.svg" },
          ]}
          onClick={(title, _: number) => {
            setSelectedAction(title);
          }}
        />

        {client && client.tokens.length && tokenA && tokenB && (
          <>
            <TradingInputs
              className={styles.trade__panel_trading_inputs}
              actionType={selectedAction}
              allowedTokenA={client.tokens}
              allowedTokenB={
                selectedAction === "swap"
                  ? client.tokens
                  : client.tokens.filter((t) => !t.isStable)
              }
              tokenA={tokenA}
              tokenB={tokenB}
              onChangeInputA={setInputAValue}
              onChangeInputB={setInputBValue}
              setTokenA={setTokenA}
              setTokenB={setTokenB}
              onChangeLeverage={setLeverage}
            />
          </>
        )}

        {/* Button to execute action */}
        <>
          <Button
            className={styles.trade__panel_execute_btn}
            title={buttonTitle}
            onClick={handleExecuteButton}
          />

          {/* to handle wallet connection, create an hidden wallet adapter */}
          <WalletAdapter
            className={styles.trade__panel_wallet_adapter}
            ref={walletAdapterRef}
          />
        </>

        {/* Position details */}
        <>
          <div className={styles.trade__panel_details}>
            <div className={styles.trade__panel_details_title}>
              <span>{selectedAction}</span>

              {selectedAction === "short" || selectedAction === "long" ? (
                <span>{tokenB?.name ?? "-"}</span>
              ) : null}
            </div>

            {tokenA && tokenB ? (
              <>
                {selectedAction === "short" || selectedAction === "long" ? (
                  <PositionDetails
                    tokenB={tokenB}
                    entryPrice={
                      tokenB &&
                      inputBValue &&
                      tokenPrices &&
                      tokenPrices[tokenB.name]
                        ? tokenPrices[tokenB.name]
                        : null
                    }
                    exitPrice={
                      tokenB &&
                      inputBValue &&
                      tokenPrices &&
                      tokenPrices[tokenB.name]
                        ? tokenPrices[tokenB.name]
                        : null
                    }
                  />
                ) : (
                  <SwapDetails tokenA={tokenA} tokenB={tokenB} />
                )}
              </>
            ) : null}
          </div>
        </>
      </div>
    </div>
  );
}
