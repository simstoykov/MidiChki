from utils import NotesObserver

class SimpleLights(NotesObserver):
    def __init__(self):
        super().__init__('Simple Lights')

    def taram(self, notes):
        print("TARAM TARAM: Played", notes)



