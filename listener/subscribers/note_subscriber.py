from abc import ABC, abstractmethod
import logging

from typing import List
from utils.classes import Param
import threading

logging.basicConfig(level=logging.INFO)


all_params_needed = []
params_map = {}


def prepare_args(parser):
    for param in all_params_needed:
        parser.add_argument(f'-{param.tag}', f'--{param.long}', required=True)


def process_args(parser):
    args = vars(parser.parse_args())
    for param in all_params_needed:
        params_map[param.tag] = args[param.long]


class NotesSubscriber(ABC):
    def __init__(self, name, params: List[Param] = None):
        global all_params_needed

        self.name = name

        if params is not None:
            all_params_needed += params
        
        self.threads_started = False
        self.threads_list = []

        logging.info(f'Subscriber {self.name} initialized')

    def start(self, q):
        """Entry point for subscriber"""
        logging.info(f'Subscriber {self.name} starting...')
        while True:
            notes = q.get(block=True)
            self._note_arrived(notes)

    def get_parameter(self, param: Param):
        return params_map[param.tag]
    
    def run_in_new_thread(self, identifier, target, *args, **kwargs):
        to_run = lambda: target(*args, **kwargs)
        name = f'Subscriber {self.name}, thread {identifier}'

        t = threading.Thread(name=name, target=to_run)
        t.setDaemon(True)
        self.threads_list.append(t)

    def _note_arrived(self, notes):
        if not self.threads_started:
            for t in self.threads_list:
                t.start()
            self.threads_started = True
        
        self.taram(notes)

    @abstractmethod
    def taram(self, notes):
        pass
