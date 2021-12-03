#!/bin/bash
FILE=automate.lock

pscount=$(ps aux | grep auto.sh | wc -l)

while [ $pscount -eq 3 ]; do
  if [ -f "$FILE" ]; then
    # update changes
    git pull

    # restart services
    pkill -f 'node'

    # update deployment timestamp
    touch automate.log

    # clear lock
    rm $FILE
  fi
  sleep 3
done
