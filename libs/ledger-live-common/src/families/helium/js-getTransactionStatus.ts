import { BigNumber } from "bignumber.js";
import {
  NotEnoughBalance,
  RecipientRequired,
  InvalidAddressBecauseDestinationIsAlsoSource,
  InvalidAddress,
  FeeNotLoaded,
  AmountRequired,
} from "@ledgerhq/errors";
import type { Account, TransactionStatus } from "../../types";
import type { Transaction } from "./types";
import { isValidAddress } from "./logic";
import { getMemoStrValid } from "./utils";
import { HeliumMemoTooLong } from "./errors";
/**
 * Here are the list of the differents things we check
 * - Check if recipient is the same in case of send
 * - Check if recipient is valid
 * - Check if amounts are set
 * - Check if fees are loaded
 * - Check if memo is too long
 * @param a account
 * @param t transaction
 * @returns transaction status object
 */
const getTransactionStatus = async (
  a: Account,
  t: Transaction
): Promise<TransactionStatus> => {
  const errors: Record<string, Error> = {};
  const warnings: Record<string, Error> = {};
  const useAllAmount = !!t.useAllAmount;

  const estimatedFees = t.fees || new BigNumber(0);

  const totalSpent = useAllAmount
    ? a.balance
    : new BigNumber(t.amount).plus(estimatedFees);

  const amount = useAllAmount
    ? a.balance.minus(estimatedFees)
    : new BigNumber(t.amount);

  if (totalSpent.gt(a.balance)) {
    errors.amount = new NotEnoughBalance();
  }

  if (!t.recipient) {
    errors.recipient = new RecipientRequired();
  } else if (!isValidAddress(t.recipient)) {
    errors.recipient = new InvalidAddress();
  } else if (t.mode === "send" && a.freshAddress === t.recipient) {
    errors.recipient = new InvalidAddressBecauseDestinationIsAlsoSource();
  }

  if (t.amount.lte(0) && !t.useAllAmount) {
    errors.amount = new AmountRequired();
  }

  if (!t.fees) {
    errors.fees = new FeeNotLoaded();
  }

  const memo = t.memo;

  if (memo && !getMemoStrValid(memo)) {
    errors.memo = new HeliumMemoTooLong();

    // LLM expects <transaction> as error key to disable continue button
    errors.transaction = errors.memo;
  }

  return Promise.resolve({
    errors,
    warnings,
    estimatedFees,
    amount,
    totalSpent,
  });
};

export default getTransactionStatus;
