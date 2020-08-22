from abc import ABC, abstractmethod
import logging
from dataclasses import dataclass


logging.basicConfig(level=logging.INFO)


def random_between(start, to):
    return int(start + random() * (to - start))



class NotesObserver(ABC):
    def __init__(self, name):
        self.name = name
        logging.info(f'Observer {self.name} initialized')

    def start(self, q):
        logging.info(f'Observer {self.name} starting...')
        while True:
            notes = q.get(block=True)
            self.taram(notes)

    @abstractmethod
    def taram(self, notes):
        pass


@dataclass
class MidiNote():
    note: int,
    velocity: int

