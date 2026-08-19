import { useEffect } from "react";

type UseWebOtpOptions = {
  onCode: (code: string) => void;
  enabled?: boolean;
};

export function useWebOtp({ onCode, enabled = true }: UseWebOtpOptions): void {
  useEffect(() => {
    if (!enabled || !("OTPCredential" in window)) return;

    const abortController = new AbortController();

    navigator.credentials
      .get({
        otp: { transport: ["sms"] },
        signal: abortController.signal,
      } as CredentialRequestOptions)
      .then((credential) => {
        const code =
          credential && "code" in credential
            ? String((credential as { code: string }).code)
            : "";
        if (code) onCode(code);
      })
      .catch(() => {
        // User dismissed, timed out, or API unavailable.
      });

    return () => abortController.abort();
  }, [enabled, onCode]);
}
