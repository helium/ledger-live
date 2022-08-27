import type { DeviceAction } from "../../bot/types";
import type { Transaction } from "./types";
import { formatCurrencyUnit } from "../../currencies";
import { deviceActionFlow } from "../../bot/specs";
import { getCryptoCurrencyById } from "@ledgerhq/cryptoassets";
import BigNumber from "bignumber.js";
import type { CryptoCurrency } from "@ledgerhq/types-cryptoassets";

function getMainCurrency(currency: CryptoCurrency) {
  if (currency.isTestnetFor !== undefined) {
    return getCryptoCurrencyById(currency.isTestnetFor);
  }
  return currency;
}

function ellipsis(str: string) {
  return `${str.slice(0, 7)}..${str.slice(-7)}`;
}

function formatAmount(currency: CryptoCurrency, amount: number) {
  const unit = getMainCurrency(currency).units[0];
  return formatCurrencyUnit(unit, new BigNumber(amount), {
    disableRounding: true,
    showCode: true,
  }).replace(/\s/g, " ");
}

export const acceptSendTransaction: DeviceAction<Transaction, any> =
  deviceActionFlow({
    steps: [
      {
        title: "Send",
        button: "Rr",
        expectedValue: ({ account, transaction }) => {
          const command = transaction;
          if (command?.model.mode === "send") {
            return formatAmount(account.currency, command.amount.toNumber());
          }
          throwUnexpectedTransaction();
        },
      },
      {
        title: "Recipient",
        button: "Rr",
        expectedValue: ({ transaction }) => {
          const command = transaction;
          if (command?.model.mode === "send") {
            return ellipsis(command.recipient);
          }
          throwUnexpectedTransaction();
        },
      },
      {
        title: "Approve",
        button: "LRlr",
        final: true,
      },
    ],
  });

export const acceptBurnTransaction: DeviceAction<Transaction, any> =
  deviceActionFlow({
    steps: [
      {
        title: "Burn",
        button: "Rr",
        expectedValue: ({ account, transaction }) => {
          const command = transaction;
          if (command?.model.mode === "burn") {
            return formatAmount(account.currency, command.amount.toNumber());
          }
          throwUnexpectedTransaction();
        },
      },
      {
        title: "Payee",
        button: "Rr",
        expectedValue: ({ transaction }) => {
          const command = transaction;
          if (command?.model.mode === "burn") {
            return ellipsis(command.model.payee);
          }
          throwUnexpectedTransaction();
        },
      },
      {
        title: "Approve",
        button: "LRlr",
        final: true,
      },
    ],
  });

function throwUnexpectedTransaction(): never {
  throw new Error("unexpected or unprepared transaction");
}

export default {
  acceptSendTransaction,
  acceptBurnTransaction,
};
