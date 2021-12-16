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
import { createActiveMq, updateActiveMq } from "../../utils/api";

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

  const fetchActiveMq = useCallback(
    async (id) => {
      console.log;
      const [err, data] = await to(
        request(`/active-mq/${id}`, {
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
    ["get-activeMq", id],
    () => fetchActiveMq(id),
    {
      enabled: !isCreating,
    }
  );

  const createActiveMqMutation = useMutation((body) => createActiveMq(body), {
    onSuccess: async (result) => {
      toggleNotification({
        type: "success",
        message: { id: "Settings.webhooks.created" },
      });
      replace(`/plugins/active-mq/${result.id}`);

      unlockApp();
    },
    onError: (e) => {
      toggleNotification({
        type: "warning",
        message: { id: "notification.error" },
      });
      console.log("error leh", e);
      unlockApp();
    },
  });

  const updateActiveMqMutation = useMutation((body) => updateActiveMq(body), {
    onSuccess: () => {
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
  });

  const handleSubmit = async (data) => {
    console.log("Hey Submit leh ------------------------->");
    console.log("data", data);
    console.log("isCreating", isCreating);
    if (isCreating) {
      lockApp();

      await createActiveMqMutation.mutateAsync(data);
    } else {
      // On Update
      console.log("are you here else.. Some going one");
      lockApp();
      await updateActiveMqMutation.mutateAsync({ id, body: data });
    }
  };

  // const isDraftAndPublishEvents = useMemo(
  //   () => collectionTypes.some((ct) => ct.options.draftAndPublish === true),
  //   [collectionTypes]
  // );

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

          isCreating,
          // isTriggering,
          // isTriggerIdle,

          // isDraftAndPublishEvents,
        }}
      />
    </Main>
  );
};

export default EditView;
