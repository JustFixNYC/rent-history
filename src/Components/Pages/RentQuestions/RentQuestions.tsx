import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { SelectButton, TextInput } from "@justfixnyc/component-library";

import { analyzePath } from "../../../routes/analyzeRoutes";
import {
  isAccountApiError,
  setRhHistoryApartmentInfo,
} from "../../../api/account";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";
import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";
import { FlowNav } from "../../FlowNav/FlowNav";
import {
  getInitialRentQuestionsSubstep,
  readRentQuestionsState,
  writeRentQuestionsState,
} from "./rentQuestionsState";
import "./RentQuestions.scss";

type RentQuestionsForm = {
  monthlyRent: string;
};

const RENT_SUBSTEP_COUNT = 2;

const parseMonthlyRent = (raw: string): number =>
  Number(raw.replace(/[$,\s]/g, ""));

export const RentQuestions: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const currentState = readRentQuestionsState();
  const [substep, setSubstep] = useState<0 | 1>(() =>
    getInitialRentQuestionsSubstep(currentState)
  );
  const [livesInApt, setLivesInApt] = useState<boolean | null>(
    currentState.livesInApt
  );
  const [livesInAptError, setLivesInAptError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const persistState = (updates: Partial<typeof currentState>) => {
    writeRentQuestionsState({
      livesInApt,
      monthlyRent: form.getValues("monthlyRent"),
      ...updates,
    });
  };

  const saveApartmentInfo = async (payload: {
    lives_in_apt: boolean;
    current_rent?: number;
  }) => {
    const session = getRhAuthSession();
    const historyId = getRhHistoryId();
    if (!session?.accessToken || !historyId) {
      setSubmitError(
        _(
          msg`Your session is missing a rent history record. Please sign in again.`
        )
      );
      return false;
    }

    try {
      setIsSaving(true);
      await setRhHistoryApartmentInfo(session.accessToken, {
        history_id: historyId,
        ...payload,
      });
      return true;
    } catch (error) {
      if (isAccountApiError(error)) {
        setSubmitError(error.message);
        return false;
      }
      setSubmitError(_(msg`Unable to save your answers. Please try again.`));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleLivesInAptNext = async () => {
    setSubmitError(null);
    setLivesInAptError(null);

    if (livesInApt === null) {
      setLivesInAptError(_(msg`Please select Yes or No.`));
      return;
    }

    persistState({ livesInApt });

    if (livesInApt) {
      setSubstep(1);
      return;
    }

    const saved = await saveApartmentInfo({ lives_in_apt: false });
    if (saved) {
      navigate(analyzePath(i18n.locale, "scanner"));
    }
  };

  const saveRentAndContinue = form.handleSubmit(async (values) => {
    setSubmitError(null);
    persistState({ livesInApt: true, monthlyRent: values.monthlyRent });

    const saved = await saveApartmentInfo({
      lives_in_apt: true,
      current_rent: parseMonthlyRent(values.monthlyRent),
    });
    if (saved) {
      navigate(analyzePath(i18n.locale, "scanner"));
    }
  });

  const handleBack = () => {
    if (isSaving) return;
    if (substep === 1) {
      setSubstep(0);
      return;
    }
    navigate(analyzePath(i18n.locale, "confirm-address"));
  };

  const handleNext = () => {
    if (substep === 0) {
      void handleLivesInAptNext();
      return;
    }
    void saveRentAndContinue();
  };

  const primaryLabel = isSaving ? _(msg`Saving…`) : _(msg`Next`);

  return (
    <div id="rent-questions-page">
      <section className="rent-questions">
        <AnalysisFlowProgress
          stepId="rent-questions"
          substepIndex={substep}
          substepCount={RENT_SUBSTEP_COUNT}
        />

        {substep === 0 ? (
          <>
            <div className="rent-questions__intro">
              <h2>
                <Trans>
                  Do you currently live in the apartment associated with this
                  rent history?
                </Trans>
              </h2>
              <p>
                <Trans>
                  This helps us determine if you are currently being
                  overcharged.
                </Trans>
              </p>
            </div>
            <article className="rent-questions__card">
              <div
                className="rent-questions__yes-no"
                role="radiogroup"
                aria-label={_(
                  msg`Do you currently live in the apartment associated with this rent history?`
                )}
              >
                <SelectButton
                  id="rent-questions-lives-in-apt-yes"
                  name="rent-questions-lives-in-apt"
                  className="rent-questions__yes-no-option"
                  labelText={_(msg`Yes`)}
                  value="true"
                  checked={livesInApt === true}
                  disabled={isSaving}
                  onChange={() => {
                    setLivesInApt(true);
                    setLivesInAptError(null);
                  }}
                />
                <SelectButton
                  id="rent-questions-lives-in-apt-no"
                  name="rent-questions-lives-in-apt"
                  className="rent-questions__yes-no-option"
                  labelText={_(msg`No`)}
                  value="false"
                  checked={livesInApt === false}
                  disabled={isSaving}
                  onChange={() => {
                    setLivesInApt(false);
                    setLivesInAptError(null);
                  }}
                />
              </div>
              {livesInAptError ? (
                <p className="rent-questions__error" role="alert">
                  {livesInAptError}
                </p>
              ) : null}
            </article>
          </>
        ) : (
          <>
            <div className="rent-questions__intro">
              <h2>
                <Trans>What is your current monthly rent?</Trans>
              </h2>
              <p>
                <Trans>
                  Please enter the full monthly rent for the entire apartment.
                  This will help us compare what you pay to what is listed in
                  your rent history.
                </Trans>
              </p>
            </div>
            <article className="rent-questions__card">
              <form
                className="rent-questions__form"
                onSubmit={saveRentAndContinue}
              >
                <TextInput
                  id="rent-questions-current-rent-input"
                  labelText={_(msg`Monthly rent amount`)}
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
                  invalid={Boolean(form.formState.errors.monthlyRent)}
                  invalidText={form.formState.errors.monthlyRent?.message}
                />
              </form>
            </article>
          </>
        )}

        {submitError ? (
          <p
            className="rent-questions__error rent-questions__error--global"
            role="alert"
          >
            {submitError}
          </p>
        ) : null}

        <FlowNav
          onBack={handleBack}
          onNext={handleNext}
          isNextLoading={isSaving}
          backDisabled={isSaving}
          nextLabel={primaryLabel}
        />
      </section>
    </div>
  );
};
