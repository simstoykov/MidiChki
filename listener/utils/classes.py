from dataclasses import dataclass


@dataclass
class MidiNote():
    note: int
    velocity: int
    status: int
    delay: int


@dataclass
class Param():
    tag: str
    long: str
