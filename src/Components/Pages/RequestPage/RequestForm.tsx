import {
  Button,
  GeoSearchDropdown,
  Icon,
  LinkStyledButton,
  TextInput,
} from "@justfixnyc/component-library";
import classNames from "classnames";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import { ContentBox } from "../../ContentBox/ContentBox";
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
            <div className="request-form__geosearch-container">
              <GeoSearchDropdown
                id="request-street-address"
                className="request-form__geosearch"
                labelText={_(msg`Street address`)}
                placeholder={_(msg`Enter your address`)}
                initialAddress={streetAddress}
                invalid={Boolean(addressError)}
                invalidText={addressError ?? undefined}
                serviceUnavailableText={_(
                  msg`Geosearch is temporarily unavailable. Try again in a moment.`,
                )}
                onInputChange={handleAddressInputChange}
                onSelect={handleAddressSelect}
              />
            </div>
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
              <ContentBox
                className="request-form__rs-callout"
                variant="info"
                titleIcon={<Icon icon="check" aria-hidden="true" />}
                title={
                  <Trans>
                    Good news, it looks like your building includes rent
                    stabilized units.
                  </Trans>
                }
                action={
                  <LinkStyledButton onClick={scrollToFaq}>
                    <Trans>Learn what happens next</Trans>
                  </LinkStyledButton>
                }
              >
                <p>
                  <Trans>
                    Your building had {submitResponse.stabilized_units}{" "}
                    apartments that were registered as rent stabilized in{" "}
                    {submitResponse.latest_year}, the most recent year
                    available, according to property tax documents. While this
                    data doesn&apos;t guarantee that your apartment is rent
                    stabilized, it&apos;s a good sign that your apartment might
                    have a rent history document available.
                  </Trans>
                </p>
              </ContentBox>
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
