// import express from "express";
// import path from "path";

// let app = express();

// app.use(express.static("build"));

// app.get('/', function (req, res) {
//   res.sendFile(path.join(__dirname, '/index.html'));
// });

// app.get("*", (req, res) => {
//   res.redirect('/');
// })

// app.listen(3000, () => {
//   console.log("running");
// });


const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("build"));

// sendFile will go here
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port);