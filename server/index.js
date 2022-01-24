/* eslint-disable strict */
/* eslint-disable no-console */
const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// generate 3 new keys
const key1 = ec.genKeyPair();
const key2 = ec.genKeyPair();
const key3 = ec.genKeyPair();

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

// store keys and balances in object
const balances = {};
balances[key1.getPublic().encode('hex')] = 100;
balances[key2.getPublic().encode('hex')] = 50;
balances[key3.getPublic().encode('hex')] = 75;

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount, msgHash, signature} = req.body;
  if (sender.verify(msgHash, signature)) {
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  // log balances
  console.log(balances);
  console.log(key1.getPrivate().toString(16));
});
