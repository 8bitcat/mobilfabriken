# Console Empires ikon, 32×32 pixlar i samma stil som telefonikonen (icons/ikon-512.png): mörk studio med ljusare
# kärna, en spelkonsol med kassett i och en handkontroll, blått golvsken och tre gnistor.
#   python app/tools/ikon-konsol.py  →  app/variant/konsol/ikon-512.png (×16) och ikon-1024.png (×32)
import os, math
from PIL import Image

N = 32
im = Image.new('RGB', (N, N), '#070912')
px = im.load()
def p(x, y, c):
    if 0 <= x < N and 0 <= y < N: px[x, y] = tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))
def r(x, y, w, h, c):
    for yy in range(y, y + h):
        for xx in range(x, x + w): p(xx, yy, c)

# bakgrund: ljusare kärna i band, med rutmönster i ytterbandet (som telefonikonen)
for y in range(N):
    for x in range(N):
        d = math.hypot((x - 15.5) / 1.1, y - 15)
        if d < 9: p(x, y, '#1c2350')
        elif d < 13: p(x, y, '#141a3c')
        elif d < 17: p(x, y, '#0d1128')
        elif d < 19 and (x + y) % 2: p(x, y, '#0d1128')

# golvsken
r(5, 26, 22, 1, '#1a2d8a'); r(7, 26, 18, 1, '#2a4bd0'); r(11, 26, 10, 1, '#3a5bff'); r(9, 27, 14, 1, '#1a2d8a')

# kassetten (röd med gul etikett) som sticker upp ur konsolen
r(12, 7, 8, 1, '#05060f'); r(11, 8, 1, 7, '#05060f'); r(20, 8, 1, 7, '#05060f')
r(12, 8, 8, 7, '#e8484e'); r(12, 8, 1, 7, '#ff7a7e'); r(19, 8, 1, 7, '#b02a32')
r(13, 9, 6, 3, '#ffd23f'); r(14, 10, 4, 1, '#e8a020')

# konsolen: kontur, ljus ovansida, mörkare framsida, kassettfack, lysdiod och två knappar
r(4, 14, 24, 1, '#05060f'); r(3, 15, 1, 10, '#05060f'); r(28, 15, 1, 10, '#05060f'); r(4, 25, 24, 1, '#05060f')
r(4, 15, 24, 4, '#ebebee'); r(4, 15, 24, 1, '#ffffff')
r(10, 15, 12, 2, '#3a3f55')                      # facket kassetten står i
r(4, 19, 24, 6, '#b8bcc8'); r(4, 19, 24, 1, '#9ea3b2')
r(6, 21, 9, 2, '#05060f'); r(7, 21, 7, 1, '#2a2f45')   # skåra fram
r(18, 21, 2, 2, '#e8484e'); r(21, 21, 2, 2, '#3a7bd5')  # två knappar
r(25, 21, 1, 1, '#4ff0ff')                       # lysdiod

# gnistor
for (x, y, c, k) in [(26, 6, '#ffd23f', '#fff4c0'), (5, 9, '#4ff0ff', '#e0ffff')]:
    p(x, y, k); p(x - 1, y, c); p(x + 1, y, c); p(x, y - 1, c); p(x, y + 1, c)
p(27, 12, '#ff4fd0')

ut = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'variant', 'konsol')
os.makedirs(ut, exist_ok=True)
im.resize((512, 512), Image.NEAREST).save(os.path.join(ut, 'ikon-512.png'))
im.resize((1024, 1024), Image.NEAREST).save(os.path.join(ut, 'ikon-1024.png'))
print('ikon:', os.path.normpath(ut))
