import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

const syncDomEventGlobals = () => {
  // input-otp dispatches `new Event("input")` from setTimeout callbacks.
  // Node's Event constructor is incompatible with jsdom's dispatchEvent.
  globalThis.Event = window.Event;
  globalThis.CustomEvent = window.CustomEvent;
};

syncDomEventGlobals();

beforeEach(() => {
  syncDomEventGlobals();
});

Object.defineProperty(window, "scrollTo", {
  value: () => {},
  writable: true,
});

Object.defineProperty(window.Element.prototype, "scrollIntoView", {
  value: () => {},
  writable: true,
});

// input-otp uses elementFromPoint for focus/caret positioning in jsdom tests.
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null;
}

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(
    this: HTMLDialogElement
  ) {
    this.open = true;
  };
}

if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
}
