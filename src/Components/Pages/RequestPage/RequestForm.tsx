import {
  Button,
  CalloutBox,
  GeoSearchDropdown,
  LinkStyledButton,
  TextInput,
} from "@justfixnyc/component-library";
import classNames from "classnames";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import { PartnerReferralCallout } from "./PartnerReferralCallout";
import type { ReferralPartner } from "./referralStorage";
import { useRequestForm } from "./useRequestForm";

import "./RequestForm.scss";

export type RequestFormProps = {
  referralPartner?: ReferralPartner | null;
  onReferralOptOut?: () => void;
};

export const RequestForm: React.FC<RequestFormProps> = ({
  referralPartner,
  onReferralOptOut,
}) => {
  const { _ } = useLingui();
  const {
    form,
    streetAddress,
    addressError,
    formError,
    submitted,
    submitResponse,
    isSubmitting,
    onSubmit,
    reset,
    handleAddressInputChange,
    handleAddressSelect,
    onPhoneChange,
    scrollToFaq,
  } = useRequestForm();

  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const phoneValue = watch("phone");

  const showRsCallout =
    submitted &&
    submitResponse?.stabilized_units != null &&
    submitResponse.stabilized_units > 0;

  return (
    <div className="request-form">
      {referralPartner && onReferralOptOut ? (
        <PartnerReferralCallout
          partner={referralPartner}
          onOptOut={onReferralOptOut}
        />
      ) : null}

      <form className="request-form__card" onSubmit={onSubmit} noValidate>
        <div className="request-form__fields">
          <TextInput
            {...register("firstName")}
            id="request-first-name"
            className={classNames({
              "request-form__field--submitted": submitted,
            })}
            labelText={_(msg`First name`)}
            autoComplete="given-name"
            disabled={submitted}
            invalid={Boolean(errors.firstName)}
            invalidText={errors.firstName?.message}
          />

          <TextInput
            {...register("lastName")}
            id="request-last-name"
            className={classNames({
              "request-form__field--submitted": submitted,
            })}
            labelText={_(msg`Last name`)}
            autoComplete="family-name"
            disabled={submitted}
            invalid={Boolean(errors.lastName)}
            invalidText={errors.lastName?.message}
          />

          {submitted ? (
            <TextInput
              id="request-street-address"
              className="request-form__field--submitted"
              labelText={_(msg`Street address`)}
              value={streetAddress}
              disabled
            />
          ) : (
            <GeoSearchDropdown
              id="request-street-address"
              className="request-form__geosearch"
              labelText={_(msg`Street address`)}
              placeholder={_(msg`Enter your address`)}
              initialAddress={streetAddress}
              invalid={Boolean(addressError)}
              invalidText={addressError ?? undefined}
              serviceUnavailableText={_(
                msg`Geosearch is temporarily unavailable. Try again in a moment.`
              )}
              onInputChange={handleAddressInputChange}
              onSelect={handleAddressSelect}
            />
          )}

          <div className="request-form__unit-field">
            <TextInput
              {...register("apartmentNumber")}
              id="request-unit"
              className={classNames({
                "request-form__field--submitted": submitted,
              })}
              labelText={_(msg`Unit`)}
              disabled={submitted}
              invalid={Boolean(errors.apartmentNumber)}
              invalidText={errors.apartmentNumber?.message}
            />
            {!submitted ? (
              <p className="request-form__unit-helper">
                <Trans>Enter your apartment or unit number.</Trans>
              </p>
            ) : null}
          </div>

          <TextInput
            id="request-phone"
            className={classNames({
              "request-form__field--submitted": submitted,
            })}
            labelText={_(msg`Phone number`)}
            type="tel"
            autoComplete="tel"
            placeholder={_(msg`(123) 456-7890`)}
            value={phoneValue}
            onChange={(event) => onPhoneChange(event.target.value)}
            disabled={submitted}
            invalid={Boolean(errors.phone)}
            invalidText={errors.phone?.message}
          />
        </div>

        {formError ? (
          <p className="request-form__error" role="alert">
            {formError}
          </p>
        ) : null}

        {submitted ? (
          <div className="request-form__success">
            <Button
              type="button"
              className="request-form__submit request-form__submit--success"
              variant="secondary"
              labelIcon="check"
              labelText={_(msg`Request Submitted`)}
              disabled
            />

            {showRsCallout && submitResponse ? (
              <CalloutBox className="request-form__rs-callout">
                <p className="request-form__rs-callout-title">
                  <Trans>
                    Good news, it looks like your building includes rent
                    stabilized units.
                  </Trans>
                </p>
                <p className="request-form__rs-callout-body">
                  <Trans>
                    Your building had {submitResponse.stabilized_units}{" "}
                    apartments that were registered as rent stabilized in{" "}
                    {submitResponse.latest_year}, the most recent year available
                    in public records.
                  </Trans>
                </p>
                <LinkStyledButton
                  className="request-form__rs-callout-link"
                  onClick={scrollToFaq}
                >
                  <Trans>Learn what happens next</Trans>
                </LinkStyledButton>
              </CalloutBox>
            ) : null}

            <LinkStyledButton
              className="request-form__submit-another"
              onClick={reset}
            >
              <Trans>Submit another request</Trans>
            </LinkStyledButton>
          </div>
        ) : (
          <Button
            type="submit"
            className="request-form__submit"
            variant="primary"
            labelText={_(msg`Submit request`)}
            disabled={isSubmitting}
          />
        )}
      </form>
    </div>
  );
};
