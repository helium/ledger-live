import { useEffect } from "react";
import { ipcRenderer } from "electron";
import { EnvName, getEnv } from "@ledgerhq/live-common/env";
import { defaultFeatures, useFeatureFlags } from "@ledgerhq/live-common/featureFlags/index";
import { FeatureId } from "@ledgerhq/types-live";
import { enabledExperimentalFeatures } from "../experimental";
import { setTags } from "../../sentry/renderer";

type Tags = { [_: string]: boolean | number | string | undefined };

function setSentryTagsEverywhere(tags: Tags) {
  ipcRenderer.invoke("set-sentry-tags", tags);
  setTags(tags);
}

const MAX_KEYLEN = 32;
function safekey(k: string) {
  if (k.length > MAX_KEYLEN) {
    const sep = "..";
    const max = MAX_KEYLEN - sep.length;
    const split1 = Math.floor(max / 2);
    return k.slice(0, split1) + ".." + k.slice(k.length - (max - split1));
  }
  return k;
}

export const ConnectEnvsToSentry = () => {
  const featureFlags = useFeatureFlags();
  useEffect(() => {
    // This sync the Sentry tags to include the extra information in context of events
    const syncTheTags = () => {
      const tags: Tags = {};
      // if there are experimental on, we will add them in tags
      enabledExperimentalFeatures().forEach((key: EnvName) => {
        tags[safekey(key)] = getEnv(key);
      });
      // if there are features on, we will add them in tags
      const features: { [key in FeatureId]?: boolean } = {};
      Object.keys(defaultFeatures).forEach(key => {
        const value = featureFlags.getFeature(key as keyof typeof defaultFeatures);
        if (key && value && value.enabled !== defaultFeatures[key as FeatureId]!.enabled) {
          features[key as FeatureId] = value.enabled;
        }
      });

      Object.keys(features).forEach(key => {
        const safeKey = safekey(`f_${key}`);
        tags[safeKey] = features[key as keyof typeof features];
      });

      setSentryTagsEverywhere(tags);
    };
    // We need to wait firebase to load the data and then we set once for all the tags
    const timeout = setTimeout(syncTheTags, 5000);
    // We also try to regularly update them so we are sure to get the correct tags (as these are dynamic)
    const interval = setInterval(syncTheTags, 60000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [featureFlags]);
  return null;
};
