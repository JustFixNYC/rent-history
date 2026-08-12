import { useState } from "react";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button, GeoSearchDropdown, Icon } from "@justfixnyc/component-library";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  confirmRhHistoryAddress,
  type RhHistoryList,
} from "../../../api/account";
import { accountQueryKeys } from "../../../api/account/queryKeys";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";
import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";
import {
  addressCommitKey,
  AddressState,
  ConfirmAddressState,
  emptyAddressState,
  readConfirmAddressState,
  writeConfirmAddressState,
} from "./confirmAddressState";
import { ensureHistoryIdForConfirm } from "./ensureHistoryIdForConfirm";
import { geosearchFeatureToAddressState } from "./geosearchAddress";
import "./ConfirmAddress.scss";

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

const getAddressStateFromSelection = (
  selection: GeoSearchDropdownSelection | null,
  previousState: AddressState
): AddressState => {
  if (!selection) return previousState;
  return geosearchFeatureToAddressState(
    selection.feature,
    previousState,
    selection.option.label
  );
};

const isTypingInputAction = (meta: { action?: string }) =>
  meta.action === "input-change";

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

const buildEnterAddressState = (unitNumber: string): ConfirmAddressState => {
  const empty = emptyAddressState();
  return {
    addressFlowState: "enterAddress",
    confirmedAddress: { ...empty, unitNumber },
    draftAddress: { ...empty, unitNumber },
    serverConfirmedKey: null,
  };
};

const addressStateFromHistoryList = (history: RhHistoryList): AddressState => ({
  streetAddress: history.address ?? "",
  unitNumber: history.apartment ?? "",
  cityStateZip: "",
  longLat: null,
  bbl: null,
  bin: null,
});

const resolveInitialConfirmAddressState = (
  histories: RhHistoryList[] | undefined
): ConfirmAddressState => {
  const persisted = readConfirmAddressState();
  if (persisted) return persisted;

  const historyId = getRhHistoryId();
  if (historyId && histories) {
    const history = histories.find((item) => item.id === historyId);
    if (history?.address) {
      const address = addressStateFromHistoryList(history);
      return {
        addressFlowState: "confirmUpdated",
        confirmedAddress: address,
        draftAddress: address,
        serverConfirmedKey: addressCommitKey(address),
      };
    }
  }

  return buildEnterAddressState("");
};

export const ConfirmAddress: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [flowState, setFlowState] = useState<ConfirmAddressState>(() =>
    resolveInitialConfirmAddressState(
      queryClient.getQueryData<RhHistoryList[]>(accountQueryKeys.histories())
    )
  );
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);

  const {
    addressFlowState,
    confirmedAddress,
    draftAddress,
    serverConfirmedKey,
  } = flowState;

  const setDraftAddress = (updater: (prev: AddressState) => AddressState) =>
    setFlowState((prev) => ({
      ...prev,
      draftAddress: updater(prev.draftAddress),
    }));

  const persistState = (nextState: ConfirmAddressState) => {
    writeConfirmAddressState(nextState);
    setFlowState(nextState);
  };

  const onBack = () => {
    setAddressError(null);
    if (addressFlowState === "confirmUpdated") {
      const nextState: ConfirmAddressState = {
        ...flowState,
        addressFlowState: "enterAddress",
        draftAddress: { ...confirmedAddress },
      };
      persistState(nextState);
      return;
    }
    navigate(`/${i18n.locale}/account`);
  };

  const onContinue = () => {
    if (!draftAddress.streetAddress.trim()) {
      setAddressError(_(msg`Enter an address to get started`));
      return;
    }
    if (!draftAddress.bbl) {
      setAddressError(
        _(msg`Select an address from the suggestions to continue`)
      );
      return;
    }

    const nextConfirmed = {
      ...draftAddress,
      streetAddress: draftAddress.streetAddress.trim(),
      unitNumber: draftAddress.unitNumber.trim(),
    };
    const nextState: ConfirmAddressState = {
      ...flowState,
      addressFlowState: "confirmUpdated",
      confirmedAddress: nextConfirmed,
      draftAddress: nextConfirmed,
    };
    setAddressError(null);
    persistState(nextState);
  };

  const onNext = async () => {
    if (isCommitting) return;

    const auth = getRhAuthSession();
    if (!auth) {
      setAddressError(
        _(msg`Unable to update address right now. Please try again.`)
      );
      return;
    }

    const commitKey = addressCommitKey(confirmedAddress);
    const historyId = getRhHistoryId();
    if (historyId && serverConfirmedKey === commitKey) {
      navigate(`/${i18n.locale}/rent-questions`);
      return;
    }

    if (!confirmedAddress.bbl) {
      setAddressError(
        _(msg`Select an address from the suggestions to continue`)
      );
      return;
    }

    setIsCommitting(true);
    setAddressError(null);
    try {
      const ensuredHistoryId = await ensureHistoryIdForConfirm(
        auth.accessToken
      );
      await confirmRhHistoryAddress(auth.accessToken, {
        history_id: ensuredHistoryId,
        apartment: confirmedAddress.unitNumber || null,
        address: [confirmedAddress.streetAddress, confirmedAddress.cityStateZip]
          .filter(Boolean)
          .join(", "),
        bbl: confirmedAddress.bbl,
        bin: confirmedAddress.bin,
      });
      const nextState: ConfirmAddressState = {
        ...flowState,
        serverConfirmedKey: commitKey,
      };
      persistState(nextState);
      navigate(`/${i18n.locale}/rent-questions`);
    } catch {
      setAddressError(
        _(msg`Unable to update address right now. Please try again.`)
      );
    } finally {
      setIsCommitting(false);
    }
  };

  const mapImageUrl = buildMapImageURL(confirmedAddress);
  const primaryLabel =
    addressFlowState === "enterAddress"
      ? _(msg`Continue`)
      : isCommitting
      ? _(msg`Saving…`)
      : _(msg`Next`);

  return (
    <div id="confirm-address-page">
      <section className="postscan-body">
        <AnalysisFlowProgress stepId="confirm-address" />

        <article
          className={`postscan-card ${
            addressFlowState === "confirmUpdated"
              ? "postscan-card--confirm"
              : ""
          }`}
        >
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
              {addressError && (
                <p className="postscan-field-note" role="alert">
                  {addressError}
                </p>
              )}
            </>
          )}

          {addressFlowState === "enterAddress" && (
            <div className="postscan-card__content postscan-address-module">
              <div className="postscan-address-module__intro">
                <h2>
                  <Trans>
                    Enter the address for this
                    <br />
                    rent history
                  </Trans>
                </h2>
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
                      bbl: null,
                      bin: null,
                      longLat: null,
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
        </article>

        <div className="postscan-actions">
          <button
            type="button"
            className="postscan-link-btn"
            onClick={onBack}
            disabled={isCommitting}
          >
            <Icon icon="chevronLeft" />
            <Trans>Back</Trans>
          </button>
          <Button
            className="postscan-primary-btn"
            labelText={primaryLabel}
            onClick={
              addressFlowState === "enterAddress"
                ? onContinue
                : () => void onNext()
            }
            disabled={isCommitting}
          />
        </div>
      </section>
    </div>
  );
};
