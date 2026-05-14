import { useState } from "react";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useNavigate } from "react-router-dom";
import {
  Button,
  GeoSearchDropdown,
  GeoSearchDropdownSelection,
  Icon,
  TextInput,
} from "@justfixnyc/component-library";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import "./PostScanFlow.scss";

type PostScanStep = "confirmAddress" | "rentAmount";
type AddressFlowState =
  | "confirmExtracted"
  | "editAddress"
  | "enterAddress"
  | "confirmUpdated";

type AddressState = {
  streetAddress: string;
  unitNumber: string;
  cityStateZip: string;
};

const EXTRACTED_ADDRESS: AddressState = {
  streetAddress: "228 Atlantic Avenue",
  unitNumber: "1",
  cityStateZip: "Brooklyn, New York 11201",
};

const UPDATED_ADDRESS: AddressState = {
  streetAddress: "220 Atlantic Avenue",
  unitNumber: "1",
  cityStateZip: "Brooklyn, New York 11201",
};

const toTitleCase = (value: string) =>
  value.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );

const getAddressStateFromSelection = (
  selection: GeoSearchDropdownSelection | null,
  previousState: AddressState
): AddressState => {
  if (!selection) return previousState;

  const featureProperties = selection.feature.properties;
  const streetAddress = toTitleCase(
    `${featureProperties.housenumber ?? ""} ${featureProperties.street ?? ""}`
  ).trim();
  const cityStateZip = [
    featureProperties.borough ? toTitleCase(featureProperties.borough) : "",
    "New York",
    featureProperties.postalcode ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    ...previousState,
    streetAddress:
      streetAddress ||
      toTitleCase(featureProperties.name ?? "") ||
      selection.option.label,
    cityStateZip: cityStateZip || previousState.cityStateZip,
  };
};

const isTypingInputAction = (meta: { action?: string }) =>
  meta.action === "input-change";

