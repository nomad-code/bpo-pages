/* password-wall · gate.js
 * Drop-in password gate matching poc-walk's PasswordGate UI.
 * Usage:
 *   <script src="../password-wall/gate.js"
 *           data-label="Partner Walkthrough"
 *           data-key="bpo-unlocked"></script>
 *
 * data-password (default: "longwalk")
 * data-key      (default: "bpo-unlocked") — shared key = shared unlock
 * data-label    (default: "Private")          — small caps line under the mark
 * data-storage  (default: "local")            — "local" | "session"
 *
 * The script tag must be in <head> (or top of <body>) to gate before paint.
 * Hides the document until unlocked; never sends the password anywhere.
 *
 * Config can also be supplied via window.__BPO_GATE__ = {password,key,label,storage}
 * for when gate.js is loaded *dynamically* (e.g. by the self-locating loader in
 * gate-snippet.html, where document.currentScript is null). Dataset wins over global.
 */
(function () {
  var script = document.currentScript;
  var ds = (script && script.dataset) || {};
  var g = window.__BPO_GATE__ || {};
  var PASSWORD = ds.password || g.password || 'longwalk';
  var KEY = ds.key || g.key || 'bpo-unlocked';
  var LABEL = ds.label || g.label || 'Private';
  var STORAGE = ((ds.storage || g.storage) === 'session') ? sessionStorage : localStorage;

  // Favicon — inline data-URI so it resolves identically on file:// (at any
  // folder depth) and on https, with no path dependency. inject_og.py adds
  // ../favicon.svg links at deploy time; skip if the page already declares one.
  if (!document.querySelector('link[rel~="icon"]')) {
    var FAVICON =
      '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">' +
      '<defs><linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="#1c1c1e"/><stop offset="1" stop-color="#141414"/></linearGradient></defs>' +
      '<rect width="512" height="512" rx="116" fill="url(#bg)"/>' +
      '<circle cx="452" cy="452" r="150" fill="#87CAB7" opacity="0.10"/>' +
      '<circle cx="452" cy="452" r="84" fill="#87CAB7" opacity="0.16"/>' +
      '<g transform="translate(-94,25.6) scale(0.95)" fill="#C5DB5F">' +
      '<path d="m453.22,97.41h75.11c1.59,0,3.18,0,4.72.24,4.53.72,7.8,4.24,7.85,8.76.05,21.62.1,43.24,0,64.86,0,5.01-4.09,8.81-9.2,9-4,.14-7.99.05-11.94.05-46.85,0-93.7,0-140.5.05-9.34,0-16.42,5.2-18.39,13.53-.39,1.69-.48,3.51-.48,5.25-.05,15.79-.05,31.54-.05,47.28,0,7.22-4.14,11.46-11.36,11.46-18.44.05-36.93.05-55.37.05-7.46,0-11.03-3.71-11.03-11.17v-55.08c0-7.41,3.9-11.27,11.36-11.27h48.15c11.51,0,18.73-7.22,18.73-18.78.05-15.6.43-31.2-.1-46.75-.39-12.09,7.85-17.72,17.67-17.57,24.89.34,49.88.1,74.82.1h0Z"/>' +
      '<path d="m430.16,313.69h-46.46c-11.75,0-19.16,7.32-19.21,19.07v49.79c0,7.66-3.8,11.41-11.51,11.41h-59.85c-7.17,0-10.74-3.61-10.74-10.79v-57.87c0-7.61,3.85-11.36,11.56-11.36,17.62,0,35.24.05,52.87,0,11.36,0,18.59-7.32,18.59-18.63,0-12.42-.05-24.84.05-37.27.1-12.95,7.8-20.46,20.75-20.46h90.71c7.94,0,11.27,3.32,11.27,11.36v53.97c0,7.08-3.71,10.79-10.83,10.79-15.65.05-31.39.05-47.19,0h0Z"/>' +
      '</g></svg>';
    var icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/svg+xml';
    icon.href = 'data:image/svg+xml,' + encodeURIComponent(FAVICON);
    (document.head || document.documentElement).appendChild(icon);
  }

  if (STORAGE.getItem(KEY) === 'true') {
    // A pre-hiding loader may have hidden the page before we loaded; unhide it.
    var pre = document.getElementById('__pw_gate_hide__');
    if (pre) pre.remove();
    return;
  }

  // Hide page contents until unlocked. We restore on success.
  var hideId = '__pw_gate_hide__';
  var hideStyle = document.createElement('style');
  hideStyle.id = hideId;
  hideStyle.textContent = 'html > body > *:not(#__pw_gate__) { display: none !important; }';
  (document.head || document.documentElement).appendChild(hideStyle);

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var existing = document.getElementById('__pw_gate__');
    if (existing) existing.remove();

    var wrap = document.createElement('div');
    wrap.id = '__pw_gate__';
    wrap.innerHTML =
      '<style>' +
      '#__pw_gate__{' +
        'position:fixed;inset:0;z-index:2147483647;' +
        'display:flex;align-items:center;justify-content:center;' +
        'background:#F5F4F0;padding:32px;' +
        'font-family:\'Helvetica Neue\',\'Inter\',Helvetica,Arial,sans-serif;' +
        'color:#141414;' +
      '}' +
      '#__pw_gate__ form{' +
        'width:100%;max-width:384px;background:#FFFFFF;' +
        'border:1px solid rgba(20,20,20,0.10);' +
        'border-radius:16px;padding:40px;' +
        'display:flex;flex-direction:column;gap:24px;' +
        'box-shadow:0 1px 2px rgba(20,20,20,0.04);' +
      '}' +
      '#__pw_gate__ .pw-head{display:flex;flex-direction:column;gap:12px;align-items:flex-start;}' +
      '#__pw_gate__ .pw-mark{display:flex;align-items:center;gap:8px;}' +
      '#__pw_gate__ .pw-mark span{font-size:14px;letter-spacing:-0.01em;font-weight:400;}' +
      '#__pw_gate__ .pw-eyebrow{' +
        'font-family:\'DM Mono\',ui-monospace,\'SF Mono\',Menlo,monospace;' +
        'font-size:10px;letter-spacing:0.18em;text-transform:uppercase;' +
        'color:rgba(20,20,20,0.50);' +
      '}' +
      '#__pw_gate__ .pw-field{display:flex;flex-direction:column;gap:8px;}' +
      '#__pw_gate__ .pw-label{' +
        'font-family:\'DM Mono\',ui-monospace,\'SF Mono\',Menlo,monospace;' +
        'font-size:10px;letter-spacing:0.18em;text-transform:uppercase;' +
        'color:rgba(20,20,20,0.40);' +
      '}' +
      '#__pw_gate__ input{' +
        'width:100%;background:#F5F4F0;' +
        'border:1px solid rgba(20,20,20,0.15);border-radius:9999px;' +
        'padding:10px 16px;font-size:14px;color:#141414;' +
        'outline:none;transition:border-color 0.15s ease;' +
        'box-sizing:border-box;' +
        'font-family:\'Helvetica Neue\',\'Inter\',Helvetica,Arial,sans-serif;' +
      '}' +
      '#__pw_gate__ input::placeholder{color:rgba(20,20,20,0.30);}' +
      '#__pw_gate__ input:focus{border-color:rgba(20,20,20,0.40);}' +
      '#__pw_gate__ .pw-error{' +
        'font-family:\'DM Mono\',ui-monospace,\'SF Mono\',Menlo,monospace;' +
        'font-size:10px;letter-spacing:0.18em;text-transform:uppercase;' +
        'color:rgba(20,20,20,0.50);' +
      '}' +
      '#__pw_gate__ button{' +
        'width:100%;padding:10px 20px;background:#C5DB5F;color:#141414;' +
        'font-size:14px;font-weight:500;letter-spacing:0.01em;' +
        'border:none;border-radius:9999px;cursor:pointer;' +
        'transition:background-color 0.15s ease;' +
        'font-family:\'Helvetica Neue\',\'Inter\',Helvetica,Arial,sans-serif;' +
      '}' +
      '#__pw_gate__ button:hover{background:#b9d152;}' +
      '</style>' +
      '<form autocomplete="off" novalidate>' +
        '<div class="pw-head">' +
          '<div class="pw-mark">' +
            '<svg width="20" height="16" viewBox="0 0 22 18" fill="none" aria-hidden="true">' +
              '<rect x="0" y="0" width="15" height="8" rx="1.5" fill="#141414"/>' +
              '<rect x="7" y="10" width="15" height="8" rx="1.5" fill="#C5DB5F"/>' +
            '</svg>' +
            '<span>found.ai</span>' +
          '</div>' +
          '<span class="pw-eyebrow"></span>' +
        '</div>' +
        '<div class="pw-field">' +
          '<label class="pw-label" for="__pw_gate_input">Access</label>' +
          '<input id="__pw_gate_input" type="password" placeholder="enter password" autocomplete="off"/>' +
          '<span class="pw-error" hidden>Incorrect — try again</span>' +
        '</div>' +
        '<button type="submit">Continue</button>' +
      '</form>';

    // Inject label text safely (no innerHTML for user-controlled content).
    wrap.querySelector('.pw-eyebrow').textContent = LABEL;

    var attached = document.body || document.documentElement;
    attached.appendChild(wrap);

    var input = wrap.querySelector('#__pw_gate_input');
    var error = wrap.querySelector('.pw-error');
    var form = wrap.querySelector('form');

    setTimeout(function () { input.focus(); }, 0);

    input.addEventListener('input', function () {
      if (!error.hidden) error.hidden = true;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input.value || '').trim().toLowerCase();
      if (v === PASSWORD) {
        STORAGE.setItem(KEY, 'true');
        var hide = document.getElementById(hideId);
        if (hide) hide.remove();
        wrap.remove();
        // Content was display:none while gated, so any load-time intro
        // animation (canvas sizing, count-ups, CSS keyframes) already ran
        // against a hidden/zero-size layout. Let pages re-fire them on unlock.
        try {
          window.dispatchEvent(new CustomEvent('found:unlock', { detail: { key: KEY } }));
        } catch (e) {}
      } else {
        error.hidden = false;
        input.value = '';
        input.focus();
      }
    });
  });
})();
