import { msg } from "@lingui/core/macro";
import type { I18n } from "@lingui/core";
import { z } from "zod";

import { isValidUsPhoneNumber } from "../../../utils/usPhoneNumber";

export type RequestFormValues = {
  firstName: string;
  lastName: string;
  apartmentNumber: string;
  phone: string;
};

export const createRequestFormSchema = (i18n: Pick<I18n, "_">) =>
  z.object({
    firstName: z
      .string()
      .trim()
      .min(1, i18n._(msg`Please enter your first name.`))
      .max(30),
    lastName: z
      .string()
      .trim()
      .min(1, i18n._(msg`Please enter your last name.`))
      .max(150),
    apartmentNumber: z
      .string()
      .trim()
      .min(1, i18n._(msg`Please enter your unit number.`))
      .max(15),
    phone: z
      .string()
      .refine(
        (value) => isValidUsPhoneNumber(value),
        i18n._(msg`Please enter a valid phone number.`)
      ),
  });
