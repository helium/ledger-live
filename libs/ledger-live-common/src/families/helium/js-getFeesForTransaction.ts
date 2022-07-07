import { BigNumber } from "bignumber.js";
import type { Account } from "../../types";
import { getFees } from "./api";
import type { Transaction } from "./types";
import { isTestnet } from "./utils";

const getEstimatedFees = async ({
  a,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  t,
}: {
  a: Account;
  t: Transaction;
}): Promise<BigNumber> => {
  const { estHnt } = await getFees("payment_v2", isTestnet(a.freshAddress));
  return estHnt;
};

export default getEstimatedFees;
