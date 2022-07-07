import { PaymentV2 } from "@helium/transactions";
import type { Transaction } from "./types";
import type { Account } from "../../types";
import { getNonce } from "./logic";
import Address from "@helium/address";
import { getFees } from "./api";
import { isTestnet } from "./utils";

/**
 *
 * @param a account
 * @param t transaction
 * @returns PaymentV2 object
 */
export const buildPaymentV2Txn = async (
  a: Account,
  t: Transaction
): Promise<PaymentV2> => {
  const nonce = await getNonce(a.freshAddress);
  const { dc } = await getFees("payment_v2", isTestnet(a.freshAddress));

  return new PaymentV2({
    payer: Address.fromB58(a.freshAddress),
    payments: [
      {
        payee: Address.fromB58(t.recipient),
        amount: t.amount.toNumber(),
        memo: t.memo,
      },
    ],
    nonce,
    fee: dc.toNumber(),
  });
};
