#!/bin/zsh
# One take: fresh DB, seed, serve, record, stop.
set -e
setopt nullglob
R=${R:-/private/tmp/pn-landing-rec}; mkdir -p $R; cp "${0:A:h}"/seed_landing.py "${0:A:h}"/record.mjs $R/
cd ~/PokerNights
export DEBUG=True DATABASE_URL=sqlite:///$R/landing.sqlite3 PLAYWRIGHT_BROWSERS_PATH=/private/tmp/pn-browser-binaries
rm -f $R/landing.sqlite3*
.venv/bin/python manage.py migrate --noinput > /dev/null
.venv/bin/python manage.py shell < $R/seed_landing.py | tail -1
.venv/bin/python manage.py runserver 127.0.0.1:8765 --noreload > $R/server.log 2>&1 &
SRV=$!
trap "kill $SRV 2>/dev/null" EXIT
for i in {1..50}; do curl -sf -o /dev/null http://127.0.0.1:8765/accounts/login/ && break; sleep 0.2; done
rm -rf $R/raw
cd $R && node record.mjs $R/raw
