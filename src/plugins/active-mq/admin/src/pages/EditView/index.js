/**
 *
 * EditView
 *
 */
import React, { useCallback, useMemo } from "react";
import {
  LoadingIndicatorPage,
  request,
  SettingsPageTitle,
  to,
  useNotification,
  useOverlayBlocker,
} from "@strapi/helper-plugin";
import { Main } from "@strapi/design-system/Main";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useHistory, useRouteMatch } from "react-router-dom";
import useModels from "../../hook/userModels";
import { axiosInstance } from "../../utils/axiosInstance";
import ActiveMqForm from "./components/ActiveMqForm";
import cleanData from "./utils/formatData";

const EditView = () => {
  const {
    params: { id },
  } = useRouteMatch("/plugins/active-mq/:id");

  const { replace } = useHistory();
  const { lockApp, unlockApp } = useOverlayBlocker();
  const toggleNotification = useNotification();
  const queryClient = useQueryClient();
  const { isLoading: isLoadingForModels, collectionTypes } = useModels();

  const isCreating = id === "create";

  const fetchWebhook = useCallback(
    async (id) => {
      const [err, { data }] = await to(
        request(`/api/active-mq/${id}`, {
          method: "GET",
        })
      );

      if (err) {
        toggleNotification({
          type: "warning",
          message: { id: "notification.error" },
        });

        return null;
      }

      return data;
    },
    [toggleNotification]
  );

  const { isLoading, data } = useQuery(
    ["get-webhook", id],
    () => fetchWebhook(id),
    {
      enabled: !isCreating,
    }
  );

  const {
    isLoading: isTriggering,
    data: triggerResponse,
    isIdle: isTriggerIdle,
    mutate,
  } = useMutation(() => axiosInstance.post(`/plugin/active-mq/${id}/trigger`));

  const triggerWebhook = () =>
    mutate(null, {
      onError: () => {
        toggleNotification({
          type: "warning",
          message: { id: "notification.error" },
        });
      },
    });

  const createWebhookMutation = useMutation((body) => {
    console.log("body", body);
    return request("/plugin/active-mq", {
      method: "POST",
      body,
    });
  });

  const updateWebhookMutation = useMutation(({ id, body }) =>
    request(`/plugin/active-mq/${id}`, {
      method: "PUT",
      body,
    })
  );

  const handleSubmit = async (data) => {
    console.log("Hey Submit leh ------------------------->");
    console.log("data", data);
    console.log("isCreating", isCreating);
    if (isCreating) {
      lockApp();
      createWebhookMutation.mutate(data, {
        onSuccess: (result) => {
          console.log("result", result);
          toggleNotification({
            type: "success",
            message: { id: "Settings.webhooks.created" },
          });
          replace(`/plugin/active-mq/${result.data.id}`);
          unlockApp();
        },
        onError: (e) => {
          toggleNotification({
            type: "warning",
            message: { id: "notification.error" },
          });
          console.log(e);
          unlockApp();
        },
      });
    } else {
      lockApp();
      updateWebhookMutation.mutate(
        { id, body: cleanData(data) },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["get-webhook", id]);
            toggleNotification({
              type: "success",
              message: { id: "notification.form.success.fields" },
            });
            unlockApp();
          },
          onError: (e) => {
            toggleNotification({
              type: "warning",
              message: { id: "notification.error" },
            });
            console.log(e);
            unlockApp();
          },
        }
      );
    }
  };

  const isDraftAndPublishEvents = useMemo(
    () => collectionTypes.some((ct) => ct.options.draftAndPublish === true),
    [collectionTypes]
  );

  if (isLoading || isLoadingForModels) {
    return <LoadingIndicatorPage />;
  }

  return (
    <Main>
      <SettingsPageTitle name="ActiveMqs" />
      <ActiveMqForm
        {...{
          handleSubmit,
          data,
          triggerWebhook,
          isCreating,
          isTriggering,
          isTriggerIdle,
          triggerResponse: triggerResponse?.data.data,
          isDraftAndPublishEvents,
        }}
      />
    </Main>
  );
};

export default EditView;
