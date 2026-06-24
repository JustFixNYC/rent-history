import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
  Button,
  FormGroup,
  Icon,
  TextInput,
} from "@justfixnyc/component-library";

import {
  emailRhHistoryReportPdf,
  isAccountApiError,
} from "../../../api/account";
import type { ReportPdfLocale } from "../../../api/account";
import { buildReportPdfRequest } from "./ReportPDF";

// Same limit on auth-provider backend
const MAX_CC_EMAILS = 10;

type CcEmailRow = {
  email: string;
};

export type ReportEmailFormValues = {
  email: string;
  report_emails: CcEmailRow[];
};

export type ReportEmailFormOutcome =
  | { type: "success" }
  | { type: "email_failed"; message: string }
  | { type: "pdf_failed"; message: string }
  | { type: "request_failed"; message: string };

type ReportEmailFormProps = {
  accessToken: string;
  historyId: string;
  locale: ReportPdfLocale;
  onOutcome: (outcome: ReportEmailFormOutcome) => void;
  onSubmitStart?: () => void;
};

const isValidEmail = (value: string): boolean =>
  z.email().safeParse(value).success;

export const ReportEmailForm: React.FC<ReportEmailFormProps> = ({
  accessToken,
  historyId,
  locale,
  onOutcome,
  onSubmitStart,
}) => {
  const { _ } = useLingui();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .trim()
          .min(1, _(msg`Please enter your email address.`))
          .refine(isValidEmail, _(msg`Please enter a valid email address.`)),
        report_emails: z
          .array(
            z.object({
              email: z
                .string()
                .trim()
                .refine(
                  (value) => value === "" || isValidEmail(value),
                  _(msg`Please enter a valid email address.`)
                ),
            })
          )
          .max(
            MAX_CC_EMAILS,
            _(msg`You can add up to 10 additional recipients.`)
          ),
      }),
    [_]
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportEmailFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      report_emails: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "report_emails",
    control,
  });

  const anyCcErrors = fields.some(
    (_, index) => !!errors.report_emails?.[index]
  );

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    onSubmitStart?.();
    setIsSubmitting(true);

    const reportEmails = values.report_emails
      .map((row) => row.email.trim())
      .filter(Boolean);

    const body = {
      ...buildReportPdfRequest(locale, historyId),
      email: values.email.trim(),
      ...(reportEmails.length ? { report_emails: reportEmails } : {}),
    };

    try {
      await emailRhHistoryReportPdf(accessToken, body);
      onOutcome({ type: "success" });
    } catch (error) {
      if (isAccountApiError(error)) {
        const pdfStatus = error.reportEmailSteps?.pdf?.status;
        const emailStatus = error.reportEmailSteps?.email?.status;

        if (pdfStatus === "succeeded" && emailStatus === "failed") {
          onOutcome({
            type: "email_failed",
            message: _(
              msg`Your report PDF was generated, but we could not send the email. You can download it below or try again.`
            ),
          });
          return;
        }

        if (pdfStatus === "failed") {
          onOutcome({
            type: "pdf_failed",
            message: _(
              msg`We could not generate your report PDF. Please try again.`
            ),
          });
          return;
        }

        setSubmitError(error.message);
        onOutcome({ type: "request_failed", message: error.message });
        return;
      }

      const fallback = _(msg`Something went wrong. Please try again.`);
      setSubmitError(fallback);
      onOutcome({ type: "request_failed", message: fallback });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form className="report-email-form" onSubmit={onSubmit} noValidate>
      <FormGroup
        legendText={
          <h2 className="report-email-form__heading">
            <Trans>Email your report to yourself</Trans>
          </h2>
        }
        helperElement={
          <p className="report-email-form__helper">
            <Trans>
              We will generate your report PDF and email it to you. You can
              optionally send copies to other people you trust.
            </Trans>
          </p>
        }
        className="report-email-form__group"
        invalid={!!errors.email || anyCcErrors}
      >
        <TextInput
          {...register("email")}
          id="report-email-primary"
          labelText={_(msg`Your email (required)`)}
          type="email"
          autoComplete="email"
          invalid={!!errors.email}
          invalidText={errors.email?.message}
          invalidRole="status"
        />

        {fields.length > 0 ? (
          <FormGroup
            legendText={
              _(msg`Additional recipients`) + " " + _(msg`(optional)`)
            }
            className="report-email-form__cc-group"
          >
            {fields.map((field, index) => (
              <section key={field.id} className="report-email-form__cc-row">
                <TextInput
                  {...register(`report_emails.${index}.email`)}
                  id={`report-email-cc-${index}`}
                  labelText=""
                  aria-label={_(msg`Additional email ${index + 1}`)}
                  invalid={!!errors.report_emails?.[index]?.email}
                  invalidText={errors.report_emails?.[index]?.email?.message}
                  invalidRole="status"
                  type="email"
                />
                <Button
                  labelText={_(msg`Remove`)}
                  labelIcon="xmark"
                  variant="tertiary"
                  size="small"
                  type="button"
                  onClick={() => remove(index)}
                />
              </section>
            ))}
          </FormGroup>
        ) : null}

        {fields.length < MAX_CC_EMAILS ? (
          <button
            className="report-email-form__add-recipient jfcl-link"
            type="button"
            onClick={() => append({ email: "" })}
          >
            <Icon icon="plus" /> <Trans>Add recipients</Trans>
          </button>
        ) : null}
      </FormGroup>

      <Button
        labelText={_(msg`Email report`)}
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
      />

      {submitError ? (
        <p className="report-page__error" role="alert">
          {submitError}
        </p>
      ) : null}
    </form>
  );
};
