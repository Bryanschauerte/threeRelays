// add the folder to your pi, I use scp
// ex
// scp -r ./theFolderToCopyOver pi@<piIP>:SomeExisitingFolderOrNew

// ssh into the pi andddd
// install pigpio and dependancies
// -> sudo apt - get update
// -> sudo apt - get install pigpio
// npm install
// Run it. 
// -> sudo node index.js


const express = require("express");
const cors = require("cors");
const Gpio = require("pigpio").Gpio;
const app = express();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(cors());

// the three relays being assigned to gpio pins
const relayOne = new Gpio(21, { mode: Gpio.OUTPUT });
const relayTwo = new Gpio(20, { mode: Gpio.OUTPUT });
const relayThree = new Gpio(16, { mode: Gpio.OUTPUT });

// writes new levels, if present in the body and returns an object of read pins

const changeRelayState = changes => {
  if (changes && changes.relayOne) {
    relayOne.digitalWrite(parseInt(changes.relayOne, 10));
  }
  if (changes && changes.relayTwo) {
    relayTwo.digitalWrite(parseInt(changes.relayTwo, 10));
  }
  if (changes && changes.relayThree) {
    relayThree.digitalWrite(parseInt(changes.relayThree, 10));
  }
  return {
    relayOne: relayOne.digitalRead(),
    relayTwo: relayTwo.digitalRead(),
    relayThree: relayThree.digitalRead()
  };
};

// plain o' get request to http://<yourPiIP>:3000

app.get("/", (req, res) => {
  const state = changeRelayState();
  res.send(
    `State of the relays->
      relayOne: ${state.relayOne}
      relayTwo: ${state.relayTwo}
      relayThree: ${state.relayTwo}`
  );
  // sends a legable response back
});

app.post("/increasePoints", urlencodedParser, (req, res) => {
  const currentState = changeRelayState();
  const count =
    currentState.relayOne + currentState.relayTwo + currentState.relayThree;
  if (count >= 3) {
    // reset all the relays back to zero
    return res.send(
      changeRelayState({ relayOne: 0, relayThree: 0, relayTwo: 0 })
    );
  }
  if (count === 2) {
    return res.send(
      changeRelayState({ relayOne: 1, relayThree: 1, relayTwo: 1 })
    );
  }
  if (count === 1) {
    return res.send(
      changeRelayState({ relayOne: 1, relayThree: 0, relayTwo: 1 })
    );
  }
  if (count === 0) {
    return res.send(
      changeRelayState({ relayOne: 1, relayThree: 0, relayTwo: 0 })
    );
  }
});

// post request to http://<yourPiIp>:3000
// post body- example turn on relaythree and relayOne off... {relayOne: 0, relayThree: 1}

app.post("/", urlencodedParser, (req, res) => {
  let body = req.body;
  let relayStates = changeRelayState(body);

  res.send(
    `Relay state changed-> relayOne: ${relayStates.relayOne} relayTwo: ${
      relayStates.relayTwo
    } relayThree: ${relayStates.relayThree}`
  );
});

app.listen(3000, function() {
  console.log("Pi being served to http://somePiIp:3000/. ");
});
