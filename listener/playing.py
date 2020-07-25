#!venv37/bin/python
import logging
import time
import explorerhat as eh
import pygame.midi
import argparse

from random import random
from concurrent.futures import ThreadPoolExecutor
from requests_futures.sessions import FuturesSession

from multiprocessing import Queue
import multiprocessing as mp

from simple_lights import SimpleLights

session = FuturesSession(executor=ThreadPoolExecutor(max_workers=3))
logging.basicConfig(level=logging.INFO)

note_observers = [SimpleLights()]
observer_queues = [] # Is initialised in __main__

def random_between(start, to):
    return int(start + random() * (to - start))


def find_piano_id(device_name):
    pygame.midi.quit()
    pygame.midi.init()

    device_cnt = pygame.midi.get_count()
    logging.info(f"{device_cnt} USB devices connected...")

    for i in range(device_cnt):
        info = pygame.midi.get_device_info(i)

        name = str(info[1])
        is_input = info[2]

        logging.info(f"Checking {name}, is_input={is_input}...")
        if is_input and device_name in name:
            print(f"Found it on id {i}!")
            return i

    logging.warning("Couldn't find piano...")
    raise FileNotFoundError("Couldn't find piano...")


def wait_for_piano(device_name):
    while True:
        try:
            piano_id = find_piano_id(device_name)
            break
        except FileNotFoundError as e:
            logging.info("Retrying...")
            time.sleep(1)

    return pygame.midi.Input(piano_id)


def read_to_string(read, cur_time):
    return f"{read[0][0]},{read[0][1]},{read[0][2]},{read[0][3]},{read[1]},{cur_time}"


# write_path = "/media/pi/SS Backup/midichki/simefile.txt"
write_path = "/home/pi/Developing/MidiChki/dontgitit/simefile.txt" # TODO: Make a cli argument
def persist_stuff(strval):
    with open(write_path, 'a+') as the_file:
        the_file.write(strval + "\n")


# upload_url = "https://mighty-island-21925.herokuapp.com/postNotes"
# upload_url = "http://192.168.0.151:8080/postNotes"

UPLOAD_ENDPOINT = 'postNotes'
upload_dest = None # Should be set on initialization
def upload_stuff(reads):
    upload_url = f'{upload_dest}/{UPLOAD_ENDPOINT}'

    logging.info(f"Uploading {len(reads)} values to {upload_url}")
    logging.info(reads)
    session.post(upload_url, json=reads)


def midi_events(reads, cur_time):
    to_upload = []

    for read in reads:
        data, timestamp = read
        status, note, velocity, idk = data

        if status == 144:
            handle_note_pressed(note, velocity)

        if status != 248: # This is a midi clock which we dislike
            to_upload.append(read[0] + [read[1], cur_time])

            strval = read_to_string(read, cur_time)
            persist_stuff(strval)

            for q in observer_queues:
                q.put(read[0] + [read[1], cur_time])
    if len(to_upload) > 0:
        upload_stuff(to_upload)



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

    parser = argparse.ArgumentParser(description='Stream Midichki to the server')
    parser.add_argument('-p', '--piano', required=True)
    parser.add_argument('-u', '--upload', required=True)
    args = parser.parse_args()

    device_name = args.piano
    upload_dest = args.upload

    piano = wait_for_piano(device_name)

    for obs in note_observers:
        q = mp.Queue()
        observer_queues.append(q)
        p = mp.Process(target=obs.start, args=(q,))
        p.start()

    logging.info("Indefinitely listening for notes...")
    last_note_time = time.time()
    while True:
        reads = piano.read(100)
        time.sleep(0.05) # in seconds
        logging.info(f"Read {len(reads)} stuff")

        cur_time = time.time()

        if len(reads) == 0:
            elapsed = cur_time - last_note_time
            if elapsed > 5:
                try:
                    piano.close()
                except Exception:
                    logging.info("piano was indeed detached")
                    raise Exception("Exiting... Start me again!")

                piano = wait_for_piano()
                last_note_time = cur_time
        else:
            last_note_time = cur_time
            midi_events(reads, cur_time)

