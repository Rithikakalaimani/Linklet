#!/bin/bash
# Script to kill process on port 5002

PORT=5002
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
    echo "No process found on port $PORT"
    exit 0
fi

echo "Found process $PID on port $PORT"
kill -9 $PID
echo "Process killed. You can now start the server."
