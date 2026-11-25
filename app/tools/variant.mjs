// Växlar Xcode-projektet mellan de två apparna ur samma kod (Carl 2026-11-25: "två appar … ren delning"):
//   telefon = Smartphone Empire / Mobilfabriken   io.eightbitcat.mobilfabriken   (repots standard)
//   konsol  = Console Empire / Konsolimperiet     io.eightbitcat.consoleempire
// Skriver: app/package.json applage, capacitor.config.json (appId, appName), project.pbxproj
// (PRODUCT_BUNDLE_IDENTIFIER), Info.plist + en/sv InfoPlist.strings (namnet på hemskärmen), appikonen och startbilden.
// Codemagic-workflowen ios-console kör `node app/tools/variant.mjs konsol` före bygget; i repot ligger telefon.
//   node app/tools/variant.mjs <telefon|konsol>
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const V = process.argv[2];
const VARIANTER = {
  telefon: { bundle: 'io.eightbitcat.mobilfabriken', en: 'Smartphone Empire', sv: 'Mobilfabriken' },
  konsol: { bundle: 'io.eightbitcat.consoleempire', en: 'Console Empire', sv: 'Konsolimperiet' },
};
const X = VARIANTER[V];
if (!X) { console.log('använd: node app/tools/variant.mjs <telefon|konsol>'); process.exit(1); }
const rw = (rel, fn) => { const f = path.join(APP, rel); const s = fs.readFileSync(f, 'utf8'); const t = fn(s); if (t === s) return false; fs.writeFileSync(f, t); return true; };
const json = (rel, fn) => rw(rel, (s) => JSON.stringify(fn(JSON.parse(s)), null, 2) + '\n');

json('package.json', (p) => ({ ...p, applage: V }));
json('capacitor.config.json', (c) => ({ ...c, appId: X.bundle, appName: X.en }));
rw('ios/App/App.xcodeproj/project.pbxproj', (s) => s.replace(/PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g, `PRODUCT_BUNDLE_IDENTIFIER = ${X.bundle};`));
rw('ios/App/App/Info.plist', (s) => s.replace(/(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/, `$1${X.en}$2`));
rw('ios/App/App/en.lproj/InfoPlist.strings', () => `/* ${X.en} – en */\n"CFBundleDisplayName" = "${X.en}";\n`);
rw('ios/App/App/sv.lproj/InfoPlist.strings', () => `/* ${X.sv} – sv */\n"CFBundleDisplayName" = "${X.sv}";\n`);
// ikon och startbild: färdiga filer i app/variant/<app>/ (gjorda med ikon-app.mjs; Codemagics Mac har ingen PIL)
const XC = path.join(APP, 'ios/App/App/Assets.xcassets');
fs.copyFileSync(path.join(APP, 'variant', V, 'AppIcon.png'), path.join(XC, 'AppIcon.appiconset/AppIcon-512@2x.png'));
for (const f of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) fs.copyFileSync(path.join(APP, 'variant', V, 'splash.png'), path.join(XC, 'Splash.imageset', f));
// kontroll: allt pekar på rätt app
const koll = [
  JSON.parse(fs.readFileSync(path.join(APP, 'capacitor.config.json'), 'utf8')).appId === X.bundle,
  (fs.readFileSync(path.join(APP, 'ios/App/App.xcodeproj/project.pbxproj'), 'utf8').match(/PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g) || []).every((m) => m === `PRODUCT_BUNDLE_IDENTIFIER = ${X.bundle};`),
  JSON.parse(fs.readFileSync(path.join(APP, 'package.json'), 'utf8')).applage === V,
];
if (koll.includes(false)) { console.log('✗ variant: något pekar fel', koll); process.exit(1); }
console.log(`✓ appen är nu ${X.en} / ${X.sv} (${X.bundle})`);
