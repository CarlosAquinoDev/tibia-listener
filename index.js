// index.js
const dgram = require("dgram");
const express = require("express");

const TARGET = "kiwi zar".toLowerCase();
let isOnline = false;

// 1) HTTP server
const app = express();
app.get("/status", (req, res) => {
  res.json({ name: TARGET, online: isOnline });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HTTP on port ${PORT}`));

// 2) UDP listener usando dgram
const socket = dgram.createSocket("udp4");

socket.on("message", (msg) => {
  // Primer byte: 0x0A = PlayerOn, 0x0B = PlayerOff
  const type = msg[0] === 0x0A ? "PlayerOn"
             : msg[0] === 0x0B ? "PlayerOff"
             : null;
  if (!type) return;

  // Resto del buffer: nombres separados por '\0'
  const names = msg.slice(1).toString("latin1").split("\0").filter(n => n);
  for (const name of names) {
    if (name.toLowerCase() === TARGET) {
      isOnline = (type === "PlayerOn");
      console.log(`${TARGET} → ${isOnline ? "ONLINE" : "OFFLINE"}`);
      break;
    }
  }
});

socket.bind(2070, () => {
  console.log("Listening Tibia UDP on port 2070");
});


