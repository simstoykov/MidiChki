import explorerhat as eh
import pygame.midi as midi
from random import random

midi.init()

def random_between(start, to):
    return int(start + random() * (to-start))

def find_roland_id():
    device_cnt = midi.get_count()
    for i in range(device_cnt):
        info = midi.get_device_info(i)
        name = str(info[1])
        is_input = info[2]

        print(f"Checking {name}, is_input={is_input}")
        if is_input and "Roland" in name:
            print(f"Found it on id {i}")
            return i

    raise "Couldn't find Roland..."

lights = [eh.light.yellow, eh.light.blue, eh.light.red, eh.light.green]

rotating = 0
def handle_note_pressed(note, velocity):
    global rotating

    prev = rotating
    while prev == rotating:
        rotating = random_between(0, 4)

    print(f"Pressed note {note} with vel {velocity}")

    rel_vel = velocity / 127 * 100
    lights[rotating].fade(rel_vel, 0, 0.1)

roland_id = find_roland_id()
roland = midi.Input(roland_id)

while True:
    reads = roland.read(1)

    for read in reads:
        data, timestamp = read
        status, note, velocity, idk = data

        if status == 144:
            handle_note_pressed(note, velocity)

