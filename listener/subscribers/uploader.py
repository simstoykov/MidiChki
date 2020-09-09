from subscribers.note_subscriber import NotesSubscriber

from requests_futures.sessions import FuturesSession
from concurrent.futures import ThreadPoolExecutor

from utils.classes import MidiNote, Param

from time import time, sleep

import logging
import threading

logging.basicConfig(level="INFO")


UPLOAD_DEST_PARAM = Param('u', 'upload')
PARAMS = [UPLOAD_DEST_PARAM]

TO_SLEEP = 0.3


session = FuturesSession(executor=ThreadPoolExecutor(max_workers=3))

def upload_stuff(reads, upload_url):
    
    if len(reads) == 0:
        return
    
    logging.info(f"Uploading {len(reads)} values to {upload_url}")
    session.post(upload_url, json=reads)


def note_to_weird(note: MidiNote):
    return note.status, note.note, note.velocity, 0, note.delay, time()


class Uploader(NotesSubscriber):
    def __init__(self):
        super().__init__('Uploader', PARAMS)
        
        self.red_queue = []
        self.green_queue = []
        self.queues = [self.red_queue, self.green_queue]
        self.active_index = 0

        self.t = threading.Thread(name='Daemon uploader', target=self._aggregator_upload)
        self.t.setDaemon(True)
        self.thread_started = False


    def taram(self, note: MidiNote):
        if not self.thread_started:
            self.t.start()
            self.thread_started = True
        
        read = note_to_weird(note)
        to_upload = self.queues[self.active_index]
        to_upload.append(read)
    
    def _switch(self):
        prev = self.active_index
        self.active_index = 0 if self.active_index else 1
        return prev
    
    def _aggregator_upload(self):
        logging.info("Aggregation uploader starting...")
        upload_url = self.get_parameter(UPLOAD_DEST_PARAM)

        while True:
            inactive = self._switch()
            upload_stuff(self.queues[inactive], upload_url)
            self.queues[inactive] = []

            sleep(TO_SLEEP)



# Heroku endpoint: "https://mighty-island-21925.herokuapp.com/postNotes"
# Local endpoint: "http://192.168.0.151:8080/postNotes"
