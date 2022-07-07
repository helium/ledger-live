import { makeScanAccounts } from "../../../bridge/jsHelpers";
import { CurrencyBridge } from "../../../types";
import { getAccountShape } from "../utils";

const scanAccounts = makeScanAccounts({ getAccountShape });

export const currencyBridge: CurrencyBridge = {
  // TODO: Preload validator data
  preload: () => Promise.resolve({}),
  hydrate: () => {},
  scanAccounts,
};
