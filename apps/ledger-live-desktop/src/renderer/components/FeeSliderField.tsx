import React, { useCallback } from "react";
import styled from "styled-components";
import { BigNumber } from "bignumber.js";
import { Trans } from "react-i18next";
import { Unit } from "@ledgerhq/types-cryptoassets";
import { Range, reverseRangeIndex, projectRangeIndex } from "@ledgerhq/live-common/range";
import IconExclamationCircle from "~/renderer/icons/ExclamationCircle";
import Box from "./Box";
import Text from "./Text";
import CurrencyUnitValue from "./CurrencyUnitValue";
import Slider from "./Slider";
import GenericContainer from "./FeesContainer";
import TranslatedError from "./TranslatedError";
type Props = {
  range: Range;
  value: BigNumber;
  onChange: (a: BigNumber) => void;
  unit: Unit;
  error: Error | undefined | null;
  defaultValue: BigNumber;
};
const ErrorWrapper = styled.div`
  align-items: center;
  color: ${p => p.theme.colors.alertRed};
  display: flex;
  > :first-child {
    margin-right: 5px;
  }
`;
const ErrorContainer = styled(Box)<{ hasError?: boolean }>`
  margin-top: 0px;
  font-size: 12px;
  width: 100%;
  transition: all 0.4s ease-in-out;
  will-change: max-height;
  max-height: ${p => (p.hasError ? 60 : 0)}px;
  min-height: ${p => (p.hasError ? 20 : 0)}px;
  overflow: hidden;
`;
const Holder = styled.div`
  font-family: Inter;
  font-weight: 500;
  text-align: right;
  color: ${p => p.theme.colors.wallet};
  background-color: ${p => p.theme.colors.pillActiveBackground};
  padding: 0 8px;
  border-radius: 4px;
`;
export function useDynamicRange({
  range,
  value,
  onChange,
}: {
  range: Range;
  value: BigNumber;
  defaultValue: BigNumber;
  onChange: (a: BigNumber) => void;
}) {
  const index = reverseRangeIndex(range, value);
  const setValueIndex = useCallback((i: number) => onChange(projectRangeIndex(range, i)), [
    range,
    onChange,
  ]);
  const constraintValue = projectRangeIndex(range, index);
  return {
    range,
    index,
    constraintValue,
    setValueIndex,
  };
}
const FeeSliderField = ({ range, value, onChange, unit, error, defaultValue }: Props) => {
  const { index, constraintValue, setValueIndex } = useDynamicRange({
    range,
    value,
    defaultValue,
    onChange,
  });
  return (
    <GenericContainer
      i18nKeyOverride="send.steps.details.ethereumGasPrice"
      header={
        <Holder>
          <Text fontSize={4}>
            <CurrencyUnitValue value={constraintValue} unit={unit} />
          </Text>{" "}
          <Text fontSize={4}>{unit.code}</Text>
        </Holder>
      }
    >
      <Box flex={1}>
        <Slider error={error} value={index} onChange={setValueIndex} steps={range.steps} />
      </Box>
      <Box
        ff="Inter|Medium"
        fontSize="12px"
        horizontal
        justifyContent="space-between"
        color="palette.text.shade60"
      >
        <Text>
          <Trans i18nKey="fees.slow" />
        </Text>
        <Text>
          <Trans i18nKey="fees.fast" />
        </Text>
      </Box>
      <ErrorContainer hasError={!!error}>
        {error ? (
          <ErrorWrapper>
            <IconExclamationCircle size={12} />
            <Box flex="1" color="alertRed" ff="Inter|Regular" fontSize={4} textAlign="left">
              <TranslatedError error={error} />
            </Box>
          </ErrorWrapper>
        ) : null}
      </ErrorContainer>
    </GenericContainer>
  );
};
export default FeeSliderField;
