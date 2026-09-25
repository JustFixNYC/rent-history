import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

// Capture jsdom constructors once; reread window.Event after corruption fails.
const domEvent = window.Event;
const domCustomEvent = window.CustomEvent;

const syncDomEventGlobals = () => {
  // input-otp dispatches `new Event("input")` from setTimeout callbacks.
  // Node's Event constructor is incompatible with jsdom's dispatchEvent.
  globalThis.Event = domEvent;
  globalThis.CustomEvent = domCustomEvent;
};

const patchDispatchEventForForeignEvents = () => {
  const jsdomDispatchEvent = EventTarget.prototype.dispatchEvent;

  EventTarget.prototype.dispatchEvent = function dispatchEvent(
    event: Event
  ): boolean {
    try {
      return jsdomDispatchEvent.call(this, event);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isForeignEventError = message.includes(
        "parameter 1 is not of type 'Event'"
      );

      if (!isForeignEventError) {
        throw error;
      }

      const normalized = new domEvent(event.type, {
        bubbles: event.bubbles ?? false,
        cancelable: event.cancelable ?? false,
      });
      return jsdomDispatchEvent.call(this, normalized);
    }
  };
};

syncDomEventGlobals();
patchDispatchEventForForeignEvents();

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
