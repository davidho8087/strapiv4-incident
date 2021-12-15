import axiosInstance from "./axiosInstance";
import getRequestURL from "./getRequestURL";

export const fetchActiveMqSettings = async () => {
  const { data } = await axiosInstance.get("/active-mq");

  return data;
};

export const updateActiveMqSettings = async (payload) => {
  console.log("payload", payload);

  const { data } = await axiosInstance.put(
    "/active-mq/updateSettings",
    payload
  );

  return data;
};
