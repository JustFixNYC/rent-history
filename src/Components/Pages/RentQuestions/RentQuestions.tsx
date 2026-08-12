import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button, Icon, TextInput } from "@justfixnyc/component-library";

import {
  isAccountApiError,
  setRhHistoryCurrentRent,
} from "../../../api/account";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";
import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";
import {
  readRentQuestionsState,
  writeRentQuestionsState,
} from "./rentQuestionsState";
import "./RentQuestions.scss";

type RentQuestionsForm = {
  monthlyRent: string;
};

const parseMonthlyRent = (raw: string): number =>
  Number(raw.replace(/[$,\s]/g, ""));

export const RentQuestions: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const currentState = readRentQuestionsState();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSavingRent, setIsSavingRent] = useState(false);

  const form = useForm<RentQuestionsForm>({
    resolver: zodResolver(
      z.object({
        monthlyRent: z
          .string()
          .trim()
          .min(1, _(msg`Please enter your monthly rent.`))
          .refine((value) => {
            const normalized = value.replace(/[$,\s]/g, "");
            return !Number.isNaN(Number(normalized)) && Number(normalized) > 0;
          }, _(msg`Please enter a valid rent amount.`)),
      })
    ),
    defaultValues: {
      monthlyRent: currentState.monthlyRent,
    },
  });

  const saveAndContinue = form.handleSubmit(async (values) => {
    setSubmitError(null);
    writeRentQuestionsState({
      monthlyRent: values.monthlyRent,
    });

    const session = getRhAuthSession();
    const historyId = getRhHistoryId();
    if (!session?.accessToken || !historyId) {
      setSubmitError(
        _(
          msg`Your session is missing a rent history record. Please sign in again.`
        )
      );
      return;
    }

    const currentRent = parseMonthlyRent(values.monthlyRent);

    try {
      setIsSavingRent(true);
      await setRhHistoryCurrentRent(session.accessToken, {
        history_id: historyId,
        current_rent: currentRent,
      });
      navigate(`/${i18n.locale}/scanner`);
    } catch (error) {
      if (isAccountApiError(error)) {
        setSubmitError(error.message);
        return;
      }
      setSubmitError(_(msg`Unable to save your rent. Please try again.`));
    } finally {
      setIsSavingRent(false);
    }
  });

  const primaryLabel = isSavingRent ? _(msg`Saving…`) : _(msg`Continue`);

  return (
    <div id="rent-questions-page">
      <section className="postscan-body">
        <AnalysisFlowProgress stepId="rent-questions" />

        <article className="postscan-card">
          <form className="postscan-card__content" onSubmit={saveAndContinue}>
            <h2>
              <Trans>
                What is the total monthly rent for your entire apartment?
              </Trans>
            </h2>
            <p>
              <Trans>
                This will help in our analysis of your rent history TK
              </Trans>
            </p>
            <TextInput
              id="postscan-current-rent-input"
              labelText=""
              className="postscan-rent-input"
              value={form.watch("monthlyRent")}
              onChange={(event) =>
                form.setValue("monthlyRent", event.target.value, {
                  shouldValidate: true,
                })
              }
              onBlur={() => {
                void form.trigger("monthlyRent");
              }}
              placeholder="$"
              aria-label={_(msg`Current monthly rent`)}
              invalid={Boolean(form.formState.errors.monthlyRent)}
              invalidText={form.formState.errors.monthlyRent?.message}
            />
            {submitError ? (
              <p className="postscan-field-error" role="alert">
                {submitError}
              </p>
            ) : null}
          </form>
        </article>

        <div className="postscan-actions">
          <button
            type="button"
            className="postscan-link-btn"
            onClick={() => navigate(`/${i18n.locale}/confirm-address`)}
            disabled={isSavingRent}
          >
            <Icon icon="chevronLeft" />
            <Trans>Back</Trans>
          </button>
          <Button
            className="postscan-primary-btn"
            labelText={primaryLabel}
            onClick={saveAndContinue}
            disabled={isSavingRent}
          />
        </div>
      </section>
    </div>
  );
};
