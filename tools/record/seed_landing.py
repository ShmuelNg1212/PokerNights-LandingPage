"""Synthetic fixture for the landing-page recordings. Run on a fresh temporary SQLite database only.

Host hana keeps the bank for the Friday table: six players (the names on the landing page).
  open  - an open set with a seat draw, ready to start (overture, then rebuys)
  night - a closed session with the landing page's results (settle-up and share)
"""
import datetime, json, uuid
from django.contrib.auth import get_user_model
from django.utils import timezone
from games import services as games, seats
from games.models import GameSession, Participant
from groups import services as groups
from ledger import services as ledger
from settlement import services as settlement

User = get_user_model()
hana = User.objects.create_user("hana", password="tablestakes-91")
host = groups.create_group(hana, "Friday table")
names = ["Miguel", "Carlo", "Trina", "Paolo", "Jerome", "Bea"]
roster = [groups.add_roster_player(host, n) for n in names]
u = uuid.uuid4
stakes = {"game_type": "nlh", "small_blind": 1000, "big_blind": 2000, "min_buy_in": 50000, "max_buy_in": 500000, "default_buy_in": 100000}

# A closed session: buy-ins and cash-outs from the landing page's Friday table.
t_closed = games.create_table(host, "Friday table", 8)
s = games.create_session(host, {"table_id": t_closed.pk, "game_date": timezone.localdate() - datetime.timedelta(days=1), "location": "Carlo's garage", **stakes})
games.transition(s.pk, host, "open")
for m in roster:
    games.add_participant(s.pk, host, m.pk)
games.transition(s.pk, host, "start", opening_buy_ins=False)
people = {p.member_id: p for p in Participant.objects.filter(session=s)}
figures = {"Miguel": ([100000], 220000), "Carlo": ([100000, 100000], 85000), "Trina": ([200000], 230000),
           "Paolo": ([100000], 65000), "Jerome": ([150000, 150000], 190000), "Bea": ([150000], 260000)}
for m in roster:
    for amount in figures[m.display_name][0]:
        ledger.record_buy_in(s.pk, host, people[m.pk].pk, amount, u())
games.transition(s.pk, host, "end")
for m in roster:
    ledger.record_cash_out(s.pk, host, people[m.pk].pk, figures[m.display_name][1], u())
settlement.finalize(s.pk, host)
settlement.close_night(s.night_id, host)

# An open set with a seat draw, ready to start, with opening buy-ins.
t_open = games.create_table(host, "Friday table · tonight", 8)
o = games.create_session(host, {"table_id": t_open.pk, "game_date": timezone.localdate(), "location": "Carlo's garage", **stakes})
games.transition(o.pk, host, "open")
games.add_participants(o.pk, host, [m.pk for m in roster], u())
games.draw_seats(o.pk, host, u())
open_people = {p.member.display_name: p.pk for p in Participant.objects.filter(session_id=o.pk).select_related("member")}

manifest = {"group": host.group_id, "open": o.pk, "night": s.night_id, "closed_set": s.pk, "people": open_people}
json.dump(manifest, open("/private/tmp/pn-landing-manifest.json", "w"))
print("LANDING", manifest)
