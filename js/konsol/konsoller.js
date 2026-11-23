// Rivalkonsolerna i konsolläget som små pixelbilder (40×28): tidslinjen, nyheterna, museet.
// Namnen är parodier som går att känna igen. KONSOLLER: [{ id, namn, forebild, ar, gen, tillverkare, rita(ctx, X, Y) }]
const R = (x, X, Y, W, H, f) => { if (W <= 0 || H <= 0) return; x.fillStyle = f; x.fillRect(Math.round(X), Math.round(Y), Math.round(W), Math.round(H)); };
const P = (x, X, Y, f) => R(x, X, Y, 1, 1, f);
const skugga = (x, X, Y, w) => { R(x, X + 2, Y, w - 4, 1, 'rgba(0,0,0,0.35)'); R(x, X + 4, Y + 1, w - 8, 1, 'rgba(0,0,0,0.2)'); };
// låda i tre-kvartsvy: ovansida (ljus) + framsida (mörkare)
function lada(x, X, Y, w, topp, fram, cTopp, cFram, cKant = '#101018') {
  R(x, X + 2, Y, w - 2, topp, cTopp); R(x, X, Y + topp, w, fram, cFram);
  for (let i = 0; i < topp; i++) P(x, X + 2 - Math.round((i / topp) * 2), Y + i, cTopp);
  R(x, X, Y + topp + fram - 1, w, 1, cKant); R(x, X + 2, Y, w - 2, 1, 'rgba(255,255,255,0.35)');
}

