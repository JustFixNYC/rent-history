import { useState } from "react";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button, GeoSearchDropdown, Icon } from "@justfixnyc/component-library";

type GeoSearchDropdownSelection = {
  feature: {
    properties?: {
      housenumber?: string;
      street?: string;
      borough?: string;
      postalcode?: string;
      name?: string;
      addendum?: { pad?: { bbl?: string; bin?: string } };
    };
    geometry?: { coordinates?: number[] };
  };
  option: { label: string };
};
import { useNavigate } from "react-router-dom";

import { confirmRhHistoryAddress } from "../../../api/rhAuth";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";
import {
  AddressFlowState,
  AddressState,
  ConfirmAddressState,
  EXTRACTED_ADDRESS,
  readConfirmAddressState,
  UPDATED_ADDRESS,
  writeConfirmAddressState,
} from "./confirmAddressState";
import "./ConfirmAddress.scss";

const toTitleCase = (value: string) =>
  value.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );

const buildMapImageURL = (address: AddressState): string | null => {
  if (!address.longLat) return null;
  const styleToken = import.meta.env.VITE_MAPBOX_STYLE_TOKEN as
    | string
    | undefined;
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as
    | string
    | undefined;
  if (!styleToken || !accessToken) return null;
  const zoom = "15.25";
  const bearing = "0";
  const pitch = "0";
  const width = "425";
  const height = "285";
  const marker = `pin-s+000(${address.longLat})`;
  return `https://api.mapbox.com/styles/v1/${styleToken}/static/${marker}/${address.longLat},${zoom},${bearing},${pitch}/${width}x${height}?access_token=${accessToken}`;
};

const getAddressStateFromSelection = (
  selection: GeoSearchDropdownSelection | null,
  previousState: AddressState
): AddressState => {
  if (!selection) return previousState;
  const feature = selection.feature;
  const featureProperties = feature.properties ?? {};
  const coordinates = feature.geometry?.coordinates ?? [];
  const longitude = coordinates[0];
  const latitude = coordinates[1];
  const longLat =
    typeof longitude === "number" && typeof latitude === "number"
      ? `${longitude},${latitude}`
      : null;

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
    bbl: featureProperties.addendum?.pad?.bbl ?? null,
    bin: featureProperties.addendum?.pad?.bin ?? null,
    longLat,
  };
};

const isTypingInputAction = (meta: { action?: string }) =>
  meta.action === "input-change";

