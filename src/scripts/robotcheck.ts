/**
 * "I'm not a robot" — privacy-friendly proof-of-work check (no third parties).
 * On click, fetches a signed challenge and finds a nonce so that
 * sha256(salt + nonce) starts with N zero bits. Runs in small chunks so the page stays responsive.
 */
const K = new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
const W = new Uint32Array(64);

/** SHA-256 of an ASCII string; returns the first 32-bit word (enough for ≤32 difficulty bits). */
function sha256FirstWord(msg: string): number {
  const len = msg.length;
  const blocks = ((len + 9 + 63) >> 6);
  const bytes = new Uint8Array(blocks * 64);
  for (let i = 0; i < len; i++) bytes[i] = msg.charCodeAt(i);
  bytes[len] = 0x80;
  const bitLen = len * 8;
  bytes[bytes.length - 4] = (bitLen >>> 24) & 255; bytes[bytes.length - 3] = (bitLen >>> 16) & 255;
  bytes[bytes.length - 2] = (bitLen >>> 8) & 255; bytes[bytes.length - 1] = bitLen & 255;
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a, h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  for (let b = 0; b < blocks; b++) {
    for (let t = 0; t < 16; t++) { const o = b * 64 + t * 4; W[t] = (bytes[o] << 24) | (bytes[o + 1] << 16) | (bytes[o + 2] << 8) | bytes[o + 3]; }
    for (let t = 16; t < 64; t++) {
      const x = W[t - 15], y = W[t - 2];
      const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
      const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }
    let a = h0, bb = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let t = 0; t < 64; t++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const t1 = (h + S1 + ((e & f) ^ (~e & g)) + K[t] + W[t]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const t2 = (S0 + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + bb) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }
  return h0 >>> 0;
}

export const ROBOT_CHECK_HTML = `
  <div class="robot-check flex items-center gap-4 rounded-xl border border-white/15 bg-void/50 px-4 py-3" data-robot>
    <button type="button" class="robot-box flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-mist-400 transition-colors" aria-pressed="false" data-robot-btn>
      <span class="sr-only">I'm not a robot</span>
    </button>
    <span class="flex-1 text-sm text-mist-200" data-robot-label>I’m not a robot</span>
    <span class="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-mist-500">Private check</span>
    <input type="hidden" name="pow_salt"><input type="hidden" name="pow_expires"><input type="hidden" name="pow_difficulty"><input type="hidden" name="pow_sig"><input type="hidden" name="pow_nonce">
  </div>`;

export function initRobotCheck(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-robot]').forEach((box) => {
    if (box.dataset.ready) return;
    box.dataset.ready = '1';
    const btn = box.querySelector<HTMLButtonElement>('[data-robot-btn]')!;
    const label = box.querySelector<HTMLElement>('[data-robot-label]')!;
    const set = (n: string, v: string) => (box.querySelector<HTMLInputElement>(`input[name="${n}"]`)!.value = v);
    const run = async () => {
      if (box.dataset.state === 'busy' || box.dataset.state === 'done') return;
      box.dataset.state = 'busy';
      btn.innerHTML = '<span class="robot-spin"></span>';
      label.textContent = 'Verifying…';
      try {
        const ch = await (await fetch('/api/challenge.php', { cache: 'no-store' })).json();
        const mask = ch.difficulty >= 32 ? 0xffffffff : (0xffffffff << (32 - ch.difficulty)) >>> 0;
        let nonce = 0;
        await new Promise<void>((resolve) => {
          const step = () => {
            for (let i = 0; i < 4000; i++, nonce++) {
              if ((sha256FirstWord(ch.salt + nonce) & mask) === 0) { resolve(); return; }
            }
            setTimeout(step, 0);
          };
          step();
        });
        set('pow_salt', ch.salt); set('pow_expires', String(ch.expires)); set('pow_difficulty', String(ch.difficulty)); set('pow_sig', ch.sig); set('pow_nonce', String(nonce));
        box.dataset.state = 'done';
        btn.setAttribute('aria-pressed', 'true');
        btn.innerHTML = '<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
        btn.style.borderColor = '#10b981';
        label.textContent = 'Verified — you’re human';
      } catch {
        box.dataset.state = '';
        btn.innerHTML = '';
        label.textContent = 'Verification failed — click to try again';
      }
    };
    btn.addEventListener('click', run);
    label.addEventListener('click', run);
  });
}

/** True when the check in this form is complete; otherwise highlights it. */
export function robotVerified(form: HTMLElement): boolean {
  const box = form.querySelector<HTMLElement>('[data-robot]');
  if (!box) return true;
  if (box.dataset.state === 'done') return true;
  box.classList.add('robot-error');
  box.querySelector<HTMLElement>('[data-robot-label]')!.textContent = 'Please confirm you’re not a robot';
  setTimeout(() => box.classList.remove('robot-error'), 1500);
  return false;
}

/** After a successful submit a challenge cannot be reused — reset for the next message. */
export function resetRobotCheck(form: HTMLElement) {
  form.querySelectorAll<HTMLElement>('[data-robot]').forEach((box) => {
    box.dataset.state = '';
    const btn = box.querySelector<HTMLButtonElement>('[data-robot-btn]')!;
    btn.innerHTML = ''; btn.style.borderColor = ''; btn.setAttribute('aria-pressed', 'false');
    box.querySelector<HTMLElement>('[data-robot-label]')!.textContent = 'I’m not a robot';
  });
}
