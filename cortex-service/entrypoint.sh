#!/bin/bash
set -e

INTERVAL=1
TIMEOUT=60

# Wait for qdrant to be responsive
echo "Waiting for qdrant to start..."
current=0

while ! nc -z $QDRANT_HOST 6333; do
    sleep $INTERVAL
    current=$((current + INTERVAL))
    if [ $current -eq $TIMEOUT ]; then
        echo "Timeout: qdrant did not start within $TIMEOUT seconds"
        exit 1
    fi
done
echo "qdrant has started."

# Start cortex-ai-service in the background
uvicorn src.__main__:app --host 0.0.0.0 --port $cortex_AI_SERVICE_PORT --loop uvloop --http httptools &

if [[ -n "$SHOULD_FORCE_DEPLOY" ]]; then

    # Wait for the server to be responsive
    echo "Waiting for cortex-ai-service to start..."
    current=0

    while ! nc -z localhost $cortex_AI_SERVICE_PORT; do
        sleep $INTERVAL
        current=$((current + INTERVAL))
        if [ $current -eq $TIMEOUT ]; then
            echo "Timeout: cortex-ai-service did not start within $TIMEOUT seconds"
            exit 1
        fi
    done
    echo "cortex-ai-service has started."

    # Wait for cortex-ui to be responsive
    echo "Waiting for cortex-ui to start..."
    current=0

    while ! nc -z cortex-ui $cortex_UI_PORT && ! nc -z host.docker.internal $cortex_UI_PORT; do
        sleep $INTERVAL
        current=$((current + INTERVAL))
        if [ $current -eq $TIMEOUT ]; then
            echo "Timeout: cortex-ui did not start within $TIMEOUT seconds"
            exit 1
        fi
    done
    echo "cortex-ui has started."

    echo "Forcing deployment..."
    python -m src.force_deploy
fi

# Bring cortex-ai-service to the foreground
wait
