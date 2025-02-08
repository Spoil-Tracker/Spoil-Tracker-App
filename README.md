This is Cong's part of the project

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

## Work Report

|Task #|Difficulty|Description|Percentage Done|%Done by Rex|%Done by Kevin|%Done by Tom|%Done by James|%Done by Cong|
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |:-: |
1 | 30 | Pre-alpha Working Pantry Interface | 90% | 100% | 0% | 0% | 0% | 0% |
1 | 30 | Pre-alpha Working Grocery List Interface | 90% | 100% | 0% | 0% | 0% | 0% |
1 | 30 | Navigation| 70% | 50% | 50% | 0% | 0%| 0% |
2 | 30 | User Account | 65% | 0% | 15% | 40% | 0%| 45% |
2 | 30 | Registration | 90% | 10% | 90% | 0% | 0%| 0% |
3 | 30 | Login | 90% | 0% | 100% | 0% | 0%| 0% |
3 | 30 | Settings | 70% | 5% | 0% | 95% | 0% | 0% |
4 | 30 | Profiles | 90% | 10% | 5% | 0% | 0% | 85% |
5 | 45 | Schema | 100% | 0% | 0% | 0% | 100%| 0% |
5 | 15 | minimal db documents (1-2) | 100% | 0% | 0% | 0% | 100%| 0% |