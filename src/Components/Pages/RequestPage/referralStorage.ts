import { getPartnerBySlug } from "../../../api/requester";
import { isRequesterApiError } from "../../../api/requester/errors";

export const REFERRAL_STORAGE_KEY = "rh-request-partner";

export type ReferralPartner = {
  slug: string;
  name: string;
  website: string;
};

const isReferralPartner = (value: unknown): value is ReferralPartner => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.slug === "string" &&
    typeof record.name === "string" &&
    typeof record.website === "string"
  );
};

/** Remove `partner` from the current URL without navigation. */
export const stripPartnerParamFromUrl = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  if (!url.searchParams.has("partner")) {
    return;
  }

  url.searchParams.delete("partner");
  const search = url.searchParams.toString();
  const nextUrl = `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
};

/**
 * On RequestPage mount: read `?partner=`, strip from URL, fetch partner,
 * persist to sessionStorage on GET 200.
 */
export async function captureReferralFromSearchParams(
  search: string
): Promise<void> {
  const slug = new URLSearchParams(search).get("partner")?.trim();
  if (!slug) {
    return;
  }

  stripPartnerParamFromUrl();

  try {
    const partner = await getPartnerBySlug(slug);
    sessionStorage.setItem(
      REFERRAL_STORAGE_KEY,
      JSON.stringify({
        slug: partner.slug,
        name: partner.name,
        website: partner.website,
      } satisfies ReferralPartner)
    );
  } catch (error) {
    if (isRequesterApiError(error) && error.status === 404) {
      return;
    }
    // Network and other errors: no callout, no storage.
  }
}

/** Current stored partner for callout display. */
export function getStoredReferral(): ReferralPartner | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(REFERRAL_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return isReferralPartner(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** On submit: return slug or undefined (undefined after opt-out). */
export function getReferralSlugForSubmit(): string | undefined {
  return getStoredReferral()?.slug;
}

/** Opt-out: clear sessionStorage partner object. */
export function clearStoredReferral(): void {
  sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
}
