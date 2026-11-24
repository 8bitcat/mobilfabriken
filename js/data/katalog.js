// Möbelkatalogen (BYGG). Förlagans katalog i kronor (dollar × 10).
// plats: 'bord' = en arbetsplats (bord + dator + stol), 'golv' = golvplats, 'vagg' = väggplats,
//        'golvtyp' / 'vaggtyp' = hela golvet/väggen.
// bonus: arbetsfart (bord, %), forskning (datorer, %), buggfix (labb, %), trivsel (poäng).
// las = kontorsnivå som krävs. stj = stjärnor (kvalitetsnivå, styr KONTOR ★).
import { $t } from '../core/i18n.js';
const M = (id, namn, kat, plats, pris, stj, bonus = {}, las = null, extra = {}) => ({ id, namn, kat, plats, pris, stj, bonus, las, ...extra });

export const KATEGORIER = [
  { id: 'bord', namn: $t('BORD') }, { id: 'datorer', namn: $t('DATORER') }, { id: 'stolar', namn: $t('STOLAR') }, { id: 'labb', namn: $t('LABB') },
  { id: 'trivsel', namn: $t('TRIVSEL') }, { id: 'vaxter', namn: $t('VÄXTER') }, { id: 'lampor', namn: $t('LAMPOR') }, { id: 'dekor', namn: $t('DEKOR') },
  { id: 'golv', namn: $t('GOLV') }, { id: 'vaggar', namn: $t('VÄGGAR') },
];

