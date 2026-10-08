// Möbelkatalogen (BYGG). Förlagans katalog i kronor (dollar × 10).
// plats: 'bord' = en arbetsplats (bord + dator + stol), 'golv' = golvplats, 'vagg' = väggplats,
//        'golvtyp' / 'vaggtyp' = hela golvet/väggen.
// bonus: arbetsfart (bord, %), forskning (datorer, %), buggfix (labb, %), trivsel (poäng).
// las = kontorsnivå som krävs. stj = stjärnor (kvalitetsnivå, styr KONTOR ★).
const M = (id, namn, kat, plats, pris, stj, bonus = {}, las = null, extra = {}) => ({ id, namn, kat, plats, pris, stj, bonus, las, ...extra });

export const KATEGORIER = [
  { id: 'bord', namn: 'BORD' }, { id: 'datorer', namn: 'DATORER' }, { id: 'stolar', namn: 'STOLAR' }, { id: 'labb', namn: 'LABB' },
  { id: 'trivsel', namn: 'TRIVSEL' }, { id: 'vaxter', namn: 'VÄXTER' }, { id: 'lampor', namn: 'LAMPOR' }, { id: 'dekor', namn: 'DEKOR' },
  { id: 'golv', namn: 'GOLV' }, { id: 'vaggar', namn: 'VÄGGAR' },
];

