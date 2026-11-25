// Små syntljud med WebAudio (inget att ladda ner). Startar först efter ett klick (webbläsarnas regel).
// Ljuden går genom en egen volym (sfx) och musiken (js/core/musik.js) genom en annan, båda till högtalarna.
let ac = null, pa = true, sfx = null, brus = null;
export const ljudPa = () => pa;
export const sattLjud = (v) => { pa = !!v; };
export const hamtaAc = () => ac;
export function lasUpp() {
  if (!ac) {
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; }
    if (ac) { sfx = ac.createGain(); sfx.gain.value = 1; sfx.connect(ac.destination); }
  }
  if (ac && ac.state === 'suspended') ac.resume();
}
function ton(f, t0, dur, typ = 'square', vol = 0.05, glid = 0) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = typ; o.frequency.setValueAtTime(f, ac.currentTime + t0);
  if (glid) o.frequency.linearRampToValueAtTime(f + glid, ac.currentTime + t0 + dur);
  g.gain.setValueAtTime(0, ac.currentTime + t0); g.gain.linearRampToValueAtTime(vol, ac.currentTime + t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t0 + dur);
  o.connect(g).connect(sfx); o.start(ac.currentTime + t0); o.stop(ac.currentTime + t0 + dur + 0.02);
}
// vitt brus genom ett filter: knackningar, jubel, fyrverkerier
function brusbit(t0, dur, vol, frek, typ = 'bandpass', q = 1, svall = 0.01) {
  if (!brus) { brus = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = brus.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime + t0;
  s.buffer = brus; s.loop = true; f.type = typ; f.frequency.value = frek; f.Q.value = q;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + svall); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(sfx); s.start(t); s.stop(t + dur + 0.05);
}
const LJUD = {
  klick: () => ton(880, 0, 0.04, 'square', 0.03),
  fel: () => { ton(220, 0, 0.12, 'square', 0.04); ton(180, 0.1, 0.16, 'square', 0.04); },
  kaching: () => { ton(1318, 0, 0.08); ton(1760, 0.07, 0.25, 'triangle', 0.06); brusbit(0.05, 0.15, 0.03, 6000, 'highpass'); },
  mynt: () => { ton(988, 0, 0.06, 'square', 0.03); ton(1319, 0.05, 0.12, 'square', 0.03); },
  mal: () => { [523, 659, 784, 1047].forEach((f, i) => ton(f, i * 0.08, 0.18, 'triangle', 0.06)); ton(1568, 0.34, 0.4, 'sine', 0.04); },
  forskning: () => { [660, 880, 1100, 1320].forEach((f, i) => ton(f, i * 0.06, 0.16, 'sine', 0.06)); },
  klar: () => { [392, 523, 659].forEach((f, i) => ton(f, i * 0.1, 0.2, 'triangle', 0.06)); },
  prick: () => ton(1400 + Math.random() * 400, 0, 0.03, 'sine', 0.025),
  pip: () => ton(1200, 0, 0.05, 'sine', 0.03),
  bugg: () => ton(160, 0, 0.06, 'sawtooth', 0.025, -40),
  trumvirvel: () => { for (let i = 0; i < 16; i++) { ton(120 + Math.random() * 30, i * 0.05, 0.05, 'triangle', 0.04); brusbit(i * 0.05, 0.04, 0.025, 2500); } },
  fanfar: () => { [523, 523, 523, 659, 784, 1047].forEach((f, i) => { const t = [0, 0.12, 0.24, 0.36, 0.5, 0.66][i]; ton(f, t, i === 5 ? 0.5 : 0.12, 'square', 0.05); ton(f / 2, t, i === 5 ? 0.5 : 0.12, 'triangle', 0.04); }); },
  tomat: () => ton(300, 0, 0.4, 'sawtooth', 0.05, -200),
  // nya (2026-11-25, Carl: "lägg in musik i spelet, och ljud så det blir kul att spela")
  knack: () => { [0, 0.16, 0.42].forEach((t) => { brusbit(t, 0.07, 0.12, 380, 'bandpass', 3, 0.002); ton(140, t, 0.06, 'sine', 0.06, -40); }); },     // en studio knackar på
  jubel: () => { for (let i = 0; i < 4; i++) brusbit(i * 0.12, 1.6 - i * 0.2, 0.05, 1200 + i * 400, 'bandpass', 0.7, 0.25); [784, 988, 1175].forEach((f, i) => ton(f, 0.9 + i * 0.07, 0.12, 'square', 0.025)); },   // publiken på showen
  jingel: () => { [659, 784, 880, 1047, 880, 1047, 1319].forEach((f, i) => ton(f, i * 0.09, 0.12, 'triangle', 0.05)); ton(262, 0, 0.6, 'square', 0.025); },     // spelsläpp / reklamfilm
  nyar: () => { for (let i = 0; i < 5; i++) { const t = i * 0.35; ton(400, t, 0.3, 'sine', 0.03, 900); brusbit(t + 0.3, 0.5, 0.08, 3000, 'highpass', 0.5, 0.005); } },   // fyrverkerier vid nyår
  banner: () => { ton(587, 0, 0.12, 'triangle', 0.05); ton(880, 0.12, 0.2, 'triangle', 0.05); },     // världshändelse
  flytt: () => { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => ton(f, i * 0.07, 0.25, 'square', 0.04)); brusbit(0.4, 1.2, 0.04, 1500, 'bandpass', 0.7, 0.2); },     // nytt kontor
};
export function spela(namn) { if (!pa || !ac || !LJUD[namn]) return; try { LJUD[namn](); } catch { /* ok */ } }
// ljud för händelser som inte bär ett eget (sim-signalerna i G.ko)
export const LJUD_FOR_TYP = { studio: 'knack', spelslapp: 'jingel', nyar: 'nyar', banner: 'banner' };
