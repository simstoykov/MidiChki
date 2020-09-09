from abc import ABC, abstractmethod
import logging

from typing import List
from utils.classes import Param

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

        logging.info(f'Subscriber {self.name} initialized')

    def start(self, q):
        """Entry point for subscriber"""
        logging.info(f'Subscriber {self.name} starting...')
        while True:
            notes = q.get(block=True)
            self.taram(notes)

    def get_parameter(self, param: Param):
        return params_map[param.tag]

    @abstractmethod
    def taram(self, notes):
        pass
