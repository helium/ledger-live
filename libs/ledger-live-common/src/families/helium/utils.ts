import { encodeAccountId } from "../../account";
import { GetAccountShape } from "../../bridge/jsHelpers";
import { getAccount, getOperations } from "./api";
import Address, { NetTypes as NetType } from "@helium/address";
import {
  HELIUM_API_ENDPOINT,
  HELIUM_DEVNET_API_ENDPOINT,
  HELIUM_TESTNET_API_ENDPOINT,
  TESTNET,
  MEMO_MAX_BYTES,
} from "./constants";
import { TokenAccount } from "@ledgerhq/types-live";
import { findTokenById } from "../../currencies";
import BigNumber from "bignumber.js";

export const assertUnreachable = (): never => {
  throw new Error("unreachable assertion failed");
};

/**
 *
 * @param currencyId
 * @returns helium api endpoint.
 */
export function endpointByCurrencyId(currencyId: string): string {
  const endpoints: Record<string, string> = {
    helium: HELIUM_API_ENDPOINT,
    helium_devnet: HELIUM_DEVNET_API_ENDPOINT,
    helium_testnet: HELIUM_TESTNET_API_ENDPOINT,
  };

  if (!currencyId) {
    return endpoints.helium;
  }

  if (currencyId in endpoints) {
    return endpoints[currencyId];
  }

  throw Error(
    `unexpected currency id format <${currencyId}>, should be like helium[_(testnet | devnet)]`
  );
}

/**
 *
 * @param info
 * @returns
 */
export const getAccountShape: GetAccountShape = async (info) => {
  const { balance, blockHeight, validators, mobileBalance } = await getAccount(
    info.address,
    info.currency
  );
  const operations = await getOperations(info.address, info.currency);

  info.initialAccount?.subAccounts;

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
    spendableBalance: balance,
    operations,
    operationsCount: operations.length,
    blockHeight,
    subAccounts: [
      // addSubAccount(accountId, mobileBalance, operations, "mobile"),
    ],
    heliumResources: {
      stakes: validators,
    },
  };
};

export const addSubAccount = (
  parentId: string,
  tokenBalance: BigNumber,
  operations: any[],
  tokenName: string
): TokenAccount => {
  const token = findTokenById(`helium/asset/${tokenName}`);

  const id = `${parentId}+${tokenName}`;

  if (!token) {
    throw Error(`unexpected token name <${tokenName}>`);
  }

  return {
    type: "TokenAccount",
    id,
    starred: false,
    // id of the parent account this token account belongs to
    parentId,
    balance: tokenBalance,
    creationDate: new Date(),
    operations: operations.filter((op) => op.currency === token),
    operationsCount: operations.length,
    pendingOperations: [],
    token,
    spendableBalance: tokenBalance,
    balanceHistoryCache: {
      HOUR: {
        latestDate: null,
        balances: [],
      },
      DAY: {
        latestDate: null,
        balances: [],
      },
      WEEK: {
        latestDate: null,
        balances: [],
      },
    },
    // Swap operations linked to this account
    swapHistory: [],
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
export const getMemoStrValid = (memoStr?: string): boolean => {
  const base64Memo = encodeMemoString(memoStr);
  if (!base64Memo) {
    return true;
  }
  const buff = Buffer.from(base64Memo, "base64");
  const size = buff.byteLength;
  return size <= MEMO_MAX_BYTES;
};
