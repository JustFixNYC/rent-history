const ALL_DIGITS_RE = /^\d+$/;

/** Strip input to 10-digit US national number, or null if length/country-code invalid. */
export function parseUsPhoneNationalDigits(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  let national: string | null = null;

  if (trimmed.startsWith("+")) {
    const digits = trimmed
      .slice(1)
      .split("")
      .filter((char) => char >= "0" && char <= "9")
      .join("");

    if (digits.startsWith("1") && digits.length === 11) {
      national = digits.slice(1);
    } else if (digits.length === 10) {
      national = digits;
    }
  } else {
    const digits = trimmed
      .split("")
      .filter((char) => char >= "0" && char <= "9")
      .join("");

    if (digits.length === 11 && digits.startsWith("1")) {
      national = digits.slice(1);
    } else if (digits.length === 10) {
      national = digits;
    }
  }

  return national;
}

/** True when national digits pass auth-provider validate_phone_number rules. */
export function isValidUsPhoneNumber(raw: string): boolean {
  const national = parseUsPhoneNationalDigits(raw);
  if (!national || national.length !== 10 || !ALL_DIGITS_RE.test(national)) {
    return false;
  }

  // Area codes cannot start with 0 or 1 (NANP).
  return national[0] !== "0" && national[0] !== "1";
}
