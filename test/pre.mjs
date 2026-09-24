// the app modules read window.matchMedia when they load; Node has no window
globalThis.window = { matchMedia: () => ({ matches: false }) };
globalThis.document = {};
