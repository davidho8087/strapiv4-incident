import axiosInstance from "./axiosInstance";
import getRequestURL from "./getRequestURL";

export const fetchActiveMqs = async () => {
  const { data } = await axiosInstance.get("/active-mq");

  return data;
};

export const updateActiveMqSettings = async (payload) => {
  console.log("payload", payload);

  const { data } = await axiosInstance.put("/active-mq", payload);

  return data;
};

export const createActiveMq = async (payload) => {
  console.log("createActiveMq", payload);

  //const { data } = await axiosInstance.post("api/active-mqs/", payload);

  const { data } = await axiosInstance.post("/active-mq", payload);

  return data;
};

export const updateActiveMq = async ({ id, body }) => {
  console.log("id", id);
  console.log("body", body);

  const { data } = await axiosInstance.put(`/active-mq/${id}`, body);

  return data;
};
