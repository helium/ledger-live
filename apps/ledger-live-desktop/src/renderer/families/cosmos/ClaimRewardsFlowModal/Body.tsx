import invariant from "invariant";
import React, { useState, useCallback } from "react";
import { compose } from "redux";
import { connect, useDispatch } from "react-redux";
import { Trans, withTranslation, TFunction } from "react-i18next";
import { createStructuredSelector } from "reselect";
import { SyncSkipUnderPriority } from "@ledgerhq/live-common/bridge/react/index";
import Track from "~/renderer/analytics/Track";
import { UserRefusedOnDevice } from "@ledgerhq/errors";
import { getAccountBridge } from "@ledgerhq/live-common/bridge/index";
import useBridgeTransaction from "@ledgerhq/live-common/bridge/useBridgeTransaction";
import { StepId, StepProps, St } from "./types";
import { Account, Operation } from "@ledgerhq/types-live";
import { Device } from "@ledgerhq/live-common/hw/actions/types";
import { addPendingOperation } from "@ledgerhq/live-common/account/index";
import { updateAccountWithUpdater } from "~/renderer/actions/accounts";
import { getCurrentDevice } from "~/renderer/reducers/devices";
import { closeModal, openModal } from "~/renderer/actions/modals";
import Stepper from "~/renderer/components/Stepper";
import StepClaimRewards, { StepClaimRewardsFooter } from "./steps/StepClaimRewards";
import GenericStepConnectDevice from "~/renderer/modals/Send/steps/GenericStepConnectDevice";
import StepConfirmation, { StepConfirmationFooter } from "./steps/StepConfirmation";
import logger from "~/renderer/logger";
type OwnProps = {
  stepId: StepId;
  onClose: () => void;
  onChangeStepId: (a: StepId) => void;
  params: {
    account: Account;
    parentAccount: Account | undefined | null;
    validatorAddress: string | undefined | null;
  };
  name: string;
};
type StateProps = {
  t: TFunction;
  device: Device | undefined | null;
  accounts: Account[];
  device: Device | undefined | null;
  closeModal: (a: string) => void;
  openModal: (a: string) => void;
};
type Props = OwnProps & StateProps;
const steps: Array<St> = [
  {
    id: "claimRewards",
    label: <Trans i18nKey="cosmos.claimRewards.flow.steps.claimRewards.title" />,
    component: StepClaimRewards,
    noScroll: true,
    footer: StepClaimRewardsFooter,
  },
  {
    id: "connectDevice",
    label: <Trans i18nKey="cosmos.claimRewards.flow.steps.connectDevice.title" />,
    component: GenericStepConnectDevice,
    onBack: ({ transitionTo }: StepProps) => transitionTo("claimRewards"),
  },
  {
    id: "confirmation",
    label: <Trans i18nKey="cosmos.claimRewards.flow.steps.confirmation.title" />,
    component: StepConfirmation,
    footer: StepConfirmationFooter,
  },
];
const mapStateToProps = createStructuredSelector({
  device: getCurrentDevice,
});
const mapDispatchToProps = {
  closeModal,
  openModal,
};
const Body = ({
  t,
  stepId,
  device,
  closeModal,
  openModal,
  onChangeStepId,
  params,
  name,
}: Props) => {
  const [optimisticOperation, setOptimisticOperation] = useState(null);
  const [transactionError, setTransactionError] = useState(null);
  const [signed, setSigned] = useState(false);
  const dispatch = useDispatch();
  const {
    transaction,
    setTransaction,
    updateTransaction,
    account,
    parentAccount,
    status,
    bridgeError,
    bridgePending,
  } = useBridgeTransaction(() => {
    const { account, validatorAddress } = params;
    invariant(account && account.cosmosResources, "cosmos: account and cosmos resources required");

    // preselect validator either one from params or the first one available on the list
    const validators = account.cosmosResources.delegations
      .filter(d =>
        validatorAddress ? d.validatorAddress === validatorAddress : d.pendingRewards.gt(0),
      )
      .slice(0, 1)
      .map(({ validatorAddress, pendingRewards }) => ({
        address: validatorAddress,
        amount: pendingRewards,
      }));
    const bridge = getAccountBridge(account, undefined);
    const t = bridge.createTransaction(account);
    const transaction = bridge.updateTransaction(t, {
      mode: "claimReward",
      validators,
    });
    return {
      account,
      parentAccount: undefined,
      transaction,
    };
  });
  const handleCloseModal = useCallback(() => {
    closeModal(name);
  }, [closeModal, name]);
  const handleStepChange = useCallback(e => onChangeStepId(e.id), [onChangeStepId]);
  const handleRetry = useCallback(() => {
    setTransactionError(null);
    onChangeStepId("claimRewards");
  }, [onChangeStepId]);
  const handleTransactionError = useCallback((error: Error) => {
    if (!(error instanceof UserRefusedOnDevice)) {
      logger.critical(error);
    }
    setTransactionError(error);
  }, []);
  const handleOperationBroadcasted = useCallback(
    (optimisticOperation: Operation) => {
      if (!account) return;
      dispatch(
        updateAccountWithUpdater(account.id, account =>
          addPendingOperation(account, optimisticOperation),
        ),
      );
      setOptimisticOperation(optimisticOperation);
      setTransactionError(null);
    },
    [account, dispatch],
  );
  const error = transactionError || bridgeError || status.errors.amount;
  const warning = status.warnings ? Object.values(status.warnings)[0] : null;
  const errorSteps = [];
  if (transactionError) {
    errorSteps.push(2);
  } else if (bridgeError) {
    errorSteps.push(0);
  }
  const stepperProps = {
    title: t("cosmos.claimRewards.flow.title"),
    device,
    account,
    parentAccount,
    transaction,
    signed,
    stepId,
    steps,
    errorSteps,
    disabledSteps: [],
    hideBreadcrumb: (!!error || !!warning) && ["claimRewards"].includes(stepId),
    onRetry: handleRetry,
    onStepChange: handleStepChange,
    onClose: handleCloseModal,
    error,
    warning,
    status,
    optimisticOperation,
    openModal,
    setSigned,
    onChangeTransaction: setTransaction,
    onUpdateTransaction: updateTransaction,
    onOperationBroadcasted: handleOperationBroadcasted,
    onTransactionError: handleTransactionError,
    t,
    bridgePending,
  };
  return (
    <Stepper {...stepperProps}>
      <SyncSkipUnderPriority priority={100} />
      <Track onUnmount event="CloseModalClaimRewards" />
    </Stepper>
  );
};
const C: React.ComponentType<OwnProps> = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation(),
)(Body);
export default C;
