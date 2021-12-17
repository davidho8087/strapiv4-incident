import * as yup from "yup";
import { translatedErrors } from "@strapi/helper-plugin";
import { NAME_REGEX, URL_REGEX } from "./fieldsRegex";

const schema = yup.object().shape({
  name: yup
    .string(translatedErrors.string)
    .required(translatedErrors.required)
    .matches(NAME_REGEX, translatedErrors.regex),
  type: yup
    .string(translatedErrors.string)
    .required(translatedErrors.required)
    .matches(NAME_REGEX, translatedErrors.regex),
  dataTable: yup
    .string(translatedErrors.string)
    .required(translatedErrors.required)
    .matches(NAME_REGEX, translatedErrors.regex),
});

export default schema;
