# OtpInput

Reusable OTP (one-time password) field for SMS verification flows. Designed for reliable autofill on iOS Safari and Android Chrome, with a segmented 6-box visual that is **decoration only** — there is one real `<input>` underneath.

**Intended use:** copy this folder into another React project. The component has no i18n or app-specific dependencies beyond `classnames` and its SCSS (currently uses JFCL design tokens).

---

## Why single-input?

A common pattern renders six separate `<input maxLength={1}>` fields. That breaks when the OS tries to autofill or paste a full code: only one digit lands per box (a frequent failure on iPhone SE and similar devices).

`OtpInput` inverts this:

- **One** transparent input spans the full field (`autoComplete="one-time-code"`, `inputMode="numeric"`, `pattern`, `required`, `name`).
- Six `<span>` cells mirror `value[index]` for display (`aria-hidden`).
- Typing, paste, and OS autofill all update a single string — the same string your form submits.

---

## Module contents

| File             | Role                                                      |
| ---------------- | --------------------------------------------------------- |
| `OtpInput.tsx`   | Presentational controlled input + visual cells            |
| `useOtpInput.ts` | Optional local state + sanitized handlers                 |
| `useWebOtp.ts`   | Optional Android WebOTP progressive enhancement           |
| `OtpInput.scss`  | BEM layout (`.otp-input`, `__cells`, `__cell`, `__field`) |
| `index.ts`       | Barrel exports                                            |

---

## `OtpInput`

Controlled component. Parent owns `value` (e.g. react-hook-form `watch("code")`).

```tsx
<OtpInput
  id="verification-code"
  name="code"
  value={code}
  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
  onPaste={(e) => {
    e.preventDefault();
    setCode(e.clipboardData.getData("text"));
  }}
  aria-label="Verification code"
  invalid={hasError}
/>
```

**Required props:** `id`, `name`, `value`, `onChange`, `aria-label` (parent supplies accessible name — no built-in copy).

**Optional:** `length` (default 6), `onComplete`, `onKeyDown`, `onPaste`, `inputRef`, `disabled`, `invalid`, `autoFocus`, `aria-describedby`, `className`.

`onComplete` fires once when `value` reaches `length` (useful if you add auto-submit later; current login flow keeps an explicit Verify button).

---

## `useOtpInput`

Convenience hook when you do **not** already have form state. Sanitizes input to digits-only and caps at `length`.

```tsx
const { value, setValue, inputRef, onChange, onKeyDown, onPaste, isComplete } =
  useOtpInput({ length: 6, onValueChange: (v) => form.setValue("code", v) });

<OtpInput
  id="code"
  name="code"
  value={value}
  onChange={onChange}
  onKeyDown={onKeyDown}
  onPaste={onPaste}
  inputRef={inputRef}
  aria-label="Verification code"
/>;
```

Use **either** `useOtpInput` local state **or** an external store (react-hook-form, etc.) — not both as competing sources of truth.

---

## `useWebOtp` and why it matters

**WebOTP** is a browser API ([spec](https://wicg.github.io/web-otp/)) that lets a page read an OTP from an incoming SMS when the user consents. Supported on Android Chrome (and some Chromium browsers). It is **not** available on iOS Safari — there, rely on `autoComplete="one-time-code"` and keyboard suggestions instead.

```tsx
useWebOtp({
  onCode: (code) => setCode(code.replace(/\D/g, "").slice(0, 6)),
  enabled: isVerificationStepOpen,
});
```

On mount (when `enabled` and `'OTPCredential' in window`), the hook calls:

```ts
navigator.credentials.get({ otp: { transport: ["sms"] }, signal });
```

The resolved credential’s `code` is passed to `onCode`. An `AbortController` cancels the request on unmount (e.g. navigation away or successful submit).

**Backend requirement for WebOTP (and iOS domain binding):** the SMS last line should include the site origin, e.g.

```
Your verification code is: 123456

@yourdomain.example #123456
```

Without that format, autofill and WebOTP are unreliable even with correct frontend markup.

`useWebOtp` is optional progressive enhancement — if the API is missing or the user dismisses the prompt, manual entry still works.

---

## Porting to a new project

1. Copy the `OtpInput/` folder (all files above).
2. Replace or remap `OtpInput.scss` tokens if you do not use `@justfixnyc/component-library`.
3. Wire `OtpInput` in your verification step; keep one string in form state.
4. Add `useWebOtp` in the same screen if you target Android.
5. Ensure your SMS provider sends domain-bound messages (see above).
6. Add `autoComplete="tel"` on the phone field in the prior step — helps the OS link phone entry to the OTP SMS.

**Dependencies:** `react`, `classnames`. No router, no i18n library required inside the component.

---

## Reference integration

See `src/Components/Pages/LoginPage/LoginVerificationStep.tsx` — `OtpInput` + `useWebOtp` with react-hook-form, explicit Verify button, and parent-supplied `aria-label`.

Tests: `OtpInput.test.tsx` (unit), `LoginPage.test.tsx` (integration, queries `getByRole("textbox", { name: /verification code/i })`).
