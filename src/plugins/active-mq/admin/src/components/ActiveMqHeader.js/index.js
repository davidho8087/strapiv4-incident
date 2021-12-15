import React from "react";
import { HeaderLayout } from "@strapi/design-system/Layout";
import getTrad from "../../utils/getTrad";
import { useIntl } from "react-intl";

const ActiveMqheader = () => {
  const { formatMessage } = useIntl();
  return (
    <HeaderLayout
      id="title"
      title={formatMessage({
        id: getTrad("Settings.activerMq.plugin.title"),
        defaultMessage: "ActiveMq",
      })}
      subtitle={formatMessage({
        id: getTrad("Settings.activerMq.plugin.subTitle"),
        defaultMessage: "Test the settings for the ActiveMq plugin",
      })}
    />
  );
};

export default ActiveMqheader;
