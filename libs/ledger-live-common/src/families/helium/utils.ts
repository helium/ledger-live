import { encodeAccountId } from "../../account";
import { GetAccountShape } from "../../bridge/jsHelpers";
import { getAccount, getOperations } from "./api";
import Address, { NetTypes as NetType } from "@helium/address";
import {
  HELIUM_API_ENDPOINT,
  HELIUM_TESTNET_API_ENDPOINT,
  TESTNET,
  MEMO_MAX_BYTES,
} from "./constants";

/**
 *
 * @param info
 * @returns
 */
export const getAccountShape: GetAccountShape = async (info) => {
  const { balance, blockHeight } = await getAccount(info.address);
  const operations = await getOperations(info.address);

  const accountId = encodeAccountId({
    type: "js",
    version: "2",
    currencyId: info.currency.id,
    xpubOrAddress: info.address,
    derivationMode: info.derivationMode,
  });

  return {
    id: accountId,
    balance,
    operations,
    operationsCount: operations.length,
    blockHeight,
  };
};

/**
 *
 * @param address
 * @returns address net type.
 */
export const accountNetType = (address?: string): number => {
  if (!address || !Address.isValid(address)) return NetType.MAINNET;
  return Address.fromB58(address)?.netType;
};

/**
 *
 * @param address
 * @returns true if address is a testnet account.
 */
export const isTestnet = (address: string): boolean => {
  return accountNetType(address) === TESTNET;
};

/**
 *
 * @param isTestnet
 * @returns Mainet or Testnet root url for helium API
 */
export const getRootUrl = (isTestnet: boolean): string => {
  return !isTestnet ? HELIUM_API_ENDPOINT : HELIUM_TESTNET_API_ENDPOINT;
};

/**
 *
 * @param utf8Input
 * @returns base64 string
 */
export const encodeMemoString = (
  utf8Input: string | undefined
): string | undefined => {
  if (!utf8Input) return undefined;
  const buff = Buffer.from(utf8Input, "utf8");
  return buff.toString("base64");
};

/**
 *
 * @param memoStr
 * @returns true if memo is valid
 */
export const getMemoStrValid = (memoStr: string): boolean => {
  const base64Memo = encodeMemoString(memoStr);
  if (!base64Memo) {
    return true;
  }
  const buff = Buffer.from(base64Memo, "base64");
  const size = buff.byteLength;
  return size <= MEMO_MAX_BYTES;
};