export const KATALOG = [
  // arbetsplatsen: bord (arbetsfart), dator (forskning), stol (trivsel)
  M('fallbord', $t('FÄLLBORD'), 'bord', 'bord', 0, 1, { arbetsfart: 0 }),
  M('trabord', $t('TRÄBORD'), 'bord', 'bord', 120_000, 2, { arbetsfart: 0.03 }),
  M('kontorsbord', $t('KONTORSBORD'), 'bord', 'bord', 500_000, 3, { arbetsfart: 0.06 }),
  M('chefsbord', $t('CHEFSBORD'), 'bord', 'bord', 900_000, 3, { arbetsfart: 0.09 }, 'litet'),
  M('glasbord', $t('GLAS-LED-BORD'), 'bord', 'bord', 2_000_000, 4, { arbetsfart: 0.10 }, 'vaning'),
  M('stridsstation', $t('STRIDSSTATION'), 'bord', 'bord', 5_000_000, 4, { arbetsfart: 0.12 }, 'studio'),
  M('guldbord', $t('GULDBORD FÖR VD'), 'bord', 'bord', 20_000_000, 5, { arbetsfart: 0.15 }, 'hk', { exklusiv: true }),
  M('crt', $t('GAMMAL BURKSKÄRM'), 'datorer', 'dator', 0, 1, { forskning: 0 }),
  M('platt', $t('PLATT SKÄRM'), 'datorer', 'dator', 30_000, 2, { forskning: 0.05 }),
  M('dubbel', $t('DUBBLA SKÄRMAR'), 'datorer', 'dator', 150_000, 3, { forskning: 0.10 }, 'litet'),
  M('station', $t('ARBETSSTATION'), 'datorer', 'dator', 800_000, 4, { forskning: 0.15 }, 'vaning'),
  M('aiterminal', $t('AI-TERMINAL'), 'datorer', 'dator', 3_000_000, 5, { forskning: 0.20 }, 'studio'),
  M('pall', $t('PALL'), 'stolar', 'stol', 0, 1, { trivsel: 0 }),
  M('kontorsstol', $t('KONTORSSTOL'), 'stolar', 'stol', 8_000, 1, { trivsel: 1 }),
  M('ergostol', $t('ERGONOMISK STOL'), 'stolar', 'stol', 40_000, 2, { trivsel: 2 }),
  M('gamingstol', $t('GAMINGSTOL'), 'stolar', 'stol', 150_000, 3, { trivsel: 3 }, 'litet'),
  M('massagestol', $t('MASSAGESTOL'), 'stolar', 'stol', 1_000_000, 4, { trivsel: 4 }, 'vaning'),
  // labbutrustning (buggfix)
  M('testbank', $t('TESTBÄNK'), 'labb', 'golv', 500_000, 2, { buggfix: 0.2 }),
  M('serverrack', $t('SERVERRACK'), 'labb', 'golv', 2_400_000, 3, { buggfix: 0.2 }),
  M('skrivarlabb', $t('3D-SKRIVARLABB'), 'labb', 'golv', 8_000_000, 3, { buggfix: 0.2 }),
  M('robotarm', $t('ROBOTARM'), 'labb', 'golv', 15_000_000, 4, { buggfix: 0.2 }, 'vaning'),
  M('superdator', $t('AI-SUPERDATOR'), 'labb', 'golv', 40_000_000, 5, { buggfix: 0.4 }, 'studio'),
  M('kvantdator', $t('KVANTDATOR'), 'labb', 'golv', 100_000_000, 5, { buggfix: 0.4 }, 'hk', { exklusiv: true }),
  // trivsel
  M('vattenautomat', $t('VATTENAUTOMAT'), 'trivsel', 'golv', 15_000, 1, { trivsel: 1 }),
  M('kaffe', $t('KAFFEHÖRNA'), 'trivsel', 'golv', 30_000, 1, { trivsel: 2 }),
  M('whiteboard', $t('WHITEBOARD'), 'trivsel', 'vagg', 40_000, 1, { trivsel: 1 }),
  M('soffa', $t('SOFFA'), 'trivsel', 'golv', 60_000, 2, { trivsel: 3 }),
  M('bokhylla', $t('BOKHYLLA'), 'trivsel', 'golv', 100_000, 2, { trivsel: 2 }),
  M('arkad', $t('ARKADMASKIN'), 'trivsel', 'golv', 250_000, 2, { trivsel: 4 }, 'litet'),
  M('varuautomat', $t('VARUAUTOMAT'), 'trivsel', 'golv', 200_000, 3, { trivsel: 3 }, 'litet'),
  M('biljard', $t('BILJARDBORD'), 'trivsel', 'golv', 600_000, 4, { trivsel: 6 }, 'vaning'),
  // växter
  M('krukvaxt', $t('KRUKVÄXT'), 'vaxter', 'golv', 5_000, 1, { trivsel: 1 }),
  M('hogvaxt', $t('HÖG VÄXT'), 'vaxter', 'golv', 20_000, 1, { trivsel: 2 }),
  M('palm', $t('PALM'), 'vaxter', 'golv', 150_000, 2, { trivsel: 3 }),
  M('bonsai', $t('BONSAI'), 'vaxter', 'golv', 2_500_000, 3, { trivsel: 4 }),
  M('inomhustrad', $t('INOMHUSTRÄD'), 'vaxter', 'golv', 4_000_000, 4, { trivsel: 6 }, 'vaning'),
  M('kristalltrad', $t('KRISTALLTRÄD'), 'vaxter', 'golv', 20_000_000, 5, { trivsel: 12 }, 'hk', { exklusiv: true }),
  // lampor
  M('golvlampa', $t('GOLVLAMPA'), 'lampor', 'golv', 10_000, 1, { trivsel: 1 }),
  M('baglampa', $t('BÅGLAMPA'), 'lampor', 'golv', 200_000, 2, { trivsel: 2 }),
  M('neonskylt', $t('NEONSKYLT'), 'lampor', 'vagg', 4_000_000, 3, { trivsel: 4 }),
  M('ledpelare', $t('LED-PELARE'), 'lampor', 'golv', 6_000_000, 4, { trivsel: 5 }, 'vaning'),
  M('kristallkrona', $t('KRISTALLKRONA'), 'lampor', 'vagg', 30_000_000, 5, { trivsel: 12 }, 'hk', { exklusiv: true }),
  // dekor
  M('tavla', $t('TAVLA'), 'dekor', 'vagg', 15_000, 1, { trivsel: 1 }),
  M('matta', $t('MATTA'), 'dekor', 'golv', 20_000, 1, { trivsel: 1 }),
  M('arkivskap', $t('ARKIVSKÅP'), 'dekor', 'golv', 30_000, 1, {}),
  M('jordglob', $t('JORDGLOB'), 'dekor', 'golv', 500_000, 2, { trivsel: 2 }),
  M('lyxmatta', $t('LYXMATTA'), 'dekor', 'golv', 500_000, 2, { trivsel: 3 }),
  M('telefonmonter', $t('TELEFONMONTER'), 'dekor', 'golv', 10_000_000, 3, { trivsel: 4 }),
  M('skulptur', $t('MODERN SKULPTUR'), 'dekor', 'golv', 15_000_000, 4, { trivsel: 8 }, 'studio'),
  M('guldtelefon', $t('GULDTELEFON'), 'dekor', 'golv', 50_000_000, 5, { trivsel: 20 }, 'hk', { exklusiv: true }),
  // golv och väggar (hela rummet)
  M('betong', $t('BETONG'), 'golv', 'golvtyp', 0, 1),
  M('klinker', $t('KLINKER'), 'golv', 'golvtyp', 6_000, 1),
  M('schack', $t('SCHACKRUTOR'), 'golv', 'golvtyp', 8_000, 1),
  M('stal', $t('STÅLPLÅT'), 'golv', 'golvtyp', 15_000, 1),
  M('grasmatta', $t('KONSTGRÄS'), 'golv', 'golvtyp', 20_000, 1),
  M('parkett', $t('PARKETT'), 'golv', 'golvtyp', 60_000, 2),
  M('marmor', $t('MARMOR'), 'golv', 'golvtyp', 300_000, 2, {}, 'litet'),
  M('neongolv', $t('NEONGOLV'), 'golv', 'golvtyp', 2_000_000, 3, {}, 'vaning'),
  M('tegel', $t('TEGELVÄGG'), 'vaggar', 'vaggtyp', 0, 1),
  M('puts', $t('PUTSAD VÄGG'), 'vaggar', 'vaggtyp', 5_000, 1),
  M('panel', $t('TRÄPANEL'), 'vaggar', 'vaggtyp', 20_000, 1),
  M('kakel', $t('VITT KAKEL'), 'vaggar', 'vaggtyp', 30_000, 1),
  M('glasvagg', $t('GLASVÄGG'), 'vaggar', 'vaggtyp', 200_000, 2, {}, 'litet'),
  M('betongvagg', $t('BETONG & LED'), 'vaggar', 'vaggtyp', 1_200_000, 3, {}, 'vaning'),
];
export const MOBEL = Object.fromEntries(KATALOG.map((m) => [m.id, m]));
