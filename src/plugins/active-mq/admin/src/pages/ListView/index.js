/**
 *
 * ListView
 *
 */

import React, { useEffect, useReducer, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useIntl } from "react-intl";
import {
  request,
  useRBAC,
  LoadingIndicatorPage,
  useNotification,
  useFocusWhenNavigate,
  SettingsPageTitle,
  ConfirmDialog,
  onRowClick,
  stopPropagation,
} from "@strapi/helper-plugin";
import {
  HeaderLayout,
  Layout,
  ContentLayout,
  ActionLayout,
} from "@strapi/design-system/Layout";
import { EmptyStateLayout } from "@strapi/design-system/EmptyStateLayout";
import { Flex } from "@strapi/design-system/Flex";
import { Stack } from "@strapi/design-system/Stack";
import { IconButton } from "@strapi/design-system/IconButton";
import { BaseCheckbox } from "@strapi/design-system/BaseCheckbox";
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  TFooter,
} from "@strapi/design-system/Table";
import { Typography } from "@strapi/design-system/Typography";
import { Button } from "@strapi/design-system/Button";
import { VisuallyHidden } from "@strapi/design-system/VisuallyHidden";
import { Switch } from "@strapi/design-system/Switch";
import { Main } from "@strapi/design-system/Main";
import { LinkButton } from "@strapi/design-system/LinkButton";
import { useNotifyAT } from "@strapi/design-system/LiveRegions";
import { Box } from "@strapi/design-system/Box";
import Plus from "@strapi/icons/Plus";
import Pencil from "@strapi/icons/Pencil";
import Trash from "@strapi/icons/Trash";
import EmptyDocuments from "@strapi/icons/EmptyDocuments";
import reducer, { initialState } from "./reducer";
// import adminPermissions from "../../../../../permissions";

