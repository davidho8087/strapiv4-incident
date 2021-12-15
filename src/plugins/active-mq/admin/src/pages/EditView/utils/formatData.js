import { set } from "lodash";

const cleanData = (data) => {
  const webhooks = { ...data };

  console.log("webhooks", webhooks);
  console.log("data", data);
  set(webhooks, "headers", unformatHeaders(data.headers));
  console.log("after", webhooks);
  return webhooks;
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
