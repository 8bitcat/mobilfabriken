// Skärmbilder av ett fullmöblerat kontor på varje nivå: node tools/kontor-snap.mjs [nivå …]
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nivaer = process.argv.slice(2).length ? process.argv.slice(2) : ['garage', 'litet', 'vaning', 'studio', 'hk'];
for (const n of nivaer) {
  const kod = `nyttTestspel(); const G = A.G; G.bolag.kassa = 1e9; G.bolag.lanseringar = 5; G.bolag.totaltSalda = 3e6; G.bolag.enhetstyper = ['telefon', 'platta', 'klocka'];
    G.mal.klara = Array.from({ length: 28 }, (_, i) => i + 1);
    for (const k of ['litet', 'vaning', 'studio', 'hk']) { if ('${n}' === 'garage') break; kont.flytta(G, k); if (k === '${n}') break; }
    const bord = ['kontorsbord', 'trabord', 'glasbord', 'chefsbord'], dator = ['platt', 'dubbel', 'crt', 'station'], stol = ['kontorsstol', 'ergostol', 'gamingstol', 'pall'];
    for (let i = 0; i < G.kontor.bord.length; i++) { kont.placera(G, { typ: 'bord', i }, bord[i % 4]); kont.placera(G, { typ: 'bord', i }, dator[i % 4]); kont.placera(G, { typ: 'bord', i }, stol[i % 4]); }
    while (pers.ledigaBord(G).length) { if (!G.kandidater.length) pers.omrull(G); pers.anstall(G, G.kandidater[0].id); }
    const golv = ['krukvaxt', 'soffa', 'serverrack', 'palm', 'biljard', 'arkad', 'vattenautomat', 'kaffe', 'bokhylla', 'hogvaxt', 'golvlampa', 'testbank'];
    G.kontor.golv.forEach((x, i) => kont.placera(G, { typ: 'golv', i }, golv[i % golv.length]));
    G.kontor.vagg.forEach((x, i) => kont.placera(G, { typ: 'vagg', i }, ['whiteboard', 'tavla', 'neonskylt'][i % 3]));
    A.G.ko = []; A.go('kontor');`;
  const ut = execFileSync(process.execPath, [path.join(root, 'tools', 'snap.mjs'), 'kontor-' + n, kod], { encoding: 'utf8' });
  const fel = JSON.parse(ut.slice(0, ut.lastIndexOf('}') + 1)).fel;
  console.log(n, fel.length ? 'FEL: ' + fel.join(' | ') : 'ok', '→ tools/out/kontor-' + n + '.png');
}
