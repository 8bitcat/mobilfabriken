// Små syntljud med WebAudio (inget att ladda ner). Startar först efter ett klick (webbläsarnas regel).
let ac = null, pa = true;
export const ljudPa = () => pa;
export const sattLjud = (v) => { pa = !!v; };
export function lasUpp() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; } } if (ac && ac.state === 'suspended') ac.resume(); }
function ton(f, t0, dur, typ = 'square', vol = 0.05, glid = 0) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = typ; o.frequency.setValueAtTime(f, ac.currentTime + t0);
  if (glid) o.frequency.linearRampToValueAtTime(f + glid, ac.currentTime + t0 + dur);
  g.gain.setValueAtTime(0, ac.currentTime + t0); g.gain.linearRampToValueAtTime(vol, ac.currentTime + t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t0 + dur);
  o.connect(g).connect(ac.destination); o.start(ac.currentTime + t0); o.stop(ac.currentTime + t0 + dur + 0.02);
}
const LJUD = {
  klick: () => ton(880, 0, 0.04, 'square', 0.03),
  fel: () => { ton(220, 0, 0.12, 'square', 0.04); ton(180, 0.1, 0.16, 'square', 0.04); },
  kaching: () => { ton(1318, 0, 0.08); ton(1760, 0.07, 0.25, 'triangle', 0.06); },
  mynt: () => { ton(988, 0, 0.06, 'square', 0.03); ton(1319, 0.05, 0.12, 'square', 0.03); },
  mal: () => { [523, 659, 784, 1047].forEach((f, i) => ton(f, i * 0.08, 0.18, 'triangle', 0.06)); },
  forskning: () => { [660, 880, 1100].forEach((f, i) => ton(f, i * 0.06, 0.14, 'sine', 0.06)); },
  klar: () => { [392, 523, 659].forEach((f, i) => ton(f, i * 0.1, 0.2, 'triangle', 0.06)); },
  prick: () => ton(1400 + Math.random() * 400, 0, 0.03, 'sine', 0.025),
  bugg: () => ton(160, 0, 0.06, 'sawtooth', 0.025, -40),
  trumvirvel: () => { for (let i = 0; i < 16; i++) ton(120 + Math.random() * 30, i * 0.05, 0.05, 'triangle', 0.04); },
  fanfar: () => { [523, 523, 523, 659, 784, 1047].forEach((f, i) => ton(f, [0, 0.12, 0.24, 0.36, 0.5, 0.66][i], i === 5 ? 0.5 : 0.12, 'square', 0.05)); },
  tomat: () => ton(300, 0, 0.4, 'sawtooth', 0.05, -200),
};
export function spela(namn) { if (!pa || !ac || !LJUD[namn]) return; try { LJUD[namn](); } catch { /* ok */ } }
