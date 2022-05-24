import React from "react";
import { TouchableWithoutFeedback, View, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { getCryptoCurrencyById } from "@ledgerhq/live-common/lib/currencies";
import { Text } from "@ledgerhq/native-ui";

import ParentCurrencyIcon from "../../components/ParentCurrencyIcon";
import { scrollToTop } from "../../navigation/utils";

export default function AccountHeaderTitle() {
  const route = useRoute();
  const { currencyId } = route.params;
  const currency = getCryptoCurrencyById(currencyId);

  if (!currency) return null;

  return (
    <TouchableWithoutFeedback onPress={scrollToTop}>
      <View style={styles.headerContainer}>
        <View style={styles.iconContainer}>
          <ParentCurrencyIcon size={32} currency={currency} />
        </View>
        <Text variant={"body"} fontWeight={"semiBold"} numberOfLines={1} pr={8}>
          {currency.name}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    paddingRight: 32,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 32,
    paddingVertical: 5,
  },
  iconContainer: {
    marginRight: 8,
    justifyContent: "center",
  },
});
