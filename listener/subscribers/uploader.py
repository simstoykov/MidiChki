from subscribers.note_subscriber import NotesSubscriber

from requests_futures.sessions import FuturesSession
from concurrent.futures import ThreadPoolExecutor

from utils.classes import MidiNote

from time import time

import logging
logging.basicConfig(level="INFO")


class Uploader(NotesSubscriber):
    def __init__(self):
        super().__init__('Echo')

    def taram(self, note: MidiNote):
        reads = [note_to_weird(note)]
        upload_stuff(reads)


def note_to_weird(note: MidiNote):
    return note.status, note.note, note.velocity, 0, note.delay, time()

UPLOAD_ENDPOINT = 'postNotes'  # TODO: Remove those
UPLOAD_DEST = 'https://mighty-island-21925.herokuapp.com'  # Should be set on initialization

session = FuturesSession(executor=ThreadPoolExecutor(max_workers=3))

def upload_stuff(reads):
    upload_url = f'{UPLOAD_DEST}/{UPLOAD_ENDPOINT}'

    logging.info(f"Uploading {len(reads)} values to {upload_url}")
    logging.info(reads)
    session.post(upload_url, json=reads)
