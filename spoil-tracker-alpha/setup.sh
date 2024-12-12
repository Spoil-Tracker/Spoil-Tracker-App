#!/bin/bash

echo "Installing dependencies..."

npm install
npm install graphql graphql-scalars type-graphql
npm install reflect-metadata
npm install firebase
npm install @react-native-picker/picker
npm install uuid
npm install lodash.debounce

npx expo start

echo "Dependencies installed successfully!"