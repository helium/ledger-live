import { TFunction } from "react-i18next";
import { Device } from "@ledgerhq/live-common/hw/actions/types";
import { Step } from "~/renderer/components/Stepper";
import { Account, AccountLike, TokenAccount, Operation } from "@ledgerhq/types-live";
import { CryptoCurrency, TokenCurrency } from "@ledgerhq/types-cryptoassets";
import { Transaction, TransactionStatus } from "@ledgerhq/live-common/families/ethereum/types";
export type StepId = "amount" | "connectDevice" | "confirmation";
export type StepProps = {
  t: TFunction;
  transitionTo: (a: string) => void;
  device: Device | undefined | null;
  account: TokenAccount | undefined | null;
  accounts: AccountLike[] | undefined | null;
  currency: CryptoCurrency | TokenCurrency;
  parentAccount: Account | undefined | null;
  onRetry: (a: void) => void;
  onClose: () => void;
  openModal: (key: string, config?: any) => void;
  onChangeAccount: (nextAccount: AccountLike, nextParentAccount?: Account) => void;
  optimisticOperation: any;
  bridgeError: Error | undefined | null;
  transactionError: Error | undefined | null;
  signed: boolean;
  transaction: Transaction | undefined | null;
  status: TransactionStatus;
  onChangeTransaction: (a: Transaction) => void;
  onUpdateTransaction: (updater: (a: Transaction) => void) => void;
  onTransactionError: (a: Error) => void;
  onOperationBroadcasted: (a: Operation) => void;
  setSigned: (a: boolean) => void;
  bridgePending: boolean;
};
export type St = Step<StepId, StepProps>;
