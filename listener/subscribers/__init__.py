from multiprocessing import Queue
import multiprocessing as mp

from subscribers.echo import Echo
from subscribers.uploader import Uploader
from subscribers.persistor import Persistor

note_subscribers = [
    # Echo(),
    Uploader(), 
    # Persistor(),
]

def enable_subscribers():
    subscriber_queues = []

    for obs in note_subscribers:
        q = mp.Queue()
        subscriber_queues.append(q)
        p = mp.Process(target=obs.start, args=(q,))
        p.start()
      
    
    return subscriber_queues
