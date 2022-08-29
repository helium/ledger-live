import React from "react";
import { StyleSheet, View } from "react-native";
import Alert from "../../../components/Alert";

type Props = {
  title: string;
};

const NoOpenProposalsBanner = ({ title }: Props) => {
  return (
    <View style={styles.root}>
      <Alert
        type="danger"
        learnMoreUrl="https://docs.helium.com/community-governance/"
      >
        {title}
      </Alert>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    marginTop: 16,
    marginHorizontal: 16,
  },
});
export default NoOpenProposalsBanner;
