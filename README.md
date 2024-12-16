# Getting Started

The following build is a demo build for the Initial Programming segment of our project. A lot of it does not represent what we think should be the final product of our application. With that said, the build was made with the purpose of demonstrating our idea, how it works, and showing it works as an application through pre-existing frameworks.

<div style="text-align: center;">
  <img src="https://i.imgur.com/JlA6lgq.png" width="500"/>
  <img src="https://i.imgur.com/QUBqs5A.png" width="445"/>
</div>

## Requirements

1. Verify that you have NodeJS installed on your desktop
2. Requires a firebase config file with valid keys, placed in the services folder with a name of "firebaseConfig.ts"
3. (Only applicable if you want to run the GraphQL Backend) Requires valid service account keys from Firebase, placed into the spoil-tracker-alpha directory

After cloning the repository to your computer, open the cloned folder in VS Code. Once you're in VS Code, open it's terminal and type in the command: 

```
cd spoil-tracker-alpha
./setup.sh
```

This downloads all of the required dependencies needed to run the application locally. Alternatively, if you do not want to / cannot run ./setup.sh, then paste the following onto a terminal that is open on the spoil-tracker-alpha directory:

```
cd spoil-tracker-alpha
npm install
npm install graphql graphql-scalars type-graphql
npm install reflect-metadata
npm install --save-dev typescript ts-node @types/node
npm install firebase-admin
npx tsc --init
npm install type-graphql graphql reflect-metadata class-validator apollo-server
npm install @apollo/client graphql
npm run codegen
```

To run the application, we use Expo:

```
npx expo start
```

To run GraphQL:
```
npx ts-node src/backendServerStart.ts
```

### Small note:
The amount of contributors on the repository does not accurately reflect who contributed to the project. To verify this, please look at the various branches stored in the repository; there were some hiccups during the process of making the application.

## Work Report

|Task #|Difficulty|Description|Percentage Done|%Done by Rex|%Done by Kevin|%Done by Tom|%Done by James|%Done by Cong|
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |:-: |
task | difficulty | description | percentage done | done by other | done by other1 | done by other2 | done by other3 | done by other4 |
copy paste the above row and replace the text ^
1 | 30 | Pre-alpha Working Pantry Interface | 90% | 100% | 0% | 0% | 0% | 0% |
1 | 30 | Pre-alpha Working Grocery List Interface | 90% | 100% | 0% | 0% | 0% | 0% |