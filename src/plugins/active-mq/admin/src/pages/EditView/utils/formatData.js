import { set } from "lodash";

const cleanData = (data) => {
  const activeMq = { ...data };

  // console.log("webhooks", webhooks);
  // console.log("data", data);
  set(activeMq, "headers", unformatHeaders(data.headers));
  // console.log("after", webhooks);
  return activeMq;
};

const unformatHeaders = (headers) => {
  return headers.reduce((acc, current) => {
    const { key, value } = current;

    if (key !== "") {
      return {
        ...acc,
        [key]: value,
      };
    }

    return acc;
  }, {});
};

export default cleanData;
