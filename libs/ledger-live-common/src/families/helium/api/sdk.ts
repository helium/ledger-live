import qs from "qs";
import network from "../../../network";
import { getRootUrl } from "../utils";

/**
 *
 * @param path
 * @param rootUrl
 * @param params
 * @returns rootUrl + path + params
 */
const makeUrl = (
  path: string,
  rootUrl: string,
  params?: Record<string, string>
) => {
  let url = rootUrl + path;
  if (params) {
    params = qs.stringify(params);
    url += `?${params}`;
  }
  return url;
};

/**
 *
 * @param path to append to root url.
 * @param isTestnet to get root url.
 * @param params for api request.
 * @returns data fetched from api.
 */
export async function fetch(
  path: string,
  isTestnet: boolean,
  params?: Record<string, string>
): Promise<any> {
  const url = makeUrl(path, getRootUrl(isTestnet), params);
  const { data } = await network({
    method: "GET",
    url,
    headers: { "User-Agent": "LedgerLive" },
  });
  return data;
}

/**
 *
 * @param path to append to root url.
 * @param isTestnet to get root url.
 * @param params for api request.
 * @param acc
 * @param cursor
 * @returns data fetched from api.
 */
export const fetchAll = async (
  path: string,
  isTestnet: boolean,
  params: Record<string, string>,
  acc: any[] = [],
  cursor?: string
): Promise<any> => {
  const { data, cursor: nextCursor } = await fetch(path, isTestnet, {
    ...params,
    ...(cursor ? { cursor } : undefined),
  });
  const accData = [...acc, ...data];

  if (nextCursor) {
    const nextData = await fetchAll(
      path,
      isTestnet,
      params,
      accData,
      nextCursor
    );
    return nextData;
  }

  return accData;
};
