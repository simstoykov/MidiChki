from multiprocessing import Queue
import multiprocessing as mp

from subscribers.echo import Echo
from subscribers.uploader import Uploader


def enable_subscribers():
    note_subscribers = [Echo(), Uploader()]
    subscriber_queues = [] # Is initialised in __main__

    for obs in note_subscribers:
        q = mp.Queue()
        subscriber_queues.append(q)
        p = mp.Process(target=obs.start, args=(q,))
        p.start()
      
    
    return subscriber_queues
