import TabSelect from "@/components/TabSelect/TabSelect";
import LongPositionInputs from "@/components/LongPositionInputs/LongPositionInputs";
import useListenToPythTokenPricesChange from "@/hooks/useListenToPythTokenPricesChange";
import { NonStableToken, Token } from "@/types";
import { useState } from "react";
import styles from "./index.module.scss";

type State = "long" | "short" | "swap";

export default function Trade() {
  useListenToPythTokenPricesChange();

  const [selectedTab, setSelectedTab] = useState<State>("long");

  return (
    <div className={styles.trade}>
      <div className={styles.trade__tradingview}></div>

      <div className={styles.trade__panel}>
        <TabSelect
          selected={selectedTab}
          tabs={[
            { title: "long", icon: "/images/long.svg" },
            { title: "short", icon: "/images/short.svg" },
            { title: "swap", icon: "/images/swap.svg" },
          ]}
          onClick={(title, _: number) => {
            setSelectedTab(title);
          }}
        />

        {selectedTab === "long" ? (
          <LongPositionInputs
            allowedTokenA={["ETH", "BTC", "SOL"] as NonStableToken[]}
            allowedTokenB={["ETH", "BTC", "SOL", "USDC"] as Token[]}
          />
        ) : null}

        {selectedTab === "short" ? <></> : null}

        {selectedTab === "swap" ? <></> : null}
      </div>
    </div>
  );
}
