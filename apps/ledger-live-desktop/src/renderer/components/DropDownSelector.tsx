import Tippy from "@tippyjs/react";
import React, { useState, useCallback } from "react";
import styled from "styled-components";
import Box from "~/renderer/components/Box";

type DropDownItemProps = {
  isActive?: boolean;
  disabled?: boolean;
};

export const DropDownItem = styled(Box).attrs<DropDownItemProps>(p => ({
  borderRadius: 1,
  justifyContent: "center",
  ff: "Inter|SemiBold",
  fontSize: 4,
  px: 3,
  color: p.disabled
    ? "palette.text.shade50"
    : p.isActive
    ? "palette.text.shade100"
    : "palette.text.shade60",
  bg: p.isActive && !p.disabled ? "palette.background.default" : "",
}))<DropDownItemProps>`
  height: 40px;
  white-space: nowrap;
  cursor: pointer;
  width: 100%;
  &:hover {
    background-color: ${p => !p.disabled && p.theme.colors.palette.background.default};
  }
`;
const DropContainer = styled.div`
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
  border: ${p => `1px solid ${p.theme.colors.palette.divider}`};
  max-height: 400px;
  max-width: 250px;
  ${p => p.theme.overflow.yAuto};
  border-radius: 6px;
  background-color: ${p => p.theme.colors.palette.background.paper};
  padding: 8px;

  > * {
    margin-bottom: 6px;
  }

  > :last-child {
    margin-bottom: 0px;
  }
`;
export type DropDownItemType<ContentType = any> = {
  key: string;
  label: any;
  disabled?: boolean;
  content?: ContentType;
};
const OptionContainer = styled.div`
  cursor: pointer;
`;
const ButtonContainer = styled.div`
  cursor: pointer;
  flex-shrink: 1;
`;
type Props = {
  children: (props: {
    isOpen: boolean | undefined | null;
    value: DropDownItemType | undefined | null;
  }) => React.ReactNode;
  items: DropDownItemType[];
  onChange?: (value: any) => void;
  renderItem: (props: { isActive: boolean; item: any }) => React.ReactNode | null;
  value?: DropDownItemType | null;
  controlled?: boolean;
  defaultValue?: DropDownItemType | null;
  buttonId?: string;
};
const DropDownSelector = ({
  children,
  items = [],
  onChange,
  renderItem,
  value,
  controlled = false,
  defaultValue = null,
  buttonId,
}: Props) => {
  const [isOpen, setOpen] = useState(false);
  const [stateValue, setStateValue] = useState(defaultValue);
  const selectedOption = controlled ? value : stateValue;
  const setSelectedOption = useCallback(
    item => {
      if (controlled) {
        setStateValue(item);
      }
      if (onChange) {
        onChange(item);
      }
      setOpen(false);
    },
    [controlled, onChange],
  );
  const renderOption = useCallback(
    item => {
      return (
        <OptionContainer
          id={`${buttonId || ""}-${item.key}`}
          key={item.key}
          onClick={() => !item.disabled && setSelectedOption(item)}
        >
          {renderItem({
            item,
            isActive: !!(selectedOption && item.key === selectedOption.key),
          })}
        </OptionContainer>
      );
    },
    [buttonId, renderItem, selectedOption, setSelectedOption],
  );
  return (
    <Tippy
      visible={isOpen}
      onClickOutside={() => setOpen(false)}
      onShow={() => setOpen(true)}
      onHide={() => setOpen(false)}
      animation="shift-away"
      placement="bottom-start"
      interactive
      arrow={false}
      content={<DropContainer>{items.map(renderOption)}</DropContainer>}
    >
      <ButtonContainer id={buttonId} onClick={() => setOpen(!isOpen)}>
        {children({
          isOpen,
          value: selectedOption,
        })}
      </ButtonContainer>
    </Tippy>
  );
};
export default DropDownSelector;