export const KATALOG = [
  // arbetsplatsen: bord (arbetsfart), dator (forskning), stol (trivsel)
  M('fallbord', 'FÄLLBORD', 'bord', 'bord', 0, 1, { arbetsfart: 0 }),
  M('trabord', 'TRÄBORD', 'bord', 'bord', 120_000, 2, { arbetsfart: 0.03 }),
  M('kontorsbord', 'KONTORSBORD', 'bord', 'bord', 500_000, 3, { arbetsfart: 0.06 }),
  M('chefsbord', 'CHEFSBORD', 'bord', 'bord', 900_000, 3, { arbetsfart: 0.09 }, 'litet'),
  M('glasbord', 'GLAS-LED-BORD', 'bord', 'bord', 2_000_000, 4, { arbetsfart: 0.10 }, 'vaning'),
  M('stridsstation', 'STRIDSSTATION', 'bord', 'bord', 5_000_000, 4, { arbetsfart: 0.12 }, 'studio'),
  M('guldbord', 'GULDBORD FÖR VD', 'bord', 'bord', 20_000_000, 5, { arbetsfart: 0.15 }, 'hk', { exklusiv: true }),
  M('crt', 'GAMMAL BURKSKÄRM', 'datorer', 'dator', 0, 1, { forskning: 0 }),
  M('platt', 'PLATT SKÄRM', 'datorer', 'dator', 30_000, 2, { forskning: 0.05 }),
  M('dubbel', 'DUBBLA SKÄRMAR', 'datorer', 'dator', 150_000, 3, { forskning: 0.10 }, 'litet'),
  M('station', 'ARBETSSTATION', 'datorer', 'dator', 800_000, 4, { forskning: 0.15 }, 'vaning'),
  M('aiterminal', 'AI-TERMINAL', 'datorer', 'dator', 3_000_000, 5, { forskning: 0.20 }, 'studio'),
  M('pall', 'PALL', 'stolar', 'stol', 0, 1, { trivsel: 0 }),
  M('kontorsstol', 'KONTORSSTOL', 'stolar', 'stol', 8_000, 1, { trivsel: 1 }),
  M('ergostol', 'ERGONOMISK STOL', 'stolar', 'stol', 40_000, 2, { trivsel: 2 }),
  M('gamingstol', 'GAMINGSTOL', 'stolar', 'stol', 150_000, 3, { trivsel: 3 }, 'litet'),
  M('massagestol', 'MASSAGESTOL', 'stolar', 'stol', 1_000_000, 4, { trivsel: 4 }, 'vaning'),
  // labbutrustning (buggfix)
  M('testbank', 'TESTBÄNK', 'labb', 'golv', 500_000, 2, { buggfix: 0.2 }),
  M('serverrack', 'SERVERRACK', 'labb', 'golv', 2_400_000, 3, { buggfix: 0.2 }),
  M('skrivarlabb', '3D-SKRIVARLABB', 'labb', 'golv', 8_000_000, 3, { buggfix: 0.2 }),
  M('robotarm', 'ROBOTARM', 'labb', 'golv', 15_000_000, 4, { buggfix: 0.2 }, 'vaning'),
  M('superdator', 'AI-SUPERDATOR', 'labb', 'golv', 40_000_000, 5, { buggfix: 0.4 }, 'studio'),
  M('kvantdator', 'KVANTDATOR', 'labb', 'golv', 100_000_000, 5, { buggfix: 0.4 }, 'hk', { exklusiv: true }),
  // trivsel
  M('vattenautomat', 'VATTENAUTOMAT', 'trivsel', 'golv', 15_000, 1, { trivsel: 1 }),
  M('kaffe', 'KAFFEHÖRNA', 'trivsel', 'golv', 30_000, 1, { trivsel: 2 }),
  M('whiteboard', 'WHITEBOARD', 'trivsel', 'vagg', 40_000, 1, { trivsel: 1 }),
  M('soffa', 'SOFFA', 'trivsel', 'golv', 60_000, 2, { trivsel: 3 }),
  M('bokhylla', 'BOKHYLLA', 'trivsel', 'golv', 100_000, 2, { trivsel: 2 }),
  M('arkad', 'ARKADMASKIN', 'trivsel', 'golv', 250_000, 2, { trivsel: 4 }, 'litet'),
  M('varuautomat', 'VARUAUTOMAT', 'trivsel', 'golv', 200_000, 3, { trivsel: 3 }, 'litet'),
  M('biljard', 'BILJARDBORD', 'trivsel', 'golv', 600_000, 4, { trivsel: 6 }, 'vaning'),
  // växter
  M('krukvaxt', 'KRUKVÄXT', 'vaxter', 'golv', 5_000, 1, { trivsel: 1 }),
  M('hogvaxt', 'HÖG VÄXT', 'vaxter', 'golv', 20_000, 1, { trivsel: 2 }),
  M('palm', 'PALM', 'vaxter', 'golv', 150_000, 2, { trivsel: 3 }),
  M('bonsai', 'BONSAI', 'vaxter', 'golv', 2_500_000, 3, { trivsel: 4 }),
  M('inomhustrad', 'INOMHUSTRÄD', 'vaxter', 'golv', 4_000_000, 4, { trivsel: 6 }, 'vaning'),
  M('kristalltrad', 'KRISTALLTRÄD', 'vaxter', 'golv', 20_000_000, 5, { trivsel: 12 }, 'hk', { exklusiv: true }),
  // lampor
  M('golvlampa', 'GOLVLAMPA', 'lampor', 'golv', 10_000, 1, { trivsel: 1 }),
  M('baglampa', 'BÅGLAMPA', 'lampor', 'golv', 200_000, 2, { trivsel: 2 }),
  M('neonskylt', 'NEONSKYLT', 'lampor', 'vagg', 4_000_000, 3, { trivsel: 4 }),
  M('ledpelare', 'LED-PELARE', 'lampor', 'golv', 6_000_000, 4, { trivsel: 5 }, 'vaning'),
  M('kristallkrona', 'KRISTALLKRONA', 'lampor', 'vagg', 30_000_000, 5, { trivsel: 12 }, 'hk', { exklusiv: true }),
  // dekor
  M('tavla', 'TAVLA', 'dekor', 'vagg', 15_000, 1, { trivsel: 1 }),
  M('matta', 'MATTA', 'dekor', 'golv', 20_000, 1, { trivsel: 1 }),
  M('arkivskap', 'ARKIVSKÅP', 'dekor', 'golv', 30_000, 1, {}),
  M('jordglob', 'JORDGLOB', 'dekor', 'golv', 500_000, 2, { trivsel: 2 }),
  M('lyxmatta', 'LYXMATTA', 'dekor', 'golv', 500_000, 2, { trivsel: 3 }),
  M('telefonmonter', 'TELEFONMONTER', 'dekor', 'golv', 10_000_000, 3, { trivsel: 4 }),
  M('skulptur', 'MODERN SKULPTUR', 'dekor', 'golv', 15_000_000, 4, { trivsel: 8 }, 'studio'),
  M('guldtelefon', 'GULDTELEFON', 'dekor', 'golv', 50_000_000, 5, { trivsel: 20 }, 'hk', { exklusiv: true }),
  // golv och väggar (hela rummet)
  M('betong', 'BETONG', 'golv', 'golvtyp', 0, 1),
  M('klinker', 'KLINKER', 'golv', 'golvtyp', 6_000, 1),
  M('schack', 'SCHACKRUTOR', 'golv', 'golvtyp', 8_000, 1),
  M('stal', 'STÅLPLÅT', 'golv', 'golvtyp', 15_000, 1),
  M('grasmatta', 'KONSTGRÄS', 'golv', 'golvtyp', 20_000, 1),
  M('parkett', 'PARKETT', 'golv', 'golvtyp', 60_000, 2),
  M('marmor', 'MARMOR', 'golv', 'golvtyp', 300_000, 2, {}, 'litet'),
  M('neongolv', 'NEONGOLV', 'golv', 'golvtyp', 2_000_000, 3, {}, 'vaning'),
  M('tegel', 'TEGELVÄGG', 'vaggar', 'vaggtyp', 0, 1),
  M('puts', 'PUTSAD VÄGG', 'vaggar', 'vaggtyp', 5_000, 1),
  M('panel', 'TRÄPANEL', 'vaggar', 'vaggtyp', 20_000, 1),
  M('kakel', 'VITT KAKEL', 'vaggar', 'vaggtyp', 30_000, 1),
  M('glasvagg', 'GLASVÄGG', 'vaggar', 'vaggtyp', 200_000, 2, {}, 'litet'),
  M('betongvagg', 'BETONG & LED', 'vaggar', 'vaggtyp', 1_200_000, 3, {}, 'vaning'),
];
export const MOBEL = Object.fromEntries(KATALOG.map((m) => [m.id, m]));
