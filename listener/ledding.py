import board
import neopixel
from time import sleep
from random import random

def blend_ctr(c1, c2, ctr):
    return [min(255, f*(1-ctr) + s*ctr) for f, s in zip(c1, c2)]


def blend_vals(c1, c2):
    iterations = 100
    return [blend_ctr(c1, c2, i/iterations) for i in range(iterations)]

def blend(cur_color, next_color):
    for val in blend_vals(cur_color, next_color):
        pixels.fill(val)
        sleep(0.01)


def sequence(cur_color, next_color):
    for i in range(50):
        pixels[i] = next_color
        sleep(0.02)

def desequence(cur_color, next_color):
    initiator = int(random()*50)
    for i in range(50):
        l = (initiator-i) % 50
        r = (initiator+i) % 50

        pixels[l] = next_color
        pixels[r] = next_color
        sleep(0.01)


def random_color(mx):
    return random()*mx, random()*mx, random()*mx


pixels = neopixel.NeoPixel(board.D18, 50, brightness=1, pixel_order=neopixel.RGB, auto_write=True)

# pixels.fill((62, 200, 137))
# sleep(10)

cur_color = (0, 0, 0)
diff = 200
i = 1


while True:
    next_color = random_color(diff if i%2 == 0 else 256-diff)
    sequence(cur_color, next_color)
    cur_color = next_color
