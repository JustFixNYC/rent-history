import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button, Icon, TextInput } from "@justfixnyc/component-library";

import { readPostScanFlowState, writePostScanFlowState } from "./postScanState";
import "./PostScanFlow.scss";

type RentQuestionsForm = {
  monthlyRent: string;
};

export const RentQuestions: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const currentState = readPostScanFlowState();

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
      monthlyRent: currentState.rentQuestions.monthlyRent,
    },
  });

  const saveAndContinue = form.handleSubmit(async (values) => {
    writePostScanFlowState({
      ...currentState,
      rentQuestions: {
        monthlyRent: values.monthlyRent,
      },
    });

    navigate(`/${i18n.locale}/scanner`);
  });

  return (
    <div id="post-scan-flow-page">
      <section className="postscan-body">
        <div className="postscan-progress">
          <p>
            <Trans>Step 5: Provide your rent</Trans>
          </p>
          <div className="postscan-progress__bar">
            <span />
          </div>
        </div>

        <article className="postscan-card">
          <form className="postscan-card__content" onSubmit={saveAndContinue}>
            <h1>
              <Trans>Current monthly rent</Trans>
            </h1>
            <p>
              <Trans>
                We ask for your monthly rent so that we can calculate if you are
                currently being overcharged.
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
          </form>
        </article>

        <div className="postscan-actions">
          <button
            type="button"
            className="postscan-link-btn"
            onClick={() => navigate(`/${i18n.locale}/post-scan`)}
          >
            <Icon icon="chevronLeft" />
            <Trans>Back</Trans>
          </button>
          <Button
            className="postscan-primary-btn"
            labelText={_(msg`Start analysis`)}
            onClick={saveAndContinue}
          />
        </div>
      </section>
    </div>
  );
};
