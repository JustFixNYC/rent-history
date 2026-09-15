# OtpInput

Reusable OTP (one-time password) field for SMS verification flows. Built on [`input-otp`](https://github.com/guilhermerodz/input-otp) with a segmented 6-box visual that is **decoration only** — there is one real `<input>` underneath.

**Intended use:** copy this folder into another React project. The component has no i18n or app-specific dependencies beyond `classnames`, `input-otp`, and its SCSS (currently uses JFCL design tokens).

---

## Why single-input?

A common pattern renders six separate `<input maxLength={1}>` fields. That breaks when the OS tries to autofill or paste a full code: only one digit lands per box (a frequent failure on iPhone SE and similar devices).

`OtpInput` inverts this:

- **One** transparent input spans the full field (`autoComplete="one-time-code"`, `inputMode="numeric"`, `required`, `name`).
- Six `<span>` cells mirror slot characters for display (`aria-hidden`), with an active-cell outline and fake caret while focused.
- Typing, paste, and OS autofill all update a single string — the same string your form submits.

---

## Module contents

| File             | Role                                                               |
| ---------------- | ------------------------------------------------------------------ |
| `OtpInput.tsx`   | `input-otp` wrapper + visual cells via render slots                |
| `useOtpInput.ts` | Optional local state + sanitized handlers                          |
| `useWebOtp.ts`   | Optional Android WebOTP progressive enhancement                    |
| `OtpInput.scss`  | Self-contained BEM styles (cells, caret, overlay input, modifiers) |
| `index.ts`       | Barrel exports                                                     |

Also exported from `OtpInput.tsx`: `OTP_LENGTH` (6) and `sanitizeOtpValue`.

---

## `OtpInput`

Controlled component. Parent owns `value` (e.g. react-hook-form `watch("code")`).

```tsx
<OtpInput
  id="verification-code"
  name="code"
  value={code}
  onChange={setCode}
  aria-label="Verification code"
  invalid={hasError}
/>
```

**Required props:** `id`, `name`, `value`, `onChange`, `aria-label` (parent supplies accessible name — no built-in copy).

**Optional:** `length` (default 6), `onComplete`, `onKeyDown`, `inputRef`, `disabled`, `invalid`, `autoFocus`, `aria-describedby`, `className`.

`onChange` receives a sanitized string value (digits only, capped at `length`). Paste sanitization is handled internally via `input-otp`'s `pasteTransformer` — no `onPaste` prop needed.

`onComplete` fires once when `value` reaches `length`. Wire it to form submission for auto-verify on paste, autofill, WebOTP, or typing the final digit (see `LoginVerificationStep.tsx`).

---

## `useOtpInput`

Convenience hook when you do **not** already have form state. Sanitizes input to digits-only and caps at `length`.

```tsx
const { value, setValue, inputRef, onChange, onKeyDown, isComplete } =
  useOtpInput({ length: 6, onValueChange: (v) => form.setValue("code", v) });

<OtpInput
  id="code"
  name="code"
  value={value}
  onChange={onChange}
  onKeyDown={onKeyDown}
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
  onCode: (code) => setCode(sanitizeOtpValue(code)),
  enabled: isVerificationStepOpen,
});
```

On mount (when `enabled` and `'OTPCredential' in window`), the hook calls:

```ts
navigator.credentials.get({ otp: { transport: ["sms"] }, signal });
```

The resolved credential's `code` is passed to `onCode`. An `AbortController` cancels the request on unmount (e.g. navigation away or successful submit).

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

**Dependencies:** `react`, `classnames`, `input-otp`. No router, no i18n library required inside the component.

---

## Reference integration

See `src/Components/Pages/LoginPage/LoginVerificationStep.tsx` — `OtpInput` + `useWebOtp` with react-hook-form, explicit Verify button, and parent-supplied `aria-label`.

Tests: `OtpInput.test.tsx` (unit), `LoginPage.test.tsx` (integration, queries `getByRole("textbox", { name: /verification code/i })`).
