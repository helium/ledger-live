import Address from "@helium/address";
import { getAccount } from "./api";

/**
 *
 * @param address
 * @returns true if address is valid
 */
export const isValidAddress = (address: string): boolean => {
  return Address.isValid(address);
};

/**
 *
 * @param address
 * @returns
 */
export const getNonce = async (address: string): Promise<number> => {
  const account = await getAccount(address);
  return account.speculativeNonce + 1;
};
