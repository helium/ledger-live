import React, { ReactNode, useCallback, useEffect } from "react";
import { Linking } from "react-native";
import { useTheme } from "styled-components/native";
import { useBleDevicePairing } from "@ledgerhq/live-common/ble/hooks/useBleDevicePairing";
import { Device } from "@ledgerhq/live-common/hw/actions/types";
import { Trans, useTranslation } from "react-i18next";
import { getDeviceModel } from "@ledgerhq/devices";
import { Flex, InfiniteLoader, Text, Button, Icons } from "@ledgerhq/native-ui";
import {
  CircledCheckSolidMedium,
  CircledCrossSolidMedium,
} from "@ledgerhq/native-ui/assets/icons";
import { LockedDeviceError, PeerRemovedPairing } from "@ledgerhq/errors";
import { getDeviceAnimation } from "../../helpers/getDeviceAnimation";
import Animation from "../Animation";
import { TrackScreen } from "../../analytics";
import GenericErrorView from "../GenericErrorView";
import { Wrapper } from "../DeviceAction/rendering";
import { urls } from "../../config/urls";

export type BleDevicePairingProps = {
  onPaired: (device: Device) => void;
  onRetry: () => void;
  deviceToPair: Device;
};

/**
 * Runs a BLE pairing with the given device. Displays pairing, success or error steps.
 *
 * A closing cross is displayed to the user during the pairing, which either calls onPaired if
 * the device is already paired, or onRetry otherwise.
 *
 * @param deviceToPair Device to pair
 * @param onPaired Function called when pairing was successful
 * @param onRetry Function called when the user chooses to retry on unsuccessful pairing
 */
const BleDevicePairing = ({
  deviceToPair,
  onPaired,
  onRetry,
}: BleDevicePairingProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const theme = colors.type as "dark" | "light";

  const productName =
    getDeviceModel(deviceToPair.modelId).productName || deviceToPair.modelId;
  const deviceName = deviceToPair.deviceName || productName;

  const { isPaired, pairingError } = useBleDevicePairing({
    deviceId: deviceToPair.deviceId,
  });

  const onOpenHelp = useCallback(() => {
    Linking.openURL(urls.errors.PairingFailed);
  }, []);

  useEffect(() => {
    if (isPaired) {
      onPaired(deviceToPair);
    }
  }, [isPaired, deviceToPair, onPaired]);

  let content: ReactNode;

  if (isPaired) {
    content = (
      <>
        <TrackScreen category="BT pairing successful" />
        <Flex
          alignItems="center"
          justifyContent="center"
          p={1}
          borderWidth={2}
          borderRadius="9999px"
          borderColor={colors.success.c40}
          mb={9}
        >
          <CircledCheckSolidMedium color={colors.success.c40} size={48} />
        </Flex>
        <Text mb={4} textAlign="center" variant="h4" fontWeight="semiBold">
          {t("blePairingFlow.pairing.success.title", {
            deviceName,
          })}
        </Text>
        {/* Transparent text in order to have a smooth transition between loading and success */}
        <Text variant="body" textAlign="center" mb={8} color="transparent">
          {t("blePairingFlow.pairing.loading.subtitle", { productName })}
        </Text>
        <Animation
          source={getDeviceAnimation({
            device: deviceToPair,
            key: "blePaired",
            theme,
          })}
        />
      </>
    );
  } else if (pairingError instanceof PeerRemovedPairing) {
    content = (
      <Wrapper style={{ width: "100%" }}>
        <GenericErrorView
          error={pairingError}
          withDescription
          hasExportLogButton={false}
          withIcon
          withHelp={false}
        />
        <Flex mt={30} flexDirection="column" style={{ width: "100%" }}>
          <Button
            type="main"
            iconPosition="right"
            Icon={Icons.ExternalLinkMedium}
            onPress={onOpenHelp}
            mb={0}
          >
            <Trans i18nKey="help.helpCenter.desc" />
          </Button>
          <Button onPress={onRetry} mt={6}>
            <Trans i18nKey="common.retry" />
          </Button>
        </Flex>
      </Wrapper>
    );
  } else if (pairingError) {
    // TODO refactor this into the generic error rendering when possible.
    let title;
    let subtitle;

    if ((pairingError as unknown) instanceof LockedDeviceError) {
      title = t("blePairingFlow.pairing.error.lockedDevice.title");
      subtitle = t("blePairingFlow.pairing.error.lockedDevice.subtitle", {
        productName,
      });
    } else {
      title = t("blePairingFlow.pairing.error.generic.title");
      subtitle = t("blePairingFlow.pairing.error.generic.subtitle", {
        productName,
      });
    }

    content = (
      <Flex>
        <TrackScreen category="BT failed to pair" />
        <Flex flex={1} alignItems="center" justifyContent="center">
          <Flex alignItems="center" justifyContent="center" mb={8}>
            <CircledCrossSolidMedium color={colors.error.c40} size={56} />
          </Flex>
          <Text mb={4} textAlign="center" variant="h4" fontWeight="semiBold">
            {title}
          </Text>
          <Text variant="body" mb={8} color="neutral.c80" textAlign="center">
            {subtitle}
          </Text>
        </Flex>
        <Button type="main" onPress={onRetry} mb={8}>
          {t("blePairingFlow.pairing.error.retryCta")}
        </Button>
      </Flex>
    );
  } else {
    content = (
      <>
        <Flex mb={10}>
          <InfiniteLoader color="primary.c80" size={48} />
        </Flex>
        <Text variant="h4" fontWeight="semiBold" textAlign="center" mb={4}>
          {t("blePairingFlow.pairing.loading.title", { deviceName })}
        </Text>
        <Text variant="body" textAlign="center" mb={8} color="neutral.c80">
          {t("blePairingFlow.pairing.loading.subtitle", { productName })}
        </Text>
        <Animation
          source={getDeviceAnimation({
            device: deviceToPair,
            key: "blePairing",
            theme,
          })}
        />
      </>
    );
  }

  return (
    <Flex flex={1}>
      <Flex flex={1} px={10} pt={36} alignItems="center">
        {content}
      </Flex>
    </Flex>
  );
};

export default BleDevicePairing;
