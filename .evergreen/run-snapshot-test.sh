#!/bin/bash

source "${PROJECT_DIRECTORY}/.evergreen/init-node-and-npm-env.sh"

set -o errexit  # Exit the script with error if any of the commands fail
set -o xtrace  # For debuggability, no external credentials are used here

rm -rf "${PROJECT_DIRECTORY}/dist"
npm install --no-save @aws-sdk/credential-providers aws4
npm exec --yes --package=webpack-cli@5.x -- webpack-cli --config "${PROJECT_DIRECTORY}/test/webpack.snapshot.config.js"

node --trace-warnings --snapshot-blob "${PROJECT_DIRECTORY}/snapshot.blob" --build-snapshot "${PROJECT_DIRECTORY}/dist/main.js"
npm exec --yes mongodb-runner -- exec -t standalone -- node --snapshot-blob "${PROJECT_DIRECTORY}/snapshot.blob"
