export const US_LETTER_WIDTH = 8.5;
export const US_LETTER_HEIGHT = 11;

export const RETAKE_BUTTON_CLASS = "rh-scan-retake-button";
export const SAVE_BUTTON_CLASS = "rh-scan-save-button";

export const CONTINUOUS_SCAN_DONE_LABEL_PATTERN = /^Done \((\d+)\)$/;

/** MDS overwrites `.dce-mn-continuous-scan-done-text` with hardcoded "Done (n)" at runtime. */
export const patchContinuousScanDoneLabels = (
  formatLabel: (count: number) => string
): void => {
  const patchElement = (el: Element): void => {
    const current = el.textContent ?? "";
    const match = current.match(CONTINUOUS_SCAN_DONE_LABEL_PATTERN);
    if (match) {
      el.textContent = formatLabel(Number(match[1]));
    }
  };

  const walk = (root: Document | ShadowRoot | Element): void => {
    root
      .querySelectorAll(".dce-mn-continuous-scan-done-text")
      .forEach(patchElement);
    root.querySelectorAll("*").forEach((el) => {
      if (el.shadowRoot) {
        walk(el.shadowRoot);
      }
    });
  };

  walk(document);
};

export const isElementVisible = (selector: string): boolean =>
  Array.from(document.querySelectorAll(selector)).some(
    (node) => (node as HTMLElement).offsetParent !== null
  );

export const isRetakeOrSavePreviewVisible = (): boolean =>
  isElementVisible(`.${RETAKE_BUTTON_CLASS}`) ||
  isElementVisible(`.${SAVE_BUTTON_CLASS}`);

export const isCameraPermissionError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const name = "name" in error ? String(error.name) : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return true;
  }

  const message = "message" in error ? String(error.message).toLowerCase() : "";
  return (
    message.includes("permission") ||
    message.includes("not allowed") ||
    message.includes("denied")
  );
};

export const probeCameraAccess = async (): Promise<boolean> => {
  if (!navigator.mediaDevices?.getUserMedia) {
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error) {
    if (isCameraPermissionError(error)) {
      return false;
    }
    throw error;
  }
};
