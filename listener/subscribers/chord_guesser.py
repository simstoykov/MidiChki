from subscribers.note_subscriber import NotesSubscriber

from utils.classes import MidiNote
from mingus.containers import NoteContainer
from mingus.core import chords

import logging

logging.basicConfig(level="INFO")


STATUS_LIFT = 128
STATUS_PRESS = 144


SEQ = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
def midi_to_str(midi_note):
    idx = int((midi_note - 21) % 12)
    return SEQ[idx]


class ChordGuesser(NotesSubscriber):
    def __init__(self):
        super().__init__('Chord guesser')
        self.note_container = NoteContainer()
        self.pressed = []


    def taram(self, note: MidiNote):
        note_name = midi_to_str(note.note)

        if note.status == STATUS_PRESS:
            self.note_container.add_note(note_name)
            self.pressed.append(note_name)
        else:
            self.note_container.remove_note(note_name)
            self.pressed.remove(note_name)

        cur = chords.determine(self.pressed)
        logging.info(f"Currently playing: {cur}")
