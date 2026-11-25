// Vilken app spelet körs som (Carl 2026-11-25: "två appar Smartphone Empire och Console Empire", ren delning):
//   'telefon' = Smartphone Empire / Mobilfabriken – bara telefonspelet från 2007 (SNABBSTART)
//   'konsol'  = Console Empire / Konsolfabriken – bara konsolspelet från 1982 (kommer senare)
//   null      = webben: båda lägena, startvalet visas som förut
// app/build.mjs skriver window.MF_APPLAGE i appens index.html (app/package.json "applage"). ?applage=telefon i
// adressen gör samma sak, för tester och skärmbilder.
const fran = () => {
  if (typeof window === 'undefined') return null;
  try { const q = new URLSearchParams(location.search).get('applage'); if (q === 'telefon' || q === 'konsol') return q; } catch { /* ok */ }
  const w = window.MF_APPLAGE;
  return w === 'telefon' || w === 'konsol' ? w : null;
};
export const APPLAGE = fran();
