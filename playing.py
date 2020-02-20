import logging
import time
import explorerhat as eh
import pygame.midi
from random import random
import importlib
import sys

logging.basicConfig(level=logging.INFO)

def random_between(start, to):
    return int(start + random() * (to - start))


def find_roland_id():
    pygame.midi.quit()
    pygame.midi.init()

    device_cnt = pygame.midi.get_count()
    logging.info(f"{device_cnt} USB devices connected...")

    for i in range(device_cnt):
        info = pygame.midi.get_device_info(i)

        name = str(info[1])
        is_input = info[2]

        logging.info(f"Checking {name}, is_input={is_input}...")
        if is_input and "Roland" in name:
            print(f"Found it on id {i}!")
            return i

    logging.warning("Couldn't find Roland...")
    raise FileNotFoundError("Couldn't find Roland...")


def wait_for_roland():
    while True:
        try:
            roland_id = find_roland_id()
            break
        except FileNotFoundError as e:
            logging.info("Retrying...")
            time.sleep(1)

    return pygame.midi.Input(roland_id)


def handle_note_pressed(note, velocity):
    global rotating

    prev = rotating
    while prev == rotating:
        rotating = random_between(0, 4)

    print(f"Pressed note {note} with vel {velocity}")

    rel_vel = velocity / 127 * 100
    lights[rotating].fade(rel_vel, 0, 0.1)


# Set global state
lights = [eh.light.yellow, eh.light.blue, eh.light.red, eh.light.green]
rotating = 0

if __name__ == '__main__':
    logging.info("Hello!")

    roland = wait_for_roland()

    last_note_time = time.time()

    logging.info("Indefinitely listening for notes...")
    while True:
        reads = roland.read(1)
        cur_time = time.time()

        if len(reads) == 0:
            elapsed = cur_time - last_note_time
            if elapsed > 1:
                try:
                    roland.close()
                except Exception:
                    logging.info("Roland was indeed detached")
                    raise Exception("Exiting... Start me again!")

                roland = wait_for_roland()
                last_note_time = cur_time
        else:
            last_note_time = cur_time

            for read in reads:
                data, timestamp = read
                status, note, velocity, idk = data

                if status == 144:
                    handle_note_pressed(note, velocity)


