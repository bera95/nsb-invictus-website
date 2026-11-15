/**
 * Content protection (deterrent — determined users can always use developer tools).
 *  - Page text and images cannot be selected, copied, dragged or saved via the context menu.
 *  - Form fields (inputs, textareas) and tool results ([data-copy-ok]) stay fully usable:
 *    visitors can paste URLs and copy their analysis results.
 *  - Common "view source / save page" shortcuts are disabled outside form fields.
 */
const ALLOWED = 'input, textarea, select, [contenteditable="true"], [data-copy-ok], [data-copy-ok] *';

const inAllowed = (node: EventTarget | Node | null) => {
  const el = node instanceof Element ? node : (node as Node | null)?.parentElement ?? null;
  return !!el?.closest(ALLOWED);
};

export function initProtection() {
  document.addEventListener('contextmenu', (e) => { if (!inAllowed(e.target)) e.preventDefault(); });
  document.addEventListener('dragstart', (e) => { if (!inAllowed(e.target)) e.preventDefault(); });
  const guard = (e: ClipboardEvent) => {
    const sel = document.getSelection();
    const ok = inAllowed(document.activeElement) || (sel && sel.rangeCount > 0 && inAllowed(sel.anchorNode) && inAllowed(sel.focusNode));
    if (!ok) e.preventDefault();
  };
  document.addEventListener('copy', guard);
  document.addEventListener('cut', guard);
  document.addEventListener('keydown', (e) => {
    if (inAllowed(e.target)) return;
    const k = e.key.toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    if ((mod && ['u', 's', 'p'].includes(k)) || (mod && e.shiftKey && ['i', 'j', 'c'].includes(k)) || k === 'f12') e.preventDefault();
  });
}
