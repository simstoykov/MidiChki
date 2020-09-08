from abc import ABC, abstractmethod
import logging


logging.basicConfig(level=logging.INFO)

class NotesSubscriber(ABC):
    def __init__(self, name):
        self.name = name
        logging.info(f'Subscriber {self.name} initialized')

    def start(self, q):
        """Entry point for subscriber"""
        logging.info(f'Subscriber {self.name} starting...')
        while True:
            notes = q.get(block=True)
            self.taram(notes)

    @abstractmethod
    def taram(self, notes):
        pass

