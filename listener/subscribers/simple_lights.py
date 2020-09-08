from subscribers.note_subscriber import NotesSubscriber


class SimpleLights(NotesSubscriber):
    def __init__(self):
        super().__init__('Simple Lights')

    def taram(self, notes):
        print("TARAM TARAM: Played", notes)
