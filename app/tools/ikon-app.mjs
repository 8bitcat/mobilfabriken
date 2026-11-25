// Appikonen och startbilden till Xcode-projektet, ur spelets egen ikon (icons/ikon-512.png = pixeltelefonen
// 32×32 förstorad ×16, ritad av tools/ikon.mjs):
//   - AppIcon-512@2x.png  1024×1024, RGB utan alfakanal (Apple nekar ikoner med alfa), ×2 utan utjämning
//   - splash-2732x2732*.png  spelets mörka botten och ikonen (512 px) mitt i – utan namn (två språk, två namn).
//     Telefonen visar mittbandet av den kvadratiska bilden i liggande läge, så allt ligger nära mitten.
//   node app/tools/ikon-app.mjs           (PIL via python – samma väg som Pixelcity)
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(APP, '..');
const XC = path.join(APP, 'ios/App/App/Assets.xcassets');

const py = `
import sys
from PIL import Image, ImageFont, ImageDraw
root, xc, kalla = sys.argv[1], sys.argv[2], sys.argv[3]
ikon = Image.open(kalla).convert('RGBA')
# ikonen: 1024, hela pixelkorn, över spelets botten så att inget blir genomskinligt
stor = ikon.resize((1024, 1024), Image.NEAREST)
botten = Image.new('RGBA', (1024, 1024), '#070912'); botten.alpha_composite(stor)
botten.convert('RGB').save(xc + '/AppIcon.appiconset/AppIcon-512@2x.png', optimize=True)
# startbilden
S = 2732; k = 8
bild = Image.new('RGBA', (S, S), '#070912')
w = 512; x = (S - w) // 2; y = (S - w) // 2 - 110
bild.alpha_composite(ikon.resize((w, w), Image.NEAREST), (x, y))
font = ImageFont.truetype(root + '/fonts/pixelstad.otf', 12 * k)
text = 'MOBILFABRIKEN'
mask = Image.new('L', (S, 20 * k), 0)
d = ImageDraw.Draw(mask)
tw = d.textlength(text, font=font)
tx = int((S - tw) / 2)
d.text((tx + k, 11 * k), text, font=font, fill=255)
mask = mask.point(lambda v: 255 if v >= 128 else 0)   # skarpa kanter, inga halvpixlar
skugga = Image.new('RGBA', mask.size, '#0d1128'); guld = Image.new('RGBA', mask.size, '#ffd23f')
ty = y + w + 3 * k
# ingen text på startbilden: appen heter olika på svenska och engelska (Mobilfabriken / Smartphone Empire)
if False: bild.paste(skugga, (k, ty + k), mask); bild.paste(guld, (0, ty), mask)
rgb = bild.convert('RGB')
for f in ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']:
    rgb.save(xc + '/Splash.imageset/' + f, optimize=True)
print('ikon 1024 + startbild 2732 skrivna till', xc)
`;
// --kalla <png 512>: annan ikon (Console Empire: app/variant/konsol/ikon-512.png, ritad av ikon-konsol.py)
const KALLA = process.argv.includes('--kalla') ? path.resolve(process.argv[process.argv.indexOf('--kalla') + 1]) : path.join(ROOT, 'icons', 'ikon-512.png');
execFileSync('python', ['-c', py, ROOT, XC, KALLA], { stdio: 'inherit' });
