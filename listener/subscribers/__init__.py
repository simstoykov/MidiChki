from multiprocessing import Queue
import multiprocessing as mp

from subscribers.echo import Echo
from subscribers.uploader import Uploader
from subscribers.persistor import Persistor
from subscribers.chord_guesser import ChordGuesser

import logging

logging.basicConfig(level="INFO")


note_subscribers = [
    # Echo(),
    # Uploader(), 
    # Persistor(),
    ChordGuesser(),
]

def enable_subscribers():
    logging.info(f'Enabling {len(note_subscribers)} subscribers')
    subscriber_queues = []

    for obs in note_subscribers:
        q = mp.Queue()
        subscriber_queues.append(q)
        p = mp.Process(target=obs.start, args=(q,))
        p.start()
      
    
    return subscriber_queues