export const KONSOLLER = [
  { id: 'ataro', namn: 'ORBITEK 2800', forebild: 'Atari 2600', ar: 1977, gen: 1, tillverkare: 'ORBITEK', rita(x, X, Y) {
    skugga(x, X + 2, Y + 25, 36); lada(x, X + 2, Y + 8, 36, 7, 10, '#2a2a2a', '#1a1a1a');
    for (let i = 0; i < 36; i += 3) R(x, X + 2 + i, Y + 17, 2, 6, i % 6 ? '#8a5228' : '#6a3a18');
    for (let i = 0; i < 6; i++) { R(x, X + 6 + i * 5, Y + 9, 2, 4, '#c8c8c8'); P(x, X + 6 + i * 5, Y + 9, '#ffffff'); }
    R(x, X + 14, Y + 5, 14, 4, '#101010'); R(x, X + 15, Y + 6, 12, 1, '#3a3a3a');
  } },
  { id: 'kommodor', namn: 'DATATRON 64', forebild: 'Commodore 64', ar: 1982, gen: 1, tillverkare: 'DATATRON', rita(x, X, Y) {
    skugga(x, X, Y + 25, 40);
    for (let j = 0; j < 10; j++) R(x, X + 2 + Math.round(j * 0.3), Y + 10 + j, 36 - Math.round(j * 0.3), 1, '#c8b890');
    R(x, X, Y + 20, 40, 5, '#a89870'); R(x, X, Y + 24, 40, 1, '#6a5a40');
    for (let r = 0; r < 4; r++) for (let k = 0; k < 13; k++) R(x, X + 5 + k * 2.4 + r, Y + 11 + r * 2, 2, 1, '#4a3a2a');
    R(x, X + 11, Y + 19, 14, 1, '#4a3a2a'); for (let k = 0; k < 4; k++) R(x, X + 33, Y + 11 + k * 2, 3, 1, '#a07a30');
    R(x, X + 31, Y + 21, 4, 1, '#d02020'); P(x, X + 36, Y + 21, '#2050d0');
  } },
  { id: 'nes', namn: 'TENKO 8', forebild: 'Nintendo Entertainment System', ar: 1986, gen: 2, tillverkare: 'TENKO', rita(x, X, Y) {
    skugga(x, X + 2, Y + 25, 36); lada(x, X + 2, Y + 10, 36, 5, 10, '#c8c8c4', '#a8a8a4');
    R(x, X + 6, Y + 11, 20, 3, '#9a9a96'); R(x, X + 6, Y + 11, 20, 1, '#7a7a76');
    R(x, X + 2, Y + 15, 36, 2, '#58585a'); R(x, X + 2, Y + 19, 36, 5, '#3a3a3c');
    R(x, X + 5, Y + 20, 5, 3, '#b8b8b4'); R(x, X + 12, Y + 20, 5, 3, '#b8b8b4'); P(x, X + 31, Y + 21, '#d82020'); R(x, X + 33, Y + 21, 3, 1, '#d82020');
  } },
  { id: 'gameboj', namn: 'TENKO POCKET', forebild: 'Game Boy', ar: 1989, gen: 3, tillverkare: 'TENKO', rita(x, X, Y) {
    skugga(x, X + 12, Y + 26, 18);
    R(x, X + 12, Y + 1, 17, 25, '#c8c8c0'); R(x, X + 12, Y + 1, 17, 1, '#e8e8e0'); R(x, X + 28, Y + 2, 1, 24, '#98988e'); R(x, X + 12, Y + 25, 17, 1, '#88887e');
    R(x, X + 14, Y + 3, 13, 10, '#5a5a6a'); R(x, X + 16, Y + 4, 9, 8, '#8bac0f'); R(x, X + 17, Y + 9, 3, 2, '#306230'); R(x, X + 21, Y + 7, 2, 4, '#306230');
    R(x, X + 15, Y + 17, 3, 1, '#202020'); R(x, X + 16, Y + 16, 1, 3, '#202020');
    P(x, X + 24, Y + 17, '#a0205a'); P(x, X + 26, Y + 16, '#a0205a'); R(x, X + 24, Y + 17, 2, 1, '#a0205a'); R(x, X + 26, Y + 16, 2, 1, '#a0205a');
    for (let i = 0; i < 3; i++) R(x, X + 23 + i * 2, Y + 21 - i, 1, 3, '#88887e');
  } },
  { id: 'megadrive', namn: 'TORA MEGA 16', forebild: 'Sega Mega Drive', ar: 1990, gen: 3, tillverkare: 'TORA', rita(x, X, Y) {
    skugga(x, X + 1, Y + 25, 38); lada(x, X + 1, Y + 11, 38, 6, 8, '#2a2a2e', '#1a1a1e');
    for (let j = -4; j <= 4; j++) { const w = Math.round(Math.sqrt(16 - j * j) * 2.4); R(x, X + 15 - w, Y + 14 + j / 2, w * 2, 1, j < 0 ? '#3a3a40' : '#303036'); }
    for (let a = 0; a < 24; a++) { const v = (a / 24) * Math.PI * 2; P(x, X + 15 + Math.cos(v) * 9, Y + 14 + Math.sin(v) * 2.2, '#c81818'); }
    R(x, X + 28, Y + 13, 8, 2, '#c81818'); R(x, X + 30, Y + 19, 6, 1, '#5a5a60');
  } },
  { id: 'snes', namn: 'SUPER TENKO', forebild: 'Super Nintendo', ar: 1992, gen: 3, tillverkare: 'TENKO', rita(x, X, Y) {
    skugga(x, X + 1, Y + 25, 38); lada(x, X + 1, Y + 11, 38, 7, 7, '#d0d0cc', '#b4b4b0');
    R(x, X + 8, Y + 9, 24, 4, '#a8a8a4'); R(x, X + 9, Y + 10, 22, 1, '#3a3a3a');
    R(x, X + 4, Y + 14, 3, 2, '#d03030'); R(x, X + 9, Y + 14, 3, 2, '#e0c020'); R(x, X + 29, Y + 14, 3, 2, '#30a030'); R(x, X + 34, Y + 14, 2, 2, '#3050d0');
  } },
  { id: 'playstatio', namn: 'HOSHI NOVA', forebild: 'PlayStation', ar: 1995, gen: 4, tillverkare: 'HOSHI', rita(x, X, Y) {
    skugga(x, X + 1, Y + 25, 38); lada(x, X + 1, Y + 12, 38, 7, 6, '#c8c8d0', '#a8a8b2');
    for (let j = -3; j <= 3; j++) { const w = Math.round(Math.sqrt(9 - j * j) * 3.2); R(x, X + 14 - w, Y + 15 + j, w * 2, 1, '#b4b4bc'); }
    R(x, X + 6, Y + 15, 16, 1, '#9a9aa4'); R(x, X + 28, Y + 14, 2, 2, '#e02020'); R(x, X + 31, Y + 14, 2, 2, '#f0c000'); R(x, X + 28, Y + 17, 2, 2, '#2060d0'); R(x, X + 31, Y + 17, 2, 2, '#20a040');
  } },
  { id: 'n64', namn: 'TENKO 64', forebild: 'Nintendo 64', ar: 1997, gen: 4, tillverkare: 'TENKO', rita(x, X, Y) {
    skugga(x, X + 1, Y + 25, 38); lada(x, X + 1, Y + 12, 38, 6, 7, '#3a3a40', '#2a2a30');
    R(x, X + 11, Y + 8, 18, 6, '#4a4a52'); R(x, X + 13, Y + 9, 14, 2, '#18181c');
    R(x, X + 17, Y + 19, 2, 2, '#e02020'); R(x, X + 19, Y + 19, 2, 2, '#20a040'); R(x, X + 17, Y + 21, 2, 2, '#2050d0'); R(x, X + 19, Y + 21, 2, 2, '#f0c000');
  } },
  { id: 'dromcast', namn: 'TORA VORTEX', forebild: 'Sega Dreamcast', ar: 1999, gen: 5, tillverkare: 'TORA', rita(x, X, Y) {
    skugga(x, X + 5, Y + 25, 30); lada(x, X + 5, Y + 11, 30, 7, 7, '#f0f0ec', '#d8d8d4');
    for (let j = -3; j <= 3; j++) { const w = Math.round(Math.sqrt(9 - j * j) * 3); R(x, X + 18 - w, Y + 14 + j * 0.8, w * 2, 1, '#e4e4e0'); }
    for (let a = 0; a < 18; a++) { const v = (a / 18) * Math.PI * 1.7, r = 1 + a / 6; P(x, X + 13 + Math.cos(v) * r, Y + 21 + Math.sin(v) * r * 0.6, '#f07020'); }
  } },
  { id: 'ps2', namn: 'HOSHI NOVA 2', forebild: 'PlayStation 2', ar: 2000, gen: 5, tillverkare: 'HOSHI', rita(x, X, Y) {
    skugga(x, X + 1, Y + 25, 38); lada(x, X + 1, Y + 11, 38, 5, 9, '#24242c', '#14141a');
    for (let i = 0; i < 9; i++) R(x, X + 3, Y + 17 + i % 2, 34, 1, i % 2 ? '#1c1c24' : '#14141a');
    R(x, X + 3, Y + 18, 26, 1, '#30303a'); R(x, X + 3, Y + 22, 26, 1, '#30303a'); R(x, X + 32, Y + 13, 3, 2, '#2050d0');
  } },
  { id: 'xlada', namn: 'AXIOM X', forebild: 'Microsoft Xbox', ar: 2002, gen: 5, tillverkare: 'AXIOM', rita(x, X, Y) {
    skugga(x, X, Y + 25, 40); lada(x, X, Y + 8, 40, 7, 11, '#26262a', '#18181a');
    for (let i = -4; i <= 4; i++) { P(x, X + 20 + i, Y + 11 + i * 0.5, '#40d040'); P(x, X + 20 - i, Y + 11 + i * 0.5, '#40d040'); }
    R(x, X + 17, Y + 9, 7, 5, 'rgba(60,220,60,0.35)'); R(x, X + 4, Y + 18, 10, 2, '#3a3a3e'); R(x, X + 28, Y + 18, 8, 2, '#3a3a3e');
  } },
  { id: 'vi', namn: 'TENKO VIVA', forebild: 'Nintendo Wii', ar: 2006, gen: 6, tillverkare: 'TENKO', rita(x, X, Y) {
    skugga(x, X + 10, Y + 25, 22);
    R(x, X + 15, Y + 3, 9, 22, '#f4f4f4'); R(x, X + 23, Y + 3, 3, 22, '#d4d4d8'); R(x, X + 15, Y + 3, 9, 1, '#ffffff');
    R(x, X + 17, Y + 7, 1, 10, '#6ab0ff'); R(x, X + 17, Y + 7, 1, 1, '#c0e4ff');
    R(x, X + 30, Y + 9, 4, 14, '#f4f4f4'); R(x, X + 31, Y + 11, 2, 2, '#c8c8cc'); P(x, X + 31, Y + 16, '#3070d0');
  } },
  { id: 'ps3', namn: 'HOSHI NOVA 3', forebild: 'PlayStation 3', ar: 2007, gen: 6, tillverkare: 'HOSHI', rita(x, X, Y) {
    skugga(x, X, Y + 25, 40);
    for (let j = 0; j < 6; j++) R(x, X + 2 + Math.round(Math.sin((j / 6) * 1.2) * 0), Y + 10 + j, 36, 1, j < 2 ? '#3a3a40' : '#1e1e22');
    for (let i = 0; i < 36; i++) P(x, X + 2 + i, Y + 9 + Math.round(Math.abs(i - 18) / 9), '#5a5a62');
    R(x, X + 2, Y + 16, 36, 8, '#0e0e10'); R(x, X + 2, Y + 16, 36, 1, '#c0c0c8'); R(x, X + 6, Y + 20, 18, 1, '#2a2a30');
  } },
  { id: 'ps4', namn: 'HOSHI NOVA 4', forebild: 'PlayStation 4', ar: 2013, gen: 7, tillverkare: 'HOSHI', rita(x, X, Y) {
    skugga(x, X, Y + 25, 40);
    for (let j = 0; j < 6; j++) R(x, X + 6 - j, Y + 12 + j, 32, 1, '#1a1a20');
    R(x, X + 1, Y + 18, 36, 1, '#3a7ad8'); R(x, X + 1, Y + 19, 36, 5, '#121216');
    for (let j = 0; j < 6; j++) P(x, X + 22 - j, Y + 12 + j, '#2a2a32');
  } },
  { id: 'svitsch', namn: 'TENKO SNAP', forebild: 'Nintendo Switch', ar: 2017, gen: 8, tillverkare: 'TENKO', rita(x, X, Y) {
    skugga(x, X + 2, Y + 25, 36);
    R(x, X + 9, Y + 8, 22, 15, '#2a2a2e'); R(x, X + 11, Y + 9, 18, 13, '#1a3a7a'); R(x, X + 13, Y + 11, 6, 4, '#ff6a40'); R(x, X + 20, Y + 15, 7, 5, '#40c060');
    R(x, X + 3, Y + 8, 6, 15, '#00b4e6'); R(x, X + 31, Y + 8, 6, 15, '#ff3c3c'); R(x, X + 3, Y + 8, 6, 1, '#80e0ff'); R(x, X + 31, Y + 8, 6, 1, '#ff9a9a');
    R(x, X + 5, Y + 12, 2, 2, '#202020'); R(x, X + 33, Y + 17, 2, 2, '#202020');
  } },
  { id: 'ps5', namn: 'HOSHI NOVA 5', forebild: 'PlayStation 5', ar: 2020, gen: 9, tillverkare: 'HOSHI', rita(x, X, Y) {
    skugga(x, X + 10, Y + 26, 22);
    for (let j = 0; j < 24; j++) { const b = Math.round(Math.sin((j / 24) * Math.PI) * 3); R(x, X + 12 - b, Y + 2 + j, 4 + b, 1, '#f4f4f6'); R(x, X + 24, Y + 2 + j, 4 + b, 1, '#f4f4f6'); }
    R(x, X + 16, Y + 4, 8, 22, '#141418'); R(x, X + 16, Y + 4, 1, 22, '#4a8af0'); R(x, X + 23, Y + 4, 1, 22, '#4a8af0');
  } },
  { id: 'svitsch2', namn: 'TENKO SNAP 2', forebild: 'Nintendo Switch 2', ar: 2025, gen: 9, tillverkare: 'TENKO', rita(x, X, Y) {
    skugga(x, X + 1, Y + 25, 38);
    R(x, X + 8, Y + 7, 24, 16, '#1e1e22'); R(x, X + 9, Y + 8, 22, 14, '#24305a'); R(x, X + 11, Y + 10, 8, 5, '#ffb040'); R(x, X + 21, Y + 13, 8, 6, '#e04060');
    R(x, X + 2, Y + 7, 6, 16, '#26262c'); R(x, X + 32, Y + 7, 6, 16, '#26262c'); R(x, X + 7, Y + 7, 1, 16, '#00b4e6'); R(x, X + 32, Y + 7, 1, 16, '#ff3c3c');
  } },
  { id: 'ps6', namn: 'HOSHI NOVA 6', forebild: 'PlayStation 6 (ryktas)', ar: 2027, gen: 10, tillverkare: 'HOSHI', rita(x, X, Y) {
    skugga(x, X + 6, Y + 26, 28);
    for (let j = 0; j < 22; j++) R(x, X + 12 - Math.round(j / 6), Y + 3 + j, 16 + Math.round(j / 3), 1, j % 4 ? '#2a2a3a' : '#33334a');
    for (let k = 0; k < 2; k++) R(x, X + 17 + k * 2, Y + 8, 1, 12, '#8a6aff');
    const Q = ['.###.', '#...#', '...#.', '..#..', '.....', '..#..'];
    Q.forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === '#') P(x, X + 30 + i, Y + 4 + j, '#ffd23f'); });
  } },
];
export const KONSOL = Object.fromEntries(KONSOLLER.map((k) => [k.id, k]));
