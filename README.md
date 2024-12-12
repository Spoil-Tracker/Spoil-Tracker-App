**** NOTES ADDED BY JAMES TO RUN BACKEND ****
Some things may be redundant. 
All commands should be run in /spoil-tracker-alpha

//Installs npm, used to obtain other packages
npm install

//Obtains TypeScript and necessary build tools
npm install --save-dev typescript ts-node @types/node

//Obtains firestore and firebase admin
npm install firebase-admin

//Initializes Typescript
npx tsc --init

//Installs TypegraphQL and dependencies
//    type-graphql: For schema creation using TypeScript decorators.
//    graphql: The GraphQL runtime.
//    reflect-metadata: Required for TypeGraphQL to work with decorators.
//    class-validator: For validation of input types.
//    apollo-server: To create the GraphQL API server.
npm install type-graphql graphql reflect-metadata class-validator apollo-server

//Frontend install
npm install @apollo/client graphql


Start webapp
npx expo start

Start codegen
npm run codegen

Start Backend   (Requires serviceAccountKey.json)
npx ts-node src/backendServerStart.ts

**** END NOTES BY JAMES ****