from subscribers.note_subscriber import NotesSubscriber


class Echo(NotesSubscriber):
    def __init__(self):
        super().__init__('Echo')

    def taram(self, notes):
        print("TARAM TARAM: ", notes)
