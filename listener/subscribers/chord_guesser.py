from subscribers.note_subscriber import NotesSubscriber

from utils.classes import MidiNote
from mingus.containers import NoteContainer
from mingus.core import chords

import logging

from typing import List

import copy
import music21
import random
import time

logging.basicConfig(level="INFO")


STATUS_LIFT = 128
STATUS_PRESS = 144
STATUS_PEDAL_PRESS = 176


SEQ = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']


def midi_to_str(midi_note):
    idx = int((midi_note - 21) % 12)
    octave = (midi_note - 12) // 12
    return SEQ[idx], SEQ[idx] + str(octave)

# TODO: Precompute values for all ~5-note possibilities (module ~3 octaves so ~36 noes) to gain speed


def get_raw_key(pressed):
    if len(pressed) == 0:
        return

    stream = music21.stream.Stream()

    for p in pressed:
        stream.append(music21.note.Note(p))

    logging.info("Really analyzing...")
    verdict = stream.analyze('key')
    return verdict


def sample(of, fraction=0.5):
    res = []
    for item in of:
        if random.random() <= fraction:
            res.append(item)

    return res


def get_resampled_key(pressed, resample=3, fraction=0.8):
    if len(pressed) <= 4:
        mx_key = get_raw_key(pressed)
        print(f"Chose key {mx_key} for {pressed} without resampling")
        return mx_key

    votes = {}
    for _ in range(resample):
        s = sample(pressed, fraction)
        key = get_raw_key(s)

        prev = votes.get(key, 0)
        votes[key] = prev+1

    mx_val = 0
    mx_key = None

    for key, val in votes.items():
        if val > mx_val:
            mx_val = val
            mx_key = key

    print(f"Chose key {mx_key} for {pressed}")
    return mx_key


class ChordGuesser(NotesSubscriber):
    def __init__(self):
        super().__init__('Chord guesser')
        self.pressed = []
        self.pedal_holds = False
        self.hold = []

        self.events = 0
        self.run_in_new_thread('periodic guesser', self.guess_chords)

    def taram(self, note: MidiNote):
        self.events += 1

        note_name, note_full = midi_to_str(note.note)

        if note.status == STATUS_PRESS:
            self.pressed.append(note_full)
        elif note.status == STATUS_LIFT:
            if not self.pedal_holds:
                self.pressed.remove(note_full)
            else:
                self.hold.append(note_full)
        elif note.status == STATUS_PEDAL_PRESS:
            if note.velocity > 0:
                self.pedal_holds = True
            else:
                for to_rem in self.hold:
                    self.pressed.remove(to_rem)
                self.hold = []
                self.pedal_holds = False

    def guess_chords(self):
        while True:
            time.sleep(0.3)

            if self.events == 0:
                continue
            else:
                self.events = 0

            logging.info("Guessing chords...")
            copied = copy.deepcopy(self.pressed)
            get_resampled_key(copied)
