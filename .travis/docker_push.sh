#!/bin/bash

if [ "$TRAVIS_BRANCH" == "master" ]; then
    DOCKER_TAG="latest"
elif [ "$TRAVIS_BRANCH" == "development" ]; then
    DOCKER_TAG="dev"
elif [ "$TRAVIS_BRANCH" == "travis" ]; then
    DOCKER_TAG="test"
fi

if [ -n "$DOCKER_TAG" ]; then
    echo "Deploying branch $TRAVIS_BRANCH with tag $DOCKER_TAG"
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
    docker tag "$DOCKER_REPO" "$DOCKER_REPO:$DOCKER_TAG"
    docker push "$DOCKER_REPO:$DOCKER_TAG"
fi