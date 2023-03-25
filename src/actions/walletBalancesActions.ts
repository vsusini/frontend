import { TokenName } from "@/types";
import { Dispatch } from "@reduxjs/toolkit";

export type SetTokenBalancesAction = {
  type: "setTokenBalances";
  payload: Record<TokenName, number | null> | null;
};

export type WalletBalancesAction = SetTokenBalancesAction;

export const setWalletTokenBalancesAction =
  (balances: Record<TokenName, number | null> | null) =>
  async (dispatch: Dispatch<SetTokenBalancesAction>) => {
    dispatch({
      type: "setTokenBalances",
      payload: balances,
    });
  };
