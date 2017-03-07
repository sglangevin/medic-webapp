#!/bin/bash

ARGS='this.dependencies["kanso-gardener"] = null;'
ARGS+='this.dependencies_included = true;'

# Process append to the version string if pre-release
<<<<<<< HEAD
if [ "$TRAVIS_BRANCH" == "testing" ]; then
    ARGS+="this.version += \"-beta.$TRAVIS_BUILD_NUMBER\";"
fi

if [ "$TRAVIS_BRANCH" == "develop" ]; then
=======
if [ "$TRAVIS_BRANCH" == "master" ]; then
>>>>>>> medic/master
    ARGS+="this.version += \"-alpha.$TRAVIS_BUILD_NUMBER\";"
elif [[ "$TRAVIS_TAG" =~ ^[0-9]+\.[0-9]+\.[0-9]+-(rc|beta)\.[0-9]+$ ]]; then
    ARGS+="this.version = \"$TRAVIS_TAG\";"
fi

if [ "$TRAVIS_BRANCH" == "rc" ]; then
    ARGS+="this.version += \"-rc.$TRAVIS_BUILD_NUMBER\";"
fi

# Install npm deps in module directories and tweak kanso gardener related
# configs so it knows.
npm install -g json && \
cat kanso.json | json -o json-4 -e "$ARGS" > tmp.json && \
mv tmp.json kanso.json

exit 0;
