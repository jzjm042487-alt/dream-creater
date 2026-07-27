import { ENVIRONMENT_BASE } from "./mockState.js";

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function icon(name, className = "") {
  return `<i data-lucide="${name}"${className ? ` class="${className}"` : ""} aria-hidden="true"></i>`;
}

export function iconButton(name, label, action, extraAttributes = "") {
  return `
    <button
      class="icon-button"
      type="button"
      data-action="${action}"
      aria-label="${escapeHtml(label)}"
      title="${escapeHtml(label)}"
      ${extraAttributes}
    >
      ${icon(name)}
    </button>
  `;
}

export function statusBadge(label, tone = "neutral", extraClass = "") {
  return `<span class="status-badge tone-${tone} ${extraClass}">${escapeHtml(label)}</span>`;
}

export function meter({
  label,
  value,
  max = 100,
  display = `${value}/${max}`,
  tone = "jade",
  compact = false,
}) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));
  return `
    <div class="meter ${compact ? "meter-compact" : ""}">
      <div class="meter-copy">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(display)}</strong>
      </div>
      <div
        class="meter-track"
        role="progressbar"
        aria-label="${escapeHtml(label)}"
        aria-valuemin="0"
        aria-valuemax="${max}"
        aria-valuenow="${value}"
      >
        <span class="meter-fill fill-${tone}" style="width: ${width}%"></span>
      </div>
    </div>
  `;
}

export function panelHeader({
  id,
  eyebrow,
  title,
  summary,
  tools = "",
}) {
  return `
    <header class="panel-header">
      <div class="panel-heading-copy">
        <div class="panel-kicker">
          <span>${escapeHtml(id)}</span>
          <b>${escapeHtml(eyebrow)}</b>
        </div>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(summary)}</p>
      </div>
      ${tools ? `<div class="panel-tools">${tools}</div>` : ""}
    </header>
  `;
}

export function emptyState(iconName, title, copy) {
  return `
    <div class="empty-state">
      ${icon(iconName)}
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(copy)}</span>
    </div>
  `;
}

export function scenePath(scene) {
  return `${ENVIRONMENT_BASE}/${scene}.png`;
}

export function dataRow(label, value, tone = "") {
  return `
    <div class="data-row ${tone ? `data-row-${tone}` : ""}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

export function choiceButton({
  id,
  title,
  meta,
  detail,
  selected = false,
  disabled = false,
  action = "select",
  iconName = "chevron-right",
}) {
  return `
    <button
      class="choice-row ${selected ? "is-selected" : ""}"
      type="button"
      data-action="${action}"
      data-choice-id="${escapeHtml(id)}"
      ${disabled ? "disabled" : ""}
    >
      <span class="choice-leading">${icon(iconName)}</span>
      <span class="choice-copy">
        <span class="choice-title">
          <strong>${escapeHtml(title)}</strong>
          ${meta ? `<small>${escapeHtml(meta)}</small>` : ""}
        </span>
        <span>${escapeHtml(detail)}</span>
      </span>
      ${icon(disabled ? "lock-keyhole" : "chevron-right", "choice-trailing")}
    </button>
  `;
}
