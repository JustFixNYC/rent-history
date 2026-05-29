const RH_PROFILE_CREATED_KEY = "rhProfileCreated";

export const setRhProfileCreated = (profileCreated: boolean): void => {
  window.sessionStorage.setItem(
    RH_PROFILE_CREATED_KEY,
    profileCreated ? "1" : "0"
  );
};

export const getRhProfileCreated = (): boolean =>
  window.sessionStorage.getItem(RH_PROFILE_CREATED_KEY) === "1";

export const clearRhProfileCreated = (): void => {
  window.sessionStorage.removeItem(RH_PROFILE_CREATED_KEY);
};

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
