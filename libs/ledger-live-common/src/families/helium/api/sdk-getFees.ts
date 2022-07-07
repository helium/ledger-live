import Address from "@helium/address";
import { Transaction, PaymentV2, PaymentV1 } from "@helium/transactions";
import BigNumber from "bignumber.js";
import { fetch } from "./sdk";

const EMPTY_ADDRESS = Address.fromB58(
  "13PuqyWXzPYeXcF1B9ZRx7RLkEygeL374ZABiQdwRSNzASdA1sn"
);

const TXN_VARS: string[] = [
  "txn_fee_multiplier",
  "dc_payload_size",
  "staking_fee_txn_assert_location_v1",
  "staking_fee_txn_add_gateway_v1",
];

/**
 * Make fee transaction for PaymentV1 or PaymentV2.
 * @param type type of helium payment. payment_v1 | payment_v2
 * @returns Payment object.
 */
const makeFeeTxn = (type = "payment_v2") => {
  switch (type) {
    case "payment_v1":
      return new PaymentV1({
        payer: EMPTY_ADDRESS,
        payee: EMPTY_ADDRESS,
        amount: 100000000,
        nonce: 1,
      });
    case "payment_v2":
      return new PaymentV2({
        payer: EMPTY_ADDRESS,
        payments: [
          {
            payee: EMPTY_ADDRESS,
            amount: 100000000,
          },
        ],
        nonce: 1,
      });
    default:
      throw "Unsupported type for fees";
  }
};

/**
 * Fetch transaction config chain variables.
 * @returns config chain vars
 */
const fetchTransactionConfigChainVars = async (isTestnet) => {
  const { data: vars } = await fetch("/vars", isTestnet, {
    keys: TXN_VARS.join(","),
  });
  return {
    txnFeeMultiplier: vars.txn_fee_multiplier,
    stakingFeeTxnAssertLocationV1: vars.staking_fee_txn_assert_location_v1,
    stakingFeeTxnAddGatewayV1: vars.staking_fee_txn_add_gateway_v1,
    dcPayloadSize: vars.dc_payload_size,
  };
};

/**
 * Convert data credits to helium tokens.
 * @param dc to convert to HNT
 * @param isTestnet to get api root url.
 * @returns converted dc to hnt
 */
const dcToHnt = async (
  dc: BigNumber,
  isTestnet: boolean
): Promise<BigNumber> => {
  const dcInUSD = dc.dividedBy(100000);
  const { data: oracle } = await fetch("/oracle/prices/current", isTestnet);
  const oraclePrice = new BigNumber(oracle.price).dividedBy(100000000);
  return dcInUSD.dividedBy(oraclePrice).multipliedBy(100000000);
};

/**
 * Get fees for transaction.
 * @param type type of helium payment. payment_v1 | payment_v2
 * @param isTestnet to get api root url.
 * @returns transactions fees
 */
const getFees = async (
  type = "payment_v2",
  isTestnet: boolean
): Promise<{ dc: BigNumber; estHnt: BigNumber }> => {
  Transaction.config(await fetchTransactionConfigChainVars(isTestnet));
  const txn = makeFeeTxn(type);
  const dc = new BigNumber(txn.fee ?? 0);
  const estHnt = await dcToHnt(dc, isTestnet);

  return { dc, estHnt };
};

export default getFees;
