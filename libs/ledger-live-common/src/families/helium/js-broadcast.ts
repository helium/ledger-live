import type { Operation, SignedOperation } from "../../types";
import { patchOperationWithHash } from "../../operation";
import { submit } from "./api";
import { isTestnet } from "./utils";

/**
 * Broadcast the signed transaction
 * @param {signature: string, operation: string} signedOperation
 */
const broadcast = async ({
  signedOperation: { signature, operation },
}: {
  signedOperation: SignedOperation;
}): Promise<Operation> => {
  const { hash } = await submit(signature, isTestnet(operation.accountId));

  return patchOperationWithHash(operation, hash);
};

export default broadcast;
