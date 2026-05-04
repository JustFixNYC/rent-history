const RH_PHONE_EXISTS_KEY = "rhPhoneExists";

export const setRhPhoneExists = (phoneExists: boolean): void => {
  window.sessionStorage.setItem(RH_PHONE_EXISTS_KEY, phoneExists ? "1" : "0");
};

export const getRhPhoneExists = (): boolean =>
  window.sessionStorage.getItem(RH_PHONE_EXISTS_KEY) === "1";

export const clearRhPhoneExists = (): void => {
  window.sessionStorage.removeItem(RH_PHONE_EXISTS_KEY);
};

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