const ListView = () => {
  // const {
  //   isLoading,
  //   allowedActions: { canCreate, canRead, canUpdate, canDelete },
  // } = useRBAC(adminPermissions.settings.activeMqs);
  const [isLoading, setIsLoading] = useState(false);
  const toggleNotification = useNotification();
  const isMounted = useRef(true);
  const { formatMessage } = useIntl();
  const [showModal, setShowModal] = useState(false);
  const [
    { activeMqs, activeMqsToDelete, activeMqToDelete, loadingActiveMqs },
    dispatch,
  ] = useReducer(reducer, initialState);
  const { notifyStatus } = useNotifyAT();

  useFocusWhenNavigate();

  const { push } = useHistory();
  const { pathname } = useLocation();
  const rowsCount = activeMqs.length;

  const activeMqsToDeleteLength = activeMqsToDelete.length;

  const getActiveMqIndex = (id) =>
    activeMqs.findIndex((activeMq) => activeMq.id === id);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchActiveMqs();
  }, []);

  const fetchActiveMqs = async () => {
    try {
      const data = await request("/active-mq", {
        method: "GET",
      });

      if (isMounted.current) {
        dispatch({
          type: "GET_DATA_SUCCEEDED",
          data,
        });
        notifyStatus("ActiveMq have been loaded");
      }
    } catch (err) {
      console.log(err);

      if (isMounted.current) {
        if (err.code !== 20) {
          toggleNotification({
            type: "warning",
            message: { id: "notification.error" },
          });
        }
        dispatch({
          type: "TOGGLE_LOADING",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleModal = () => {
    setShowModal((prev) => !prev);
  };

  const handleConfirmDelete = () => {
    if (activeMqToDelete) {
      handleConfirmDeleteOne();
    } else {
      handleConfirmDeleteAll();
    }
  };

  const handleConfirmDeleteOne = async () => {
    try {
      await request(`/active-mq/${activeMqToDelete}`, {
        method: "DELETE",
      });

      dispatch({
        type: "ACTIVEMQ_DELETED",
        index: getActiveMqIndex(activeMqToDelete),
      });
    } catch (err) {
      if (err.code !== 20) {
        toggleNotification({
          type: "warning",
          message: { id: "notification.error" },
        });
      }
    }
    setShowModal(false);
  };

  const handleConfirmDeleteAll = async () => {
    const body = {
      ids: activeMqsToDelete,
    };

    try {
      await request("/active-mq/batch-delete", {
        method: "POST",
        body,
      });

      if (isMounted.current) {
        dispatch({
          type: "ACTIVEMQS_DELETED",
        });
      }
    } catch (err) {
      if (isMounted.current) {
        if (err.code !== 20) {
          toggleNotification({
            type: "warning",
            message: { id: "notification.error" },
          });
        }
      }
    }
    setShowModal(false);
  };

  const handleDeleteClick = (id) => {
    setShowModal(true);

    if (id !== "all") {
      dispatch({
        type: "SET_ACTIVEMQ_TO_DELETE",
        id,
      });
    }
  };

  const handleEnabledChange = async (value, id) => {
    const activeMqIndex = getActiveMqIndex(id);

    const initialActiveMqProps = activeMqs[activeMqIndex];
    const keys = [activeMqIndex, "isEnabled"];

    const body = {
      ...initialActiveMqProps,
      isEnabled: value,
    };

    delete body.id;

    try {
      dispatch({
        type: "SET_ACTIVEMQ_ENABLED",
        keys,
        value,
      });

      await request(`/active-mq/${id}`, {
        method: "PUT",
        body,
      });
    } catch (err) {
      if (isMounted.current) {
        dispatch({
          type: "SET_ACTIVEMQ_ENABLED",
          keys,
          value: !value,
        });
        if (err.code !== 20) {
          toggleNotification({
            type: "warning",
            message: { id: "notification.error" },
          });
        }
      }
    }
  };

  const handleSelectAllCheckbox = () => {
    dispatch({
      type: "SET_ALL_ACTIVEMQS_TO_DELETE",
    });
  };

  const handleSelectOneCheckbox = (value, id) => {
    dispatch({
      type: "SET_ACTIVEMQS_TO_DELETE",
      value,
      id,
    });
  };

  const handleGoTo = (to) => {
    push(`${pathname}/${to}`);
  };

  return (
    <Layout>
      <SettingsPageTitle name="activeMqs" />
      <Main aria-busy={isLoading || loadingActiveMqs}>
        <HeaderLayout
          title={formatMessage({
            id: "Settings.activeMqs.title",
            defaultMessage: "ActiveMqs",
          })}
          subtitle={formatMessage({
            id: "Settings.activeMqs.list.description",
            defaultMessage: "List of channels",
          })}
          primaryAction={
            !loadingActiveMqs && (
              <LinkButton
                startIcon={<Plus />}
                variant="default"
                to={`${pathname}/create`}
                size="L"
              >
                {formatMessage({
                  id: "Settings.activeMqs.list.button.add",
                  defaultMessage: "Add new Channel",
                })}
              </LinkButton>
            )
          }
        />
        {activeMqsToDeleteLength > 0 && (
          <ActionLayout
            startActions={
              <>
                <Typography variant="epsilon" textColor="neutral600">
                  {formatMessage(
                    {
                      id: "Settings.activeMqs.to.delete",
                      defaultMessage:
                        "{activeMqsToDeleteLength, plural, one {# asset} other {# assets}} selected",
                    },
                    { activeMqsToDeleteLength }
                  )}
                </Typography>
                <Button
                  onClick={() => handleDeleteClick("all")}
                  startIcon={<Trash />}
                  size="L"
                  variant="danger-light"
                >
                  Delete All
                </Button>
              </>
            }
          />
        )}
        <ContentLayout>
          {isLoading || loadingActiveMqs ? (
            <Box
              background="neutral0"
              padding={6}
              shadow="filterShadow"
              hasRadius
            >
              <LoadingIndicatorPage />
            </Box>
          ) : (
            <>
              {rowsCount > 0 ? (
                <Table
                  colCount={5}
                  rowCount={rowsCount + 1}
                  footer={
                    <TFooter
                      onClick={() => handleGoTo("create")}
                      icon={<Plus />}
                    >
                      {formatMessage({
                        id: "Settings.activeMqs.list.button.add",
                        defaultMessage: "Add new webhook",
                      })}
                    </TFooter>
                  }
                >
                  <Thead>
                    <Tr>
                      <Th>
                        <BaseCheckbox
                          aria-label={formatMessage({
                            id: "Settings.activeMqs.list.all-entries.select",
                            defaultMessage: "Select all entries",
                          })}
                          indeterminate={
                            activeMqsToDeleteLength > 0 &&
                            activeMqsToDeleteLength < rowsCount
                          }
                          value={activeMqsToDeleteLength === rowsCount}
                          onValueChange={handleSelectAllCheckbox}
                        />
                      </Th>
                      <Th width="20%">
                        <Typography variant="sigma" textColor="neutral600">
                          {formatMessage({
                            id: "Settings.activeMqs.form.name",
                            defaultMessage: "Name",
                          })}
                        </Typography>
                      </Th>
                      <Th width="60%">
                        <Typography variant="sigma" textColor="neutral600">
                          {formatMessage({
                            id: "Settings.activeMqs.form.url",
                            defaultMessage: "Type",
                          })}
                        </Typography>
                      </Th>
                      <Th width="20%">
                        <Typography variant="sigma" textColor="neutral600">
                          {formatMessage({
                            id: "Settings.activeMqs.list.th.status",
                            defaultMessage: "Status",
                          })}
                        </Typography>
                      </Th>
                      <Th>
                        <VisuallyHidden>
                          {formatMessage({
                            id: "Settings.activeMqs.list.th.actions",
                            defaultMessage: "Actions",
                          })}
                        </VisuallyHidden>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {activeMqs.map((activeMq) => (
                      <Tr
                        key={activeMq.id}
                        {...onRowClick({
                          fn: () => handleGoTo(activeMq.id),
                        })}
                      >
                        <Td {...stopPropagation}>
                          <BaseCheckbox
                            aria-label={`${formatMessage({
                              id: "Settings.webhooks.list.select",
                              defaultMessage: "Select",
                            })} ${activeMq.name}`}
                            value={activeMqsToDelete?.includes(activeMq.id)}
                            onValueChange={(value) =>
                              handleSelectOneCheckbox(value, activeMq.id)
                            }
                            id="select"
                            name="select"
                          />
                        </Td>
                        <Td>
                          <Typography
                            fontWeight="semiBold"
                            textColor="neutral800"
                          >
                            {activeMq.name}
                          </Typography>
                        </Td>
                        <Td>
                          <Typography textColor="neutral800">
                            {activeMq.type}
                          </Typography>
                        </Td>
                        <Td>
                          <Flex {...stopPropagation}>
                            <Switch
                              onLabel={formatMessage({
                                id: "Settings.activeMqs.enabled",
                                defaultMessage: "Enabled",
                              })}
                              offLabel={formatMessage({
                                id: "Settings.activeMqs.disabled",
                                defaultMessage: "Disabled",
                              })}
                              label={`${activeMq.name} ${formatMessage({
                                id: "Settings.webhooks.list.th.status",
                                defaultMessage: "Status",
                              })}`}
                              selected={activeMq.isEnabled}
                              onChange={() =>
                                handleEnabledChange(
                                  !activeMq.isEnabled,
                                  activeMq.id
                                )
                              }
                              visibleLabels
                            />
                          </Flex>
                        </Td>
                        <Td>
                          <Stack horizontal size={1} {...stopPropagation}>
                            {
                              <IconButton
                                onClick={() => {
                                  handleGoTo(activeMq.id);
                                }}
                                label={formatMessage({
                                  id: "Settings.activeMqs.events.update",
                                  defaultMessage: "Update",
                                })}
                                icon={<Pencil />}
                                noBorder
                              />
                            }
                            {
                              <IconButton
                                onClick={() => handleDeleteClick(activeMq.id)}
                                label={formatMessage({
                                  id: "Settings.activeMqs.events.delete",
                                  defaultMessage: "Delete",
                                })}
                                icon={<Trash />}
                                noBorder
                                id={`delete-${activeMq.id}`}
                              />
                            }
                          </Stack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <EmptyStateLayout
                  icon={<EmptyDocuments width="160px" />}
                  content={formatMessage({
                    id: "Settings.activeMqs.list.empty.description",
                    defaultMessage: "Add your first channel",
                  })}
                  action={
                    <Button
                      variant="secondary"
                      startIcon={<Plus />}
                      onClick={() => handleGoTo("create")}
                    >
                      {formatMessage({
                        id: "Settings.activeMqs.list.button.add",
                        defaultMessage: "Add new channel",
                      })}
                    </Button>
                  }
                />
              )}
            </>
          )}
        </ContentLayout>
      </Main>
      <ConfirmDialog
        isOpen={showModal}
        onToggleDialog={handleToggleModal}
        onConfirm={handleConfirmDelete}
      />
    </Layout>
  );
};

export default ListView;
