from subscribers.note_subscriber import NotesSubscriber
from time import time

from utils.classes import MidiNote, Param


SAVE_PATH_PARAM = Param("s", "save_path")
PARAMS = [SAVE_PATH_PARAM]


class Persistor(NotesSubscriber):
    def __init__(self):
        super().__init__('Persistor', PARAMS)

    def taram(self, note):
      sval = read_to_string(note, time())
      save_path = self.get_parameter(SAVE_PATH_PARAM)

      persist_stuff(sval, save_path)


def read_to_string(note: MidiNote, cur_time):
    return f"{note.status},{note.note},{note.velocity},{note.delay}"


def persist_stuff(strval, write_path):
    with open(write_path, 'a+') as the_file:
        the_file.write(strval + "\n")
