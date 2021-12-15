/*
 *
 * HomePage
 *
 */

import React, { memo, useState, useEffect } from "react";
import { fetchActiveMqSettings, updateActiveMqSettings } from "../../utils/api";
import ActiveMqheader from "../../components/ActiveMqHeader.js";
import ListView from "../ListView";

import { Main } from "@strapi/design-system/Main";
import { ContentLayout } from "@strapi/design-system/Layout";
import { Stack } from "@strapi/design-system/Stack";
import { Box } from "@strapi/design-system/Box";
import { Grid, GridItem } from "@strapi/design-system/Grid";
import { Typography } from "@strapi/design-system/Typography";
import { TextInput } from "@strapi/design-system/TextInput";
import { Button } from "@strapi/design-system/Button";
import { useNotifyAT } from "@strapi/design-system/LiveRegions";
import { useIntl } from "react-intl";
import {
  getYupInnerErrors,
  CheckPagePermissions,
  useNotification,
  LoadingIndicatorPage,
  useOverlayBlocker,
  useFocusWhenNavigate,
} from "@strapi/helper-plugin";

import getTrad from "../../utils/getTrad";
// import pluginId from "../../pluginId";

const HomePage = () => {
  return (
    <Main labelledBy="title">
      <ListView />
    </Main>
  );
};

export default memo(HomePage);
