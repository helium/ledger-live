import invariant from "invariant";
import expect from "expect";
import { getCryptoCurrencyById } from "@ledgerhq/cryptoassets";
import { DeviceModelId } from "@ledgerhq/devices";
import { botTest, pickSiblings } from "../../bot/specs";
import { AppSpec, TransactionTestInput } from "../../bot/types";
import { Transaction } from "./types";
import {
  acceptSendTransaction,
  acceptBurnTransaction,
} from "./speculos-deviceActions";
import { assertUnreachable } from "./utils";

const helium: AppSpec<Transaction> = {
  name: "Helium",
  appQuery: {
    model: DeviceModelId.nanoS,
    firmware: "2",
    appVersion: "1.2.0",
    appName: "helium",
  },
  testTimeout: 2 * 60 * 1000,
  currency: getCryptoCurrencyById("helium"),
  mutations: [
    {
      name: "Send ~50%",
      maxRun: 2,
      deviceAction: acceptSendTransaction,
      transaction: ({ account, siblings, bridge, maxSpendable }) => {
        invariant(maxSpendable.gt(0), "balance is 0");
        const transaction = bridge.createTransaction(account);
        const sibling = pickSiblings(siblings);
        const recipient = sibling.freshAddress;
        const amount = account.spendableBalance
          .div(1.9 + 0.2 * Math.random())
          .integerValue();
        return {
          transaction,
          updates: [{ recipient }, { amount }, maybeSendMemo()],
        };
      },
      test: (input) => {
        expectCorrectBalanceChange(input);
        expectCorrectMemo(input);
      },
    },
    {
      name: "Send Max",
      maxRun: 1,
      deviceAction: acceptSendTransaction,
      transaction: ({ account, siblings, bridge, maxSpendable }) => {
        invariant(maxSpendable.gt(0), "balance is 0");
        const transaction = bridge.createTransaction(account);
        const sibling = pickSiblings(siblings);
        const recipient = sibling.freshAddress;
        return {
          transaction,
          updates: [{ recipient }, { useAllAmount: true }, maybeSendMemo()],
        };
      },
      test: (input) => {
        const { account } = input;
        botTest("account balance should be zero", () =>
          expect(account.spendableBalance.toNumber()).toBe(0)
        );
        expectCorrectBalanceChange(input);
        expectCorrectMemo(input);
      },
    },
    {
      name: "Vote for a proposal",
      maxRun: 1,
      deviceAction: acceptBurnTransaction,
      transaction: ({ account, bridge, maxSpendable }) => {
        invariant(maxSpendable.gt(0), "balance is 0");
        const transaction = bridge.createTransaction(account);
        return {
          transaction,
          updates: [maybeBurn()],
        };
      },
      test: (input) => {
        const { account } = input;
        botTest("account balance should be zero", () =>
          expect(account.spendableBalance.toNumber()).toBe(0)
        );
        expectCorrectBalanceChange(input);
        expectCorrectMemo(input);
      },
    },
  ],
};

function maybeSendMemo(threshold = 0.5): Partial<Transaction> | undefined {
  return Math.random() > threshold
    ? {
        model: {
          mode: "send",
          memo: "A memo",
        },
      }
    : undefined;
}

function maybeBurn(threshold = 0.5): Partial<Transaction> | undefined {
  return Math.random() > threshold
    ? {
        model: {
          mode: "burn",
          payee: "13qVx7MRzocyKZ4bW3oEkvnQrTK4DftKEcjHVYP1zhMtUhnqYye",
          memo: "0",
          hipID: "14MnuexopPfDg3bmq8JdCm7LMDkUBoqhqanD9QzLrUURLZxFHBx",
        },
      }
    : undefined;
}

function expectCorrectMemo(input: TransactionTestInput<Transaction>) {
  const { transaction, operation } = input;
  switch (transaction.model.mode) {
    case "send": {
      const memo = transaction.model.memo;
      botTest("memo matches in op extra", () =>
        expect(operation.extra.memo).toBe(memo)
      );
      break;
    }
    default:
      return assertUnreachable();
  }
}

function expectCorrectBalanceChange(input: TransactionTestInput<Transaction>) {
  const { account, operation, accountBeforeTransaction } = input;
  botTest("account balance decreased with operation value", () =>
    expect(account.balance.toNumber()).toBe(
      accountBeforeTransaction.balance.minus(operation.value).toNumber()
    )
  );
}

export default {
  helium,
};
