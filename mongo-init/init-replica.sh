#!/bin/bash
# Start MongoDB in the background with replica set mode
mongod --replSet rs0 --bind_ip_all &
# Wait for MongoDB to start up
sleep 5
# Initialize the replica set
mongo --eval "rs.initiate()"
# Keep the container running by waiting on mongod
wait
