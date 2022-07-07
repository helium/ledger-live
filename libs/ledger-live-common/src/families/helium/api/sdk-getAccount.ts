import BigNumber from "bignumber.js";
import { isTestnet } from "../utils";
import { fetch } from "./sdk";
import { Account, AccountHTTP } from "./sdk.types";

/**
 * Get account balances and nonce.
 * @param address
 * @returns
 */
const getAccount = async (address: string): Promise<Account> => {
  const { data: account }: { data: AccountHTTP } = await fetch(
    `/accounts/${address}`,
    isTestnet(address)
  );

  return {
    stakedBalance: new BigNumber(account.staked_balance),
    speculativeSecNonce: account.speculative_sec_nonce,
    speculativeNonce: account.speculative_nonce,
    secNonce: account.sec_nonce,
    secBalance: new BigNumber(account.sec_balance),
    nonce: account.nonce,
    dcNonce: account.dc_nonce,
    dcBalance: new BigNumber(account.dc_balance),
    blockHeight: account.block,
    balance: new BigNumber(account.balance),
    address: account.address,
  };
};

export default getAccount;
