import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

import { useSendRhRequest } from "../../../api/requester";
import {
  isEmailSendFailedError,
  isRequesterApiError,
} from "../../../api/requester/errors";
import type { SendRhRequestResponse } from "../../../api/requester/types";
import type { GeosearchFeature } from "../../../api/thirdParty/geosearch";
import { parseUsPhoneNationalDigits } from "../../../utils/usPhoneNumber";
import { formatPhone } from "../shared/flowSession";
import { geosearchFeatureToRequestPayload } from "./requestAddress";
import { getReferralSlugForSubmit } from "./referralStorage";
import {
  createRequestFormSchema,
  type RequestFormValues,
} from "./requestFormSchema";

type GeoSearchDropdownSelection = {
  feature: GeosearchFeature;
  option: { label: string };
};

const isTypingInputAction = (meta: { action?: string }) =>
  meta.action === "input-change";

const DRF_FIELD_TO_FORM: Record<string, keyof RequestFormValues | "address"> = {
  first_name: "firstName",
  last_name: "lastName",
  apartment_number: "apartmentNumber",
  phone_number: "phone",
  address: "address",
  borough: "address",
  bbl: "address",
  zipcode: "address",
};

const selectAddressErrorMessage = (
  translate: (message: ReturnType<typeof msg>) => string
) => translate(msg`Please select an address from the list.`);

export function useRequestForm() {
  const { i18n, _ } = useLingui();
  const sendRhRequestMutation = useSendRhRequest();

  const [streetAddress, setStreetAddress] = useState("");
  const selectedFeatureRef = useRef<GeosearchFeature | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitResponse, setSubmitResponse] =
    useState<SendRhRequestResponse | null>(null);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(createRequestFormSchema(i18n)),
    defaultValues: {
      firstName: "",
      lastName: "",
      apartmentNumber: "",
      phone: "",
    },
  });

  const clearAddressSelection = useCallback(() => {
    selectedFeatureRef.current = null;
  }, []);

  const handleAddressInputChange = useCallback(
    (value: string, meta: { action?: string }) => {
      if (!isTypingInputAction(meta)) {
        return value;
      }
      setStreetAddress(value);
      clearAddressSelection();
      setAddressError(null);
      return value;
    },
    [clearAddressSelection]
  );

  const handleAddressSelect = useCallback(
    (selection: GeoSearchDropdownSelection | null) => {
      if (!selection) {
        return;
      }

      selectedFeatureRef.current = selection.feature;
      const payload = geosearchFeatureToRequestPayload(selection.feature);
      if (payload) {
        setStreetAddress(payload.address);
      } else {
        clearAddressSelection();
      }
      setAddressError(null);
    },
    [clearAddressSelection]
  );

  const reset = useCallback(() => {
    form.reset();
    setStreetAddress("");
    clearAddressSelection();
    setAddressError(null);
    setFormError(null);
    setSubmitted(false);
    setSubmitResponse(null);
  }, [clearAddressSelection, form]);

  const applyDrfFieldErrors = useCallback(
    (raw: unknown) => {
      if (typeof raw !== "object" || raw === null) {
        return false;
      }

      const record = raw as Record<string, unknown>;
      let mapped = false;

      for (const [key, value] of Object.entries(record)) {
        const formKey = DRF_FIELD_TO_FORM[key];
        if (!formKey) {
          continue;
        }

        const message = Array.isArray(value)
          ? String(value[0])
          : typeof value === "string"
          ? value
          : null;
        if (!message) {
          continue;
        }

        if (formKey === "address") {
          setAddressError(message);
        } else {
          form.setError(formKey, { message });
        }
        mapped = true;
      }

      return mapped;
    },
    [form]
  );

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);

    const feature = selectedFeatureRef.current;
    if (!feature) {
      setAddressError(selectAddressErrorMessage(_));
      return;
    }

    const addressPayload = geosearchFeatureToRequestPayload(feature);
    if (!addressPayload) {
      setAddressError(selectAddressErrorMessage(_));
      return;
    }

    const phoneDigits = parseUsPhoneNationalDigits(values.phone);
    if (!phoneDigits) {
      form.setError("phone", {
        message: _(msg`Please enter a valid phone number.`),
      });
      return;
    }

    const referralSlug = getReferralSlugForSubmit();

    try {
      const response = await sendRhRequestMutation.mutateAsync({
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        apartment_number: values.apartmentNumber.trim(),
        phone_number: phoneDigits,
        address: addressPayload.address,
        borough: addressPayload.borough,
        zipcode: addressPayload.zipcode || undefined,
        bbl: addressPayload.bbl,
        locale: i18n.locale as "en" | "es",
        source: "online",
        address_verified: true,
        ...(referralSlug ? { referral_slug: referralSlug } : {}),
      });

      setSubmitted(true);
      setSubmitResponse(response);
    } catch (error) {
      if (isEmailSendFailedError(error)) {
        setFormError(
          _(msg`We couldn't send your request right now. Please try again.`)
        );
        return;
      }

      if (isRequesterApiError(error) && error.status === 400) {
        const mapped = applyDrfFieldErrors(error.raw);
        if (!mapped) {
          setFormError(_(msg`Something went wrong. Please try again.`));
        }
        return;
      }

      setFormError(_(msg`Something went wrong. Please try again.`));
    }
  });

  const scrollToFaq = useCallback(() => {
    document
      .getElementById("request-faq")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return {
    form,
    streetAddress,
    addressError,
    formError,
    submitted,
    submitResponse,
    isSubmitting: sendRhRequestMutation.isPending,
    onSubmit,
    reset,
    handleAddressInputChange,
    handleAddressSelect,
    onPhoneChange: (value: string) =>
      form.setValue("phone", formatPhone(value)),
    scrollToFaq,
  };
}
