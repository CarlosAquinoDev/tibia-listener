// index.js
const dgram = require("dgram");
const express = require("express");

const TARGET = "kiwi zard".toLowerCase();
let isOnline = false;

// 1) HTTP server
const app = express();
app.get("/status", (req, res) => {
  res.json({ name: TARGET, online: isOnline });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HTTP on port ${PORT}`));

// 2) UDP listener
const socket = dgram.createSocket("udp4");

// Según el protocolo de Tibia, cada paquete UDP es así:
// [0] byte tipo, luego strings con nombres. Vamos a hacer un parse MUY básico:
socket.on("message", (msg, rinfo) => {
  // msg es un Buffer; Tibia envía algo como: <0x0A><nombre1>\0<nombre2>\0…
  // El byte 0x0A suele indicar “PlayerOn”, 0x0B “PlayerOff”
  const type = msg[0] === 0x0A ? "PlayerOn" :
               msg[0] === 0x0B ? "PlayerOff" : null;
  if (!type) return;

  // El resto del buffer son nombres separados por \0
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
  console.log("Escuchando Tibia UDP datagrams en puerto 2070");
});


