import { useState } from "react";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useNavigate } from "react-router-dom";
import { Button, Icon, TextInput } from "@justfixnyc/component-library";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { LocaleLink } from "../../../i18n";
import "./PostScanFlow.scss";

type PostScanStep = "confirmAddress" | "rentAmount";

const PostScanFlow: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const [step, setStep] = useState<PostScanStep>("confirmAddress");
  const rentForm = useForm<{ monthlyRent: string }>({
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
      }),
    ),
    defaultValues: { monthlyRent: "" },
  });

  const rentValue = rentForm.watch("monthlyRent");
  const isRentValid = Boolean(rentValue?.trim());

  const onBack = () => {
    if (step === "confirmAddress") {
      navigate(`/${i18n.locale}/review`);
      return;
    }
    setStep("confirmAddress");
  };

  const onPrimaryAction = () => {
    if (step === "confirmAddress") {
      setStep("rentAmount");
      return;
    }
    const formIsValid = rentForm.trigger("monthlyRent");
    void formIsValid.then((isValid) => {
      if (!isValid) return;
      navigate(`/${i18n.locale}/analyze`);
    });
  };

  const onRentSubmit = rentForm.handleSubmit(() => {
    navigate(`/${i18n.locale}/analyze`);
  });

  return (
    <div id="post-scan-flow-page">
      <header className="postscan-header">
        <div className="postscan-header__brand">
          <Trans>Rent History NYC</Trans>
        </div>
        <button
          className="postscan-header__menu"
          type="button"
          aria-label={_(msg`Menu`)}
        >
          <Icon icon="bars" />
          <Trans>Menu</Trans>
        </button>
      </header>

      <section className="postscan-body">
        <div className="postscan-progress">
          <p>
            {step === "confirmAddress" ? (
              <Trans>Step 4: Confirm address</Trans>
            ) : (
              <Trans>Step 5: Provide your rent</Trans>
            )}
          </p>
          <div className="postscan-progress__bar">
            <span />
          </div>
        </div>

        <article className="postscan-card">
          {step === "confirmAddress" ? (
            <>
              <div className="postscan-card__content">
                <h1>
                  <Trans>Apt. 1</Trans>
                  <br />
                  <Trans>228 Atlantic Avenue</Trans>
                  <br />
                  <Trans>Brooklyn, New York 11201</Trans>
                </h1>
                <p>
                  <Trans>
                    If this address does not match the address on the rent
                    history document,
                  </Trans>{" "}
                  <button type="button" className="postscan-inline-link">
                    <Trans>edit the address</Trans>
                  </button>
                  <Trans>.</Trans>
                </p>
              </div>
              <div className="postscan-map-placeholder">
                <Trans>Map image</Trans>
              </div>
            </>
          ) : (
            <form className="postscan-card__content" onSubmit={onRentSubmit}>
              <h1>
                <Trans>Current monthly rent</Trans>
              </h1>
              <p>
                <Trans>
                  We ask for your monthly rent so that we can calculate if you
                  are currently being overcharged.
                </Trans>
              </p>
              <TextInput
                id="postscan-current-rent-input"
                labelText=""
                className="postscan-rent-input"
                value={rentValue}
                onChange={(event) =>
                  rentForm.setValue("monthlyRent", event.target.value, {
                    shouldValidate: true,
                  })
                }
                onBlur={() => {
                  void rentForm.trigger("monthlyRent");
                }}
                placeholder="$"
                aria-label={_(msg`Current monthly rent`)}
                invalid={Boolean(rentForm.formState.errors.monthlyRent)}
                invalidText={rentForm.formState.errors.monthlyRent?.message}
              />
            </form>
          )}
        </article>

        <div className="postscan-actions">
          <button type="button" className="postscan-link-btn" onClick={onBack}>
            <Icon icon="chevronLeft" />
            <Trans>Back</Trans>
          </button>
          <Button
            className="postscan-primary-btn"
            labelText={
              step === "confirmAddress"
                ? _(msg`Continue`)
                : _(msg`Start analysis`)
            }
            onClick={step === "confirmAddress" ? onPrimaryAction : onRentSubmit}
            disabled={step === "rentAmount" && !isRentValid}
          />
        </div>
      </section>

      <footer className="postscan-footer">
        <section className="postscan-footer__disclaimer">
          <h3>
            <Trans>Disclaimer</Trans>
          </h3>
          <p>
            <Trans>
              The information on this website does not constitute legal advice
              and must not be used as a substitute for the advice of a lawyer
              qualified to give advice on legal issues pertaining to housing.
            </Trans>
          </p>
        </section>
        <nav
          className="postscan-footer__links"
          aria-label={_(msg`Legal and feedback`)}
        >
          <LocaleLink to="privacy_policy">
            <Trans>Privacy policy</Trans>
          </LocaleLink>
          <LocaleLink to="terms_of_use">
            <Trans>Terms of use</Trans>
          </LocaleLink>
          <a
            href="https://www.justfix.org/en/contact-us"
            target="_blank"
            rel="noreferrer"
          >
            <Trans>Feedback form</Trans>
          </a>
        </nav>
        <section className="postscan-footer__brand">
          <p className="postscan-footer__title">
            <Trans>Rent History NYC</Trans>
          </p>
          <p>
            <Trans>By</Trans>{" "}
            <a href="https://www.justfix.org" target="_blank" rel="noreferrer">
              <Trans>JustFix</Trans>
            </a>
          </p>
        </section>
      </footer>
    </div>
  );
};

export default PostScanFlow;
