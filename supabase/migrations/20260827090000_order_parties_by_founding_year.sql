update sakfragan.parties as party
set display_order = chronological.display_order
from (
  values
    ('socialdemokraterna', 1),
    ('moderaterna', 2),
    ('centerpartiet', 3),
    ('vansterpartiet', 4),
    ('liberalerna', 5),
    ('kristdemokraterna', 6),
    ('miljopartiet', 7),
    ('sverigedemokraterna', 8),
    ('piratpartiet', 9),
    ('medborgerligsamling', 10),
    ('orebropartiet', 11),
    ('alternativforsverige', 12),
    ('nyans', 13),
    ('partietmod', 14)
) as chronological(id, display_order)
where party.id = chronological.id;
