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

const ActiveMqForm = ({ handleSubmit, data, dataTable, isCreating }) => {
  const { formatMessage } = useIntl();
  // const [showTriggerResponse, setShowTriggerResponse] = useState(false);
  console.log("datatable", dataTable);
  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={{
        name: data?.name || "",
        type: data?.type || "",
        dataTable: data?.dataTable || "",
        content: data,
      }}
      validationSchema={schema}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ handleSubmit, errors, handleChange }) => (
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
                    id: "Settings.active-mqs.create",
                    defaultMessage: "Create an Active-Mq channel",
                  })
                : data?.name
            }
            navigationAction={
              <Link startIcon={<ArrowLeft />} to="/plugins/active-mq">
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
                    <GridItem col={12}>
                      <Field
                        as={TextInput}
                        name="name"
                        error={
                          errors.name && formatMessage({ id: errors.name })
                        }
                        label={formatMessage({
                          id: "Settings.ActiveMq.form.name",
                          defaultMessage: "Name",
                        })}
                      />
                    </GridItem>
                    <GridItem col={6}>
                      <Field
                        as={Select}
                        name="type"
                        error={
                          errors.type && formatMessage({ id: errors.type })
                        }
                        label={formatMessage({
                          id: "Settings.roles.form.input.type",
                          defaultMessage: "Type",
                        })}
                        onChange={(value) => {
                          handleChange({
                            target: { name: "type", value },
                          });
                        }}
                      >
                        <Option value="queue">Queue</Option>
                        <Option value="topic">Topic</Option>
                      </Field>
                    </GridItem>
                    <GridItem col={6}>
                      <Field
                        as={Select}
                        name="dataTable"
                        label={formatMessage({
                          id: "Settings.activeMqs.form.select.dataTable",
                          defaultMessage: "DataTable",
                        })}
                        error={
                          errors.dataTable &&
                          formatMessage({ id: errors.dataTable })
                        }
                        onChange={(value) => {
                          handleChange({
                            target: { name: "dataTable", value },
                          });
                        }}
                      >
                        {!dataTable.isLoading &&
                          dataTable.data.map((role) => {
                            return (
                              <Option key={role} value={role}>
                                {role}
                              </Option>
                            );
                          })}
                      </Field>
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
  dataTable: PropTypes.object,
  // triggerWebhook: PropTypes.func.isRequired,
  isCreating: PropTypes.bool.isRequired,
  // isDraftAndPublishEvents: PropTypes.bool.isRequired,
  // isTriggering: PropTypes.bool.isRequired,
  // triggerResponse: PropTypes.object,
};

ActiveMqForm.defaultProps = {
  data: undefined,
  // triggerResponse: undefined,
};

export default ActiveMqForm;
