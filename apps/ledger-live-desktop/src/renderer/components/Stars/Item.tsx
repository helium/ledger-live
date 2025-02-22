import React, { useCallback } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import {
  getAccountCurrency,
  getAccountUnit,
  getAccountName,
} from "@ledgerhq/live-common/account/helpers";
import { AccountLike } from "@ledgerhq/types-live";
import Hide from "~/renderer/components/MainSideBar/Hide";
import FormattedVal from "~/renderer/components/FormattedVal";
import Box from "~/renderer/components/Box";
import Ellipsis from "~/renderer/components/Ellipsis";
import ParentCryptoCurrencyIcon from "~/renderer/components/ParentCryptoCurrencyIcon";
import { setTrackingSource } from "~/renderer/analytics/TrackPage";
const ParentCryptoCurrencyIconWrapper = styled.div`
  width: 20px;
`;
const ItemWrapper = styled.div.attrs<{
  active: boolean;
}>(p => ({
  style: {
    backgroundColor: p.active
      ? p.theme.colors.palette.action.hover
      : p.theme.colors.palette.background.paper,
  },
}))<{
  active: boolean;
}>`
  flex: 1;
  align-items: center;
  display: flex;
  padding: 6px 15px;
  width: 200px;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  margin: 2px 0px;
  color: ${p =>
    p.active ? p.theme.colors.palette.text.shade100 : p.theme.colors.palette.text.shade80};

  &:hover {
    color: ${p => p.theme.colors.palette.text.shade100};
  }
`;
type Props = {
  account: AccountLike;
  index: number;
  pathname: string;
  collapsed?: boolean;
};
const Item = ({ account, pathname, collapsed }: Props) => {
  const history = useHistory();
  const active = pathname.endsWith(account.id);
  const onAccountClick = useCallback(() => {
    const parentAccountId = account.type !== "Account" ? account.parentId : undefined;
    setTrackingSource("starred account item");
    history.push({
      pathname: parentAccountId
        ? `/account/${parentAccountId}/${account.id}`
        : `/account/${account.id}`,
    });
  }, [account, history]);
  const unit = getAccountUnit(account);
  return (
    <ItemWrapper className="bookmarked-account-item" active={active} onClick={onAccountClick}>
      <Box horizontal ff="Inter|SemiBold" flex={1} flow={3} alignItems="center">
        <ParentCryptoCurrencyIconWrapper>
          <ParentCryptoCurrencyIcon inactive={!active} currency={getAccountCurrency(account)} />
        </ParentCryptoCurrencyIconWrapper>
        <Box flex={1}>
          <Hide visible={!collapsed}>
            <Ellipsis>{getAccountName(account)}</Ellipsis>
            <FormattedVal
              alwaysShowSign={false}
              animateTicker={false}
              ellipsis
              color="palette.text.shade60"
              unit={unit}
              showCode
              val={account.balance}
            />
          </Hide>
        </Box>
      </Box>
    </ItemWrapper>
  );
};
export default Item;
