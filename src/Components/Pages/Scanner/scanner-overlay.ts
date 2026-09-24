export const US_LETTER_WIDTH = 8.5;
export const US_LETTER_HEIGHT = 11;

export const RETAKE_BUTTON_CLASS = "rh-scan-retake-button";
export const SAVE_BUTTON_CLASS = "rh-scan-save-button";

export const CONTINUOUS_SCAN_DONE_LABEL_PATTERN = /^Done \((\d+)\)$/;

const SCANNER_LIVE_VIEW_SELECTORS = [
  ".dce-mn-close",
  ".dce-mn-take-photo",
  ".dce-mn-continuous-scan-done-btn",
] as const;

const walkShadowDom = (
  root: Document | ShadowRoot | Element,
  visit: (node: Document | ShadowRoot | Element) => void
): void => {
  visit(root);
  root.querySelectorAll("*").forEach((el) => {
    if (el.shadowRoot) {
      walkShadowDom(el.shadowRoot, visit);
    }
  });
};

const isDomElementVisible = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }
  const rect = element.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    return true;
  }
  return element.offsetParent !== null;
};

const isElementVisibleInTree = (
  root: Document | ShadowRoot | Element,
  selector: string
): boolean => {
  let visible = false;
  walkShadowDom(root, (node) => {
    if (visible) {
      return;
    }
    visible = Array.from(node.querySelectorAll(selector)).some((element) =>
      isDomElementVisible(element as HTMLElement)
    );
  });
  return visible;
};

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

  walkShadowDom(document, (root) => {
    root
      .querySelectorAll(".dce-mn-continuous-scan-done-text")
      .forEach(patchElement);
  });
};

export const isElementVisible = (selector: string): boolean =>
  isElementVisibleInTree(document, selector);

export const isDynamsoftScannerLiveViewVisible = (): boolean =>
  SCANNER_LIVE_VIEW_SELECTORS.some((selector) =>
    isElementVisibleInTree(document, selector)
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
