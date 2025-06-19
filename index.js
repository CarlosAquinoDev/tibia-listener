const TibiaDatagram = require("tibia-datagram");
const express = require("express");

const TARGET = "kiwi zar".toLowerCase();
let isOnline = false;

const app = express();

// UDP listener
const dg = new TibiaDatagram({ port: 2070 });
dg.on("message", ({ type, name }) => {
  if (name.toLowerCase() === TARGET) {
    isOnline = (type === "PlayerOn");
    console.log(`${TARGET} isOnline =`, isOnline);
  }
});
dg.listen(() => console.log("Listening UDP on port 2070"));

// HTTP endpoint
app.get("/status", (req, res) => {
  res.json({ name: TARGET, online: isOnline });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HTTP server on port ${PORT}`));
