import type {
  AddressState,
  ConfirmAddressState,
} from "../ConfirmAddress/confirmAddressState";

/** Confirmed session address for hero display, or null → show placeholder. */
export type ReportAddressLines = {
  street: string;
  unit: string | null;
  cityStateZip: string;
} | null;

const hasDisplayableAddress = (address: AddressState): boolean => {
  const street = address.streetAddress.trim();
  const cityStateZip = address.cityStateZip.trim();
  return street.length > 0 || cityStateZip.length > 0;
};

export const formatReportAddressLines = (
  state: ConfirmAddressState | null
): ReportAddressLines => {
  if (!state?.serverConfirmedKey) {
    return null;
  }

  const { confirmedAddress } = state;
  if (!hasDisplayableAddress(confirmedAddress)) {
    return null;
  }

  const unit = confirmedAddress.unitNumber.trim();

  return {
    street: confirmedAddress.streetAddress.trim(),
    unit: unit.length > 0 ? unit : null,
    cityStateZip: confirmedAddress.cityStateZip.trim(),
  };
};
