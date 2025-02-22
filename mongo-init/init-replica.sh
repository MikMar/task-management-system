#!/bin/bash
set -e

# Start mongod in the background
mongod --replSet rs0 --bind_ip_all --fork --logpath /data/db/mongo.log

# Give MongoDB a few seconds to start
sleep 5

# Check if the replica set is already initialized
if ! mongo --eval "rs.status()" | grep -q '"ok" : 1'; then
  echo "Initializing replica set..."
  mongo --eval "rs.initiate({_id:'rs0', members:[{_id:0, host:'auth-db:27017'}]});"
else
  echo "Replica set already initialized"
fi

# Shut down the temporary mongod instance
mongod --shutdown

# Finally, start mongod normally (in foreground)
exec mongod --replSet rs0 --bind_ip_all
