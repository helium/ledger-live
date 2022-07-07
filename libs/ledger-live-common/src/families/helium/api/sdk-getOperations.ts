import BigNumber from "bignumber.js";
import { PaymentV1, PaymentV2 } from "./sdk.types";
import { fetchAll } from "./sdk";
import { Operation } from "../../../types";
import { isTestnet } from "../utils";

const supportedTypes = ["payment_v1", "payment_v2"];

/**
 * Parse thorugh transaction.
 * @param txn transaction
 * @param accountAddress address making transaction
 * @returns
 */
const parseTxn = (txn: any, accountAddress: string) => {
  switch (txn.type) {
    case "payment_v1":
      return parsePaymentV1(txn, accountAddress);

    case "payment_v2":
      return parsePaymentV2(txn, accountAddress);

    default:
      throw new Error("Unknown txn type");
  }
};

/**
 * Sums up all big numbers.
 * @param numbers
 * @returns sum of all numbers.
 */
const bigNumberSum = (numbers: BigNumber[]) =>
  numbers.reduce((sum, number) => sum.plus(number), new BigNumber(0));

/**
 * Parse PaymentV1 Transaction.
 * @param txn transaction
 * @param accountAddress address making transaction
 * @returns transaction object.
 */
const parsePaymentV1 = (txn: PaymentV1, accountAddress: string) => {
  return {
    id: txn.hash,
    hash: txn.hash,
    type: txn.payer === accountAddress ? "OUT" : "IN",
    value: new BigNumber(txn.amount),
    fee: new BigNumber(txn.fee), // TODO convert DC to HNT
    senders: [txn.payer],
    recipients: [txn.payee],
    blockHeight: txn.height,
    blockHash: txn.height.toString(),
    transactionSequenceNumber: txn.nonce,
    accountId: accountAddress,
    date: new Date(txn.time * 1000),
    extra: {},
  };
};

/**
 * Parse PaymentV2 Transaction.
 * @param txn transaction
 * @param accountAddress address making transaction
 * @returns transaction object.
 */
const parsePaymentV2 = (txn: PaymentV2, accountAddress: string) => {
  const bnPayments = txn.payments.map((p) => ({
    ...p,
    amount: new BigNumber(p.amount),
  }));

  return {
    id: txn.hash,
    hash: txn.hash,
    type: txn.payer === accountAddress ? "OUT" : "IN",
    value:
      txn.payer === accountAddress
        ? bigNumberSum(bnPayments.map((p) => p.amount))
        : bnPayments.find((p) => p.payee === accountAddress)?.amount,
    fee: new BigNumber(txn.fee), // TODO convert DC to HNT
    senders: [txn.payer],
    recipients: txn.payments.map((p) => p.payee),
    blockHeight: txn.height,
    blockHash: txn.height.toString(),
    transactionSequenceNumber: txn.nonce,
    accountId: accountAddress,
    date: new Date(txn.time * 1000),
    extra: {},
  };
};

/**
 * Return all operations.
 * @param address
 * @returns Promise with array of operations
 */
const getOperations = async (address: string): Promise<Operation[]> => {
  // Get all transactions in order to return operations.
  const txns = await fetchAll(
    `/accounts/${address}/activity`,
    isTestnet(address),
    {
      filter_types: supportedTypes.join(","),
    }
  );

  return txns.map((txn) => parseTxn(txn, address));
};

export default getOperations;