export const ConfirmAddress: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;
  const [flowState, setFlowState] = useState(readConfirmAddressState());
  const [addressError, setAddressError] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const { addressFlowState, confirmedAddress, draftAddress } = flowState;

  const setAddressFlowState = (next: AddressFlowState) =>
    setFlowState((prev) => ({ ...prev, addressFlowState: next }));
  const setDraftAddress = (updater: (prev: AddressState) => AddressState) =>
    setFlowState((prev) => ({
      ...prev,
      draftAddress: updater(prev.draftAddress),
    }));

  const persistState = (nextState: ConfirmAddressState) => {
    writeConfirmAddressState(nextState);
    setFlowState(nextState);
  };

  const applyDevScenario = (scenario: AddressFlowState) => {
    const nextState =
      scenario === "confirmUpdated"
        ? {
            ...flowState,
            addressFlowState: scenario,
            confirmedAddress: UPDATED_ADDRESS,
            draftAddress: UPDATED_ADDRESS,
          }
        : {
            ...flowState,
            addressFlowState: scenario,
            confirmedAddress: EXTRACTED_ADDRESS,
            draftAddress:
              scenario === "enterAddress"
                ? { ...EXTRACTED_ADDRESS, unitNumber: "" }
                : EXTRACTED_ADDRESS,
          };
    setAddressError(null);
    persistState(nextState);
  };

  const submitAddressUpdate = async (
    address: AddressState
  ): Promise<boolean> => {
    const auth = getRhAuthSession();
    const historyId = getRhHistoryId();
    if (!auth || !historyId || !address.bbl) {
      setAddressError(
        _(msg`Unable to update address right now. Please try again.`)
      );
      return false;
    }
    setSavingAddress(true);
    try {
      await confirmRhHistoryAddress(auth.accessToken, {
        history_id: historyId,
        apartment: address.unitNumber || null,
        address: [address.streetAddress, address.cityStateZip]
          .filter(Boolean)
          .join(", "),
        bbl: address.bbl,
        bin: address.bin,
      });
      return true;
    } catch {
      setAddressError(
        _(msg`Unable to update address right now. Please try again.`)
      );
      return false;
    } finally {
      setSavingAddress(false);
    }
  };

  const onContinue = async () => {
    if (addressFlowState === "enterAddress") {
      if (!draftAddress.streetAddress.trim()) {
        setAddressError(_(msg`Enter an address to get started`));
        return;
      }
      const nextConfirmed = {
        ...draftAddress,
        streetAddress: draftAddress.streetAddress.trim(),
        unitNumber: draftAddress.unitNumber.trim(),
      };
      const updated = await submitAddressUpdate(nextConfirmed);
      if (!updated) return;
      const nextState = {
        ...flowState,
        addressFlowState: "confirmUpdated" as const,
        confirmedAddress: nextConfirmed,
      };
      persistState(nextState);
      navigate(`/${i18n.locale}/rent-questions`);
      return;
    }

    const updated = await submitAddressUpdate(confirmedAddress);
    if (!updated) return;
    navigate(`/${i18n.locale}/rent-questions`);
  };

  const onSaveAddress = async () => {
    if (!draftAddress.streetAddress.trim()) {
      setAddressError(_(msg`Enter an address to get started`));
      return;
    }
    const nextConfirmed = {
      ...draftAddress,
      streetAddress: draftAddress.streetAddress.trim(),
      unitNumber: draftAddress.unitNumber.trim(),
    };
    const updated = await submitAddressUpdate(nextConfirmed);
    if (!updated) return;
    const nextState = {
      ...flowState,
      addressFlowState: "confirmUpdated" as const,
      confirmedAddress: nextConfirmed,
    };
    persistState(nextState);
  };

  const mapImageUrl = buildMapImageURL(confirmedAddress);

  return (
    <div id="confirm-address-page">
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
            {addressFlowState === "enterAddress" ? (
              <Trans>Step 4: Enter address</Trans>
            ) : (
              <Trans>Step 4: Confirm address</Trans>
            )}
          </p>
          <div className="postscan-progress__bar">
            <span />
          </div>
        </div>

        {addressFlowState === "editAddress" && (
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
            addressFlowState === "confirmExtracted" ||
            addressFlowState === "confirmUpdated"
              ? "postscan-card--confirm"
              : ""
          }`}
        >
          {addressFlowState === "confirmExtracted" && (
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
              <div className="postscan-map-address-container">
                <div className="img-wrapper">
                  {mapImageUrl ? (
                    <img
                      className="img-wrapper__img"
                      src={mapImageUrl}
                      alt={_(msg`Map showing location of the entered address.`)}
                      width="425"
                      height="285"
                    />
                  ) : (
                    <div className="postscan-map-placeholder">
                      <Trans>Map image</Trans>
                    </div>
                  )}
                </div>
                <div className="address-container">
                  <h3 className="address-part-1">
                    {confirmedAddress.streetAddress}
                  </h3>
                  <div className="address-part-2">
                    {confirmedAddress.cityStateZip}
                  </div>
                  {confirmedAddress.unitNumber.trim() && (
                    <div className="address-part-2">
                      <Trans>Apt. {confirmedAddress.unitNumber.trim()}</Trans>
                    </div>
                  )}
                  <button
                    type="button"
                    className="postscan-inline-link"
                    onClick={() => {
                      setAddressFlowState("editAddress");
                      setAddressError(null);
                    }}
                  >
                    <Trans>Edit address</Trans>
                  </button>
                </div>
              </div>
            </>
          )}

          {addressFlowState === "confirmUpdated" && (
            <>
              <div className="postscan-map-address-container">
                <div className="img-wrapper">
                  {mapImageUrl ? (
                    <img
                      className="img-wrapper__img"
                      src={mapImageUrl}
                      alt={_(msg`Map showing location of the entered address.`)}
                      width="425"
                      height="285"
                    />
                  ) : (
                    <div className="postscan-map-placeholder">
                      <Trans>Map image</Trans>
                    </div>
                  )}
                </div>
                <div className="address-container">
                  <h3 className="address-part-1">
                    {confirmedAddress.streetAddress}
                  </h3>
                  <div className="address-part-2">
                    {confirmedAddress.cityStateZip}
                  </div>
                  {confirmedAddress.unitNumber.trim() && (
                    <div className="address-part-2">
                      <Trans>Apt. {confirmedAddress.unitNumber.trim()}</Trans>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {addressFlowState === "enterAddress" && (
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
                  onInputChange={(value: string, meta: { action?: string }) => {
                    if (!isTypingInputAction(meta)) return value;
                    setDraftAddress((prev) => ({
                      ...prev,
                      streetAddress: value,
                    }));
                    if (addressError) setAddressError(null);
                    return value;
                  }}
                  onSelect={(selection: GeoSearchDropdownSelection | null) => {
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

          {addressFlowState === "editAddress" && (
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
                  onInputChange={(value: string, meta: { action?: string }) => {
                    if (!isTypingInputAction(meta)) return value;
                    setDraftAddress((prev) => ({
                      ...prev,
                      streetAddress: value,
                    }));
                    if (addressError) setAddressError(null);
                    return value;
                  }}
                  onSelect={(selection: GeoSearchDropdownSelection | null) => {
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
                  disabled={savingAddress}
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
        </article>

        {addressFlowState !== "editAddress" && (
          <div className="postscan-actions">
            <button
              type="button"
              className="postscan-link-btn"
              onClick={() => navigate(`/${i18n.locale}/scanner`)}
            >
              <Icon icon="chevronLeft" />
              <Trans>Back</Trans>
            </button>
            <Button
              className="postscan-primary-btn"
              labelText={_(msg`Continue`)}
              onClick={onContinue}
              disabled={savingAddress}
            />
          </div>
        )}
      </section>
    </div>
  );
};
