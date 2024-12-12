# Getting Started

After cloning the repository to your computer, open the cloned folder in VS Code. Once you're in VS Code, open it's terminal and type in the command: `cd spoil-tracker-alpha`

Once this has been completed, you’ll need to install the dependencies needed for the program to function correctly. With the terminal still open, type: `npm install`

Next, in order for the backend to work, the next command you’ll need to type is: `npm install graphql graphql-scalars type-graphql` then after that’s done: `npm install reflect-metadata` 

In order to test if the project is up and running on your machine, make sure you're still in the `spoil-tracker-alpha` folder in the terminal and type: `npx expo start` 
which will show you a QR code along with with a few options to open the application.

Press w to open the web version of the app. You should see a white page that says `Edit app/index.tsx to edit this screen.` If you see this message, you’re all set!

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

## Important
#### **PLEASE PUSH CHANGES ONLY INTO YOUR OWN BRANCH. DO NOT PUSH ANYTHING TO THE MAIN BRANCH UNLESS WE’VE ALL APPROVED IT!!**
