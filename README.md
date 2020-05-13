# rétro

## Description

This is a tool to make sprint retrospectives more interactive.

It provides a way for all team members to write retrospective points anonymously, and that you see updated in real time on the screens of all the participants.

## Where to Use

For now, it's available at <https://opal-retro.herokuapp.com>.

## Contribute

First of all, install dependencies using

```
npm install
```

or

```
yarn
```

Then, make sure that you install and launch a local instance of MongoDB. (On Mac, you can use the `mongod` command directly, but on Windows, you might need to navigate to the program directory and launch it manually.)

You will also need to create a collection named "retro".

Finally, launch the application using

```
npm run start
```

or

```
yarn run start
```