const PostScanFlow: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;
  const [step, setStep] = useState<PostScanStep>("confirmAddress");
  const [addressFlowState, setAddressFlowState] =
    useState<AddressFlowState>("confirmExtracted");
  const [confirmedAddress, setConfirmedAddress] =
    useState<AddressState>(EXTRACTED_ADDRESS);
  const [draftAddress, setDraftAddress] = useState<AddressState>({
    streetAddress: EXTRACTED_ADDRESS.streetAddress,
    unitNumber: "",
    cityStateZip: EXTRACTED_ADDRESS.cityStateZip,
  });
  const [addressError, setAddressError] = useState<string | null>(null);
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
      })
    ),
    defaultValues: { monthlyRent: "" },
  });

  const rentValue = rentForm.watch("monthlyRent");
  const isRentValid = Boolean(rentValue?.trim());

  const onBack = () => {
    if (step === "confirmAddress" && addressFlowState === "editAddress") {
      setAddressFlowState("confirmExtracted");
      setAddressError(null);
      return;
    }
    if (step === "confirmAddress") {
      navigate(`/${i18n.locale}/review`);
      return;
    }
    setStep("confirmAddress");
  };

  const onPrimaryAction = () => {
    if (step === "confirmAddress") {
      if (addressFlowState === "enterAddress") {
        if (!draftAddress.streetAddress.trim()) {
          setAddressError(_(msg`Enter an address to get started`));
          return;
        }
        setConfirmedAddress({
          streetAddress: draftAddress.streetAddress.trim(),
          unitNumber: draftAddress.unitNumber.trim(),
          cityStateZip: draftAddress.cityStateZip,
        });
        setAddressError(null);
        setAddressFlowState("confirmUpdated");
        return;
      }
      setStep("rentAmount");
      return;
    }
    const formIsValid = rentForm.trigger("monthlyRent");
    void formIsValid.then((isValid) => {
      if (!isValid) return;
      navigate(`/${i18n.locale}/scanner`);
    });
  };

  const onRentSubmit = rentForm.handleSubmit(() => {
    navigate(`/${i18n.locale}/scanner`);
  });

  const onEditAddress = () => {
    setDraftAddress({
      streetAddress: confirmedAddress.streetAddress,
      unitNumber: confirmedAddress.unitNumber,
      cityStateZip: confirmedAddress.cityStateZip,
    });
    setAddressError(null);
    setAddressFlowState("editAddress");
  };

  const onSaveAddress = () => {
    if (!draftAddress.streetAddress.trim()) {
      setAddressError(_(msg`Enter an address to get started`));
      return;
    }

    setConfirmedAddress({
      streetAddress: draftAddress.streetAddress.trim(),
      unitNumber: draftAddress.unitNumber.trim(),
      cityStateZip: draftAddress.cityStateZip,
    });
    setAddressError(null);
    setAddressFlowState("confirmUpdated");
  };

  const applyDevScenario = (scenario: AddressFlowState) => {
    setStep("confirmAddress");
    setAddressError(null);
    setAddressFlowState(scenario);

    if (scenario === "confirmUpdated") {
      setConfirmedAddress(UPDATED_ADDRESS);
      setDraftAddress(UPDATED_ADDRESS);
      return;
    }

    setConfirmedAddress(EXTRACTED_ADDRESS);
    setDraftAddress(
      scenario === "enterAddress"
        ? { ...EXTRACTED_ADDRESS, unitNumber: "" }
        : EXTRACTED_ADDRESS
    );
  };

  const renderAddressLine1 = (address: AddressState) =>
    address.unitNumber.trim() ? (
      <Trans>Apt. {address.unitNumber.trim()}</Trans>
    ) : null;

  return (
    <div id="post-scan-flow-page">
      <section className="postscan-body">
        {isDev && (
          <section className="postscan-dev-toggles" aria-label="Dev toggles">
            <p>Dev scenarios</p>
            <div>
              <button
                type="button"
                onClick={() => applyDevScenario("enterAddress")}
              >
                Address not extracted / no geosearch results
              </button>
              <button
                type="button"
                onClick={() => applyDevScenario("confirmExtracted")}
              >
                Address successfully extracted (with edit option)
              </button>
            </div>
          </section>
        )}

        <div className="postscan-progress">
          <p>
            {step === "confirmAddress" &&
            addressFlowState === "enterAddress" ? (
              <Trans>Step 4: Enter address</Trans>
            ) : step === "confirmAddress" ? (
              <Trans>Step 4: Confirm address</Trans>
            ) : (
              <Trans>Step 5: Provide your rent</Trans>
            )}
          </p>
          <div className="postscan-progress__bar">
            <span />
          </div>
        </div>

        {step === "confirmAddress" && addressFlowState === "editAddress" && (
          <button
            type="button"
            className="postscan-view-doc-toggle"
            onClick={() => undefined}
          >
            <span className="postscan-view-doc-toggle__icon" aria-hidden />
            <Trans>View scanned document</Trans>
          </button>
        )}

        <article
          className={`postscan-card ${
            step === "confirmAddress" &&
            (addressFlowState === "confirmExtracted" ||
            addressFlowState === "confirmUpdated"
              )
              ? "postscan-card--confirm"
              : ""
          }`}
        >
          {step === "confirmAddress" && addressFlowState === "confirmExtracted" && (
            <>
              <div className="postscan-info-box">
                <span className="postscan-info-box__icon" aria-hidden>
                  i
                </span>
                <p>
                  <Trans>
                    If this address does not match the address on your rent
                    history, please edit the address.
                  </Trans>
                </p>
              </div>
              <div className="postscan-card__content">
                <h1>
                  {renderAddressLine1(confirmedAddress)}
                  {renderAddressLine1(confirmedAddress) ? <br /> : null}
                  <Trans>{confirmedAddress.streetAddress}</Trans>
                  <br />
                  <Trans>{confirmedAddress.cityStateZip}</Trans>
                </h1>
                <button
                  type="button"
                  className="postscan-inline-link"
                  onClick={onEditAddress}
                >
                  <Trans>Edit address</Trans>
                </button>
              </div>
              <div className="postscan-map-placeholder">
                <Trans>Map image</Trans>
              </div>
            </>
          )}

          {step === "confirmAddress" && addressFlowState === "confirmUpdated" && (
            <>
              <div className="postscan-card__content">
                <h1>
                  {renderAddressLine1(confirmedAddress)}
                  {renderAddressLine1(confirmedAddress) ? <br /> : null}
                  <Trans>{confirmedAddress.streetAddress}</Trans>
                  <br />
                  <Trans>{confirmedAddress.cityStateZip}</Trans>
                </h1>
              </div>
              <div className="postscan-map-placeholder">
                <Trans>Map image</Trans>
              </div>
            </>
          )}

          {step === "confirmAddress" && addressFlowState === "enterAddress" && (
            <div className="postscan-card__content postscan-address-module">
              <div className="postscan-address-module__intro">
                <h1>
                  <Trans>
                    Enter the address for this
                    <br />
                    rent history
                  </Trans>
                </h1>
                <p>
                  <Trans>
                    We&apos;ll use publicly available information about the
                    building and apartment to support your rent history
                    analysis.
                  </Trans>
                </p>
              </div>
              <div className="postscan-form-field">
                <label htmlFor="postscan-address-input">
                  <Trans>Apartment address</Trans>
                </label>
                <GeoSearchDropdown
                  id="postscan-address-input"
                  className="postscan-geosearch"
                  labelText=""
                  placeholder={_(msg`Enter your address`)}
                  initialAddress={draftAddress.streetAddress}
                  invalid={Boolean(addressError)}
                  invalidText={addressError ?? undefined}
                  serviceUnavailableText={_(
                    msg`Geosearch is temporarily unavailable. Try again in a moment.`
                  )}
                  onInputChange={(value, meta) => {
                    if (!isTypingInputAction(meta)) return value;
                    setDraftAddress((prev) => ({
                      ...prev,
                      streetAddress: value,
                    }));
                    if (addressError) setAddressError(null);
                    return value;
                  }}
                  onSelect={(selection) => {
                    setDraftAddress((prev) =>
                      getAddressStateFromSelection(selection, prev)
                    );
                    if (addressError) setAddressError(null);
                  }}
                />
                {addressError && (
                  <p className="postscan-field-note" role="alert">
                    {addressError}
                  </p>
                )}
              </div>
              <div className="postscan-form-field">
                <label htmlFor="postscan-unit-input">
                  <Trans>Unit number</Trans>
                </label>
                <div className="postscan-address-input">
                  <input
                    id="postscan-unit-input"
                    value={draftAddress.unitNumber}
                    onChange={(event) =>
                      setDraftAddress((prev) => ({
                        ...prev,
                        unitNumber: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {step === "confirmAddress" && addressFlowState === "editAddress" && (
            <div className="postscan-card__content postscan-address-module">
              <h1>
                <Trans>
                  Edit the address for this
                  <br />
                  rent history
                </Trans>
              </h1>
              <div className="postscan-form-field">
                <label htmlFor="postscan-edit-address-input">
                  <Trans>Apartment address</Trans>
                </label>
                <GeoSearchDropdown
                  id="postscan-edit-address-input"
                  className="postscan-geosearch"
                  labelText=""
                  placeholder={_(msg`Enter your address`)}
                  initialAddress={draftAddress.streetAddress}
                  invalid={Boolean(addressError)}
                  invalidText={addressError ?? undefined}
                  serviceUnavailableText={_(
                    msg`Geosearch is temporarily unavailable. Try again in a moment.`
                  )}
                  onInputChange={(value, meta) => {
                    if (!isTypingInputAction(meta)) return value;
                    setDraftAddress((prev) => ({
                      ...prev,
                      streetAddress: value,
                    }));
                    if (addressError) setAddressError(null);
                    return value;
                  }}
                  onSelect={(selection) => {
                    setDraftAddress((prev) =>
                      getAddressStateFromSelection(selection, prev)
                    );
                    if (addressError) setAddressError(null);
                  }}
                />
              </div>
              <div className="postscan-form-field">
                <label htmlFor="postscan-edit-unit-input">
                  <Trans>Unit number</Trans>
                </label>
                <div className="postscan-address-input">
                  <input
                    id="postscan-edit-unit-input"
                    value={draftAddress.unitNumber}
                    onChange={(event) =>
                      setDraftAddress((prev) => ({
                        ...prev,
                        unitNumber: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              {addressError && (
                <p className="postscan-field-note" role="alert">
                  {addressError}
                </p>
              )}
              <div className="postscan-edit-actions">
                <Button
                  className="postscan-edit-actions__save"
                  labelText={_(msg`Save address`)}
                  onClick={onSaveAddress}
                />
                <button
                  type="button"
                  className="postscan-inline-link"
                  onClick={() => {
                    setAddressFlowState("confirmExtracted");
                    setAddressError(null);
                  }}
                >
                  <Trans>Cancel</Trans>
                </button>
              </div>
            </div>
          )}

          {step === "rentAmount" && (
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

        {!(step === "confirmAddress" && addressFlowState === "editAddress") && (
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
              onClick={
                step === "confirmAddress" ? onPrimaryAction : onRentSubmit
              }
              disabled={step === "rentAmount" && !isRentValid}
            />
          </div>
        )}
      </section>

    </div>
  );
};

export default PostScanFlow;
