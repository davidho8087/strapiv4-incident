/*
 *
 * HomePage
 *
 */

import React, { memo, useState, useEffect } from "react";
import { fetchActiveMqSettings, updateActiveMqSettings } from "../../utils/api";
import ActiveMqheader from "../../components/ActiveMqHeader.js";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toggleNotification = useNotification();
  const { notifyStatus } = useNotifyAT();
  const [config, setConfig] = useState({
    channel: {
      topic: "",
    },
    config: {},
  });
  const { lockApp, unlockApp } = useOverlayBlocker();
  const { formatMessage } = useIntl();

  useEffect(() => {
    setIsLoading(true);

    fetchActiveMqSettings()
      .then((config) => {
        notifyStatus(
          formatMessage({
            id: getTrad("Settings.email.plugin.notification.data.loaded"),
            defaultMessage: "Email settings data has been loaded",
          })
        );

        setConfig(config);
      })
      .catch(() =>
        toggleNotification({
          type: "warning",
          message: formatMessage({
            id: getTrad("Settings.email.plugin.notification.config.error"),
            defaultMessage: "Failed to retrieve the email config",
          }),
        })
      )
      .finally(() => setIsLoading(false));
  }, [formatMessage, toggleNotification, notifyStatus]);

  console.log("config", config);

  function handleChange(update) {
    console.log("update", update);
    console.log(config.channel);

    setConfig({
      ...config,
      channel: update,
    });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      lockApp();
      setIsSubmitting(true);
      console.log("onSubmit", config);

      updateActiveMqSettings(config)
        .then(() => {
          toggleNotification({
            type: "success",
            message: formatMessage({
              id: getTrad("Settings.email.plugin.notification.test.success"),
              defaultMessage: "Email test succeeded, check the  mailbox",
            }),
          });
        })
        .catch(() => {
          toggleNotification({
            type: "warning",
            message: formatMessage({
              id: getTrad("Settings.email.plugin.notification.test.error"),
              defaultMessage: "Failed",
            }),
          });
        })
        .finally(() => {
          setIsSubmitting(false);
          unlockApp();
        });
    } catch (error) {
      setFormErrors(getYupInnerErrors(error));
    }
  };

  return (
    <Main labelledBy="title">
      <ActiveMqheader />
      <ContentLayout>
        <form onSubmit={handleSubmit}>
          <Stack size={7}>
            <Box
              background="neutral0"
              hasRadius
              shadow="filterShadow"
              paddingTop={6}
              paddingBottom={6}
              paddingLeft={7}
              paddingRight={7}
            >
              {/* <Configuration config={} /> */}
            </Box>
            <Box
              background="neutral0"
              hasRadius
              shadow="filterShadow"
              paddingTop={6}
              paddingBottom={6}
              paddingLeft={7}
              paddingRight={7}
            >
              <Stack size={4}>
                <Typography variant="delta" as="h2">
                  {formatMessage({
                    id: getTrad("Settings.email.plugin.title.test"),
                    defaultMessage: "Send a test mail",
                  })}
                </Typography>
                <Grid gap={5} alignItems="end">
                  <GridItem col={6} s={12}>
                    <TextInput
                      id="test-address-input"
                      name="test-address"
                      onChange={(e) => handleChange({ topic: e.target.value })}
                      label={formatMessage({
                        id: getTrad("Settings.email.plugin.label.testAddress"),
                        defaultMessage: "Recipient email",
                      })}
                      // error={
                      //   formErrors.email?.id &&
                      //   formatMessage({
                      //     id: getTrad(`${formErrors.email?.id}`),
                      //     defaultMessage: "This is an invalid email",
                      //   })
                      // }
                      value={config.channel.topic}
                      placeholder={formatMessage({
                        id: "Settings.email.plugin.placeholder.testAddress",
                        defaultMessage: "ex: developer@example.com",
                      })}
                    />
                  </GridItem>
                  <GridItem col={7} s={12}>
                    <Button
                      loading={isSubmitting}
                      // disabled={!isTestAddressValid}
                      type="submit"
                      // startIcon={<Envelop />}
                    >
                      Submit
                    </Button>
                  </GridItem>
                </Grid>
              </Stack>
            </Box>
          </Stack>
        </form>
      </ContentLayout>
    </Main>
  );
};

export default memo(HomePage);
