# demo for firebase connections

## how to run

1. verify that you have nodejs installed on your computer
2. create a `.env` file in the firebasedemo directory (no, not src, not public, but firebasedemo)
2. go to the firebase  console, select our app, and retrieve the api keys from there
2. in the `.env` file, write down the api keys with the same env variable names as seen in the `firebase.ts` file in the app's src file
2. open up a terminal, change directory to the firebasedemo, and run `npm run dev` to run a local copy of the app

yes, i know this is in vite + react but this is just for the demo and nothing more

i dont think you need to do this, but in case something goes wrong, try reinstalling some dependencies on the app dir: 
`npm install` and `npm install firebase`

i made sure to have .gitignore not push .env files, but in case you opt for another way to provide keys and you push something for some reason... ***DO NOT PUSH OUR API KEYS ONTO THE REPOSITORY*** 

i trust you all know what you are doing

