import React, { useState } from "react";
import PropTypes from "prop-types";
import { Form } from "@strapi/helper-plugin";
import ArrowLeft from "@strapi/icons/ArrowLeft";
import Check from "@strapi/icons/Check";
import Publish from "@strapi/icons/Play";
import { ContentLayout, HeaderLayout } from "@strapi/design-system/Layout";
import { Box } from "@strapi/design-system/Box";
import { Button } from "@strapi/design-system/Button";
import { Link } from "@strapi/design-system/Link";
import { Stack } from "@strapi/design-system/Stack";
import { TextInput } from "@strapi/design-system/TextInput";
import { Grid, GridItem } from "@strapi/design-system/Grid";
import { Select, Option } from "@strapi/design-system/Select";
import { Field, Formik } from "formik";

import { useIntl } from "react-intl";
// import EventInput from "../EventInput";
// import HeadersInput from "../HeadersInput";
// import TriggerContainer from "../TriggerContainer";
import schema from "../utils/schema";

const ActiveMqForm = ({
  handleSubmit,
  data,
  triggerWebhook,
  isCreating,
  isTriggering,
  triggerResponse,
  isDraftAndPublishEvents,
}) => {
  const { formatMessage } = useIntl();
  const [showTriggerResponse, setShowTriggerResponse] = useState(false);

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={{
        name: data?.name || "",
        type: data?.type || "",
      }}
      validationSchema={schema}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ handleSubmit, errors }) => (
        <Form noValidate>
          <HeaderLayout
            primaryAction={
              <Stack horizontal size={2}>
                <Button
                  startIcon={<Check />}
                  onClick={handleSubmit}
                  type="submit"
                  size="L"
                >
                  {formatMessage({
                    id: "app.components.Button.save",
                    defaultMessage: "Save",
                  })}
                </Button>
              </Stack>
            }
            title={
              isCreating
                ? formatMessage({
                    id: "Settings.webhooks.create",
                    defaultMessage: "Create a webhook",
                  })
                : data?.name
            }
            navigationAction={
              <Link startIcon={<ArrowLeft />} to="/settings/webhooks">
                {formatMessage({
                  id: "app.components.go-back",
                  defaultMessage: "Go back",
                })}
              </Link>
            }
          />
          <ContentLayout>
            <Stack size={4}>
              <Box
                background="neutral0"
                padding={8}
                shadow="filterShadow"
                hasRadius
              >
                <Stack size={6}>
                  <Grid gap={6}>
                    {/* <GridItem col={6}>
                      <Field
                        as={Select}
                        name="type"
                        label={formatMessage({
                          id: "Settings.apiTokens.form.type",
                          defaultMessage: "Channel Type",
                        })}
                        error={
                          errors.name && formatMessage({ id: errors.name })
                        }
                        onChange={(value) => {
                          handleChange({ target: { name: "type", value } });
                        }}
                      >
                        <Option value="Topic">
                          {formatMessage({
                            id: "Settings.apiTokens.types.topic",
                            defaultMessage: "Topic",
                          })}
                        </Option>
                        <Option value="Queue">
                          {formatMessage({
                            id: "Settings.apiTokens.types.queue",
                            defaultMessage: "Queue",
                          })}
                        </Option>
                      </Field>
                    </GridItem> */}

                    <GridItem col={6}>
                      <Field
                        as={TextInput}
                        name="name"
                        error={
                          errors.name && formatMessage({ id: errors.name })
                        }
                        label={formatMessage({
                          id: "Settings.webhooks.form.name",
                          defaultMessage: "Name",
                        })}
                      />
                    </GridItem>
                    <GridItem col={12}>
                      <Field
                        as={TextInput}
                        name="type"
                        error={
                          errors.type && formatMessage({ id: errors.type })
                        }
                        label={formatMessage({
                          id: "Settings.roles.form.input.type",
                          defaultMessage: "Type",
                        })}
                      />
                    </GridItem>
                  </Grid>
                </Stack>
              </Box>
            </Stack>
          </ContentLayout>
        </Form>
      )}
    </Formik>
  );
};

ActiveMqForm.propTypes = {
  data: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  triggerWebhook: PropTypes.func.isRequired,
  isCreating: PropTypes.bool.isRequired,
  isDraftAndPublishEvents: PropTypes.bool.isRequired,
  isTriggering: PropTypes.bool.isRequired,
  triggerResponse: PropTypes.object,
};

ActiveMqForm.defaultProps = {
  data: undefined,
  triggerResponse: undefined,
};

export default ActiveMqForm;
