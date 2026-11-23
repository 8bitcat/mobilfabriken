// Produktlinjerna: telefoner (delar.js, 2007–) och spelkonsoler (konsol.js, 1982–). En design bär sin linje i
// d.linje (saknas = 'telefon', alla gamla sparningar). sim/design.js räknar kostnad, förväntan och betyg på
// linjens tabeller, så att samma designer, bygge och lansering fungerar för båda. Se docs/KONSOLPLAN.md.
import * as T from './delar.js';
import * as K from './konsol.js';

export const LINJER = {
  telefon: {
    id: 'telefon', namn: 'TELEFON', startAr: 2007,
    GRUPPER: T.GRUPPER, DELAR: T.DELAR, KAROSSER: T.KAROSSER, ENHETER: T.ENHETER, FUNKTIONER: T.FUNKTIONER,
    STANDARD_VAL: T.STANDARD_VAL, YTOR: T.YTOR, delAv: T.delAv, nivaAv: T.nivaAv, enhetAv: T.enhetAv,
    // nodernas id-prefix i forskningsträdet (data/noder.js)
    nyckel: { del: 'del', kaross: 'kaross', funk: 'funk', enhet: 'enhet' },
    fraschhet: 0.16,   // karossens fräschhet sjunker 16 % per år
  },
  konsol: {
    id: 'konsol', namn: 'KONSOL', startAr: 1982,
    GRUPPER: K.K_GRUPPER, DELAR: K.K_DELAR, KAROSSER: K.K_KAROSSER, ENHETER: K.K_ENHETER, FUNKTIONER: K.K_FUNKTIONER,
    STANDARD_VAL: K.K_STANDARD_VAL, YTOR: T.YTOR, delAv: K.kDelAv, nivaAv: K.kNivaAv, enhetAv: K.kEnhetAv,
    nyckel: { del: 'kdel', kaross: 'kkaross', funk: 'kfunk', enhet: 'kenhet' },
    fraschhet: 0.12,   // en konsol håller längre än en telefon
  },
};
export const linjeAv = (x) => LINJER[(typeof x === 'string' ? x : x?.linje) || 'telefon'] || LINJER.telefon;
// enhetens linje: konsolernas enhets-id (hem, ficka, hybrid, vr) krockar aldrig med telefonernas
const K_ENHET_ID = new Set(K.K_ENHETER.map((e) => e.id));
export const linjeForEnhet = (enhet) => (K_ENHET_ID.has(enhet) ? LINJER.konsol : LINJER.telefon);
export const arKonsolEnhet = (enhet) => K_ENHET_ID.has(enhet);
