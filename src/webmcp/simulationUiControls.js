// Shared browser-side control discovery for approved Esbiko simulation pages.
// This operates the *real* DOM, not a duplicate/shadow physics model.
// It is intentionally not a remote MCP transport; the ChatGPT server requires
// an explicit, authenticated bridge to the active browser before it can use it.
const SIM_ROUTE = /^\/experiments\/([^/]+)\/run\/?$/;
const BLOCKED_ID = new Set(["physics.mechanics.gearbox-differential-3d"]);
const SELECTOR = "button, input, select, textarea, [role='button'], [role='slider'], [role='switch'], [role='checkbox'], [role='tab']";
const MAX_CONTROLS = 400;

function currentSimulation() {
  const match = globalThis.location?.pathname?.match(SIM_ROUTE);
  if (!match) return null;
  const id = decodeURIComponent(match[1]);
  return BLOCKED_ID.has(id) ? null : id;
}
function controlRoot() {
  // Do not grant access to global navigation, authentication or account controls.
  return document.querySelector("[data-agent-surface]") ||
    document.querySelector("main [data-simulation-root]") ||
    document.querySelector("main");
}
function elements() {
  const id = currentSimulation();
  const root = id && controlRoot();
  if (!root) return [];
  return [...root.querySelectorAll(SELECTOR)].filter((node) =>
    !node.closest("[data-agent-control='disabled'],[data-agent-private],nav,header,footer") &&
    !node.disabled && node.getAttribute("aria-disabled") !== "true" &&
    node.getClientRects().length > 0
  ).slice(0, MAX_CONTROLS);
}
function nameFor(el) {
  const id = el.getAttribute("id");
  const label = id && [...document.querySelectorAll("label[for]")].find(x => x.htmlFor === id);
  return (el.getAttribute("aria-label") || label?.textContent ||
    el.getAttribute("title") || el.textContent || el.getAttribute("placeholder") ||
    el.getAttribute("data-agent-param") || el.getAttribute("name") || "").trim().slice(0, 140);
}
function kindFor(el) {
  return el.getAttribute("role") || el.getAttribute("type") || el.tagName.toLowerCase();
}
function describe(el, index) {
  const kind = kindFor(el);
  const item = {index, name: nameFor(el), kind, disabled: false};
  if ("value" in el && !["password","hidden","file"].includes(el.type))
    item.value = String(el.value).slice(0, 200);
  if ("checked" in el && ["checkbox","radio"].includes(el.type)) item.checked = el.checked;
  if (el.tagName === "SELECT") item.options = [...el.options].map(x => ({
    value: x.value, label: x.label, disabled: x.disabled
  })).slice(0, 100);
  const min = el.getAttribute("min"), max = el.getAttribute("max"), step = el.getAttribute("step");
  if (min !== null) item.min = min;
  if (max !== null) item.max = max;
  if (step !== null) item.step = step;
  return item;
}
export function discoverSimulationUiControls() {
  return {simulationId: currentSimulation(), controls: elements().map(describe),
    note: "Indices are ephemeral. Re-discover after navigation or UI changes. Canvas gestures are not represented."};
}
function nativeSet(el, property, value) {
  const proto = property === "checked" ? HTMLInputElement.prototype :
    el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype :
    el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, property)?.set;
  if (!setter) throw new Error("Unsupported control value setter");
  setter.call(el, value);
}
export function operateSimulationUiControl({index, action, value}) {
  if (!Number.isSafeInteger(index) || index < 0) throw new Error("Invalid control index");
  const el = elements()[index];
  if (!el) throw new Error("Control not found; discover the current page again");
  const kind = kindFor(el);
  if (action === "activate") {
    if (!["button","submit","tab","role-button"].includes(kind) &&
        el.tagName !== "BUTTON" && !["button","tab"].includes(el.getAttribute("role")))
      throw new Error("Activate is allowed only for buttons and tabs");
    el.click();
  } else if (action === "set") {
    if (el.tagName === "SELECT") {
      if (![...el.options].some(x => x.value === String(value) && !x.disabled))
        throw new Error("Option is not available");
      nativeSet(el, "value", String(value));
    } else if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      if (["password","file","hidden","email","tel","url"].includes(el.type))
        throw new Error("This input type is not controllable");
      if (el.type === "checkbox" || el.type === "radio") {
        if (typeof value !== "boolean") throw new Error("Expected boolean");
        nativeSet(el, "checked", value);
      } else {
        const next = String(value);
        if (["number","range"].includes(el.type)) {
          const numeric = Number(value);
          const min = el.min === "" ? -Infinity : Number(el.min);
          const max = el.max === "" ? Infinity : Number(el.max);
          if (!Number.isFinite(numeric) || numeric < min || numeric > max)
            throw new Error("Number is outside the allowed range");
        }
        nativeSet(el, "value", next);
      }
    } else {
      throw new Error("Use a simulation-specific adapter for this custom control");
    }
    el.dispatchEvent(new Event("input", {bubbles:true}));
    el.dispatchEvent(new Event("change", {bubbles:true}));
  } else throw new Error("Unsupported action");
  return {simulationId:currentSimulation(), action, control: describe(el,index)};
}
