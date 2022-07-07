import network from "../../../network";
import { getRootUrl } from "../utils";

/**
 * Submit transaction.
 * @param txn transaction
 * @param isTestnet to get api root url.
 * @returns Promise with submit hash.
 */
const submit = async (
  txn: string,
  isTestnet: boolean
): Promise<{ hash: string }> => {
  const root = getRootUrl(isTestnet);
  const url = `${root}/pending_transactions`;

  const {
    data: { hash },
  } = await network({ method: "POST", url, data: { txn } });

  return { hash };
};

export default submit;
