const express = require("express");
const {exec} = require("child_process");
const fs = require("fs");
const path = require("path");
const ffmpegPath = require("ffmpeg-static");

const app = express();
app.use(express.json());

// simple test route
app.get("/test", (req, res) => {
  exec(`"${ffmpegPath}" -version`, (err, stdout) => {
    if (err) return res.status(500).send(err.message);
    res.send(stdout);
  });
});

// example: merge audios + image
app.post("/create-video", async (req, res) => {
  const {image, audios} = req.body;

  // Example file paths (you can adapt later)
  const output = "output.mp4";

  const command = `
    "${ffmpegPath}" -loop 1 -i ${image} \
    ${audios.map((a) => `-i ${a}`).join(" ")} \
    -filter_complex "concat=n=${audios.length}:v=0:a=1[outa]" \
    -map 0:v -map "[outa]" \
    -c:v libx264 -tune stillimage -c:a aac -b:a 192k \
    -shortest ${output}
  `;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({error: stderr});
    }

    res.json({message: "Video created", file: output});
  });
});

app.listen(3000, () => {
  console.log("FFmpeg service running on port 3000");
});
