require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dns = require("dns");
const urlparser = require("url");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose
  .connect("mongodb://127.0.0.1:27017/urlshortner", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB conection made"))
  .catch((err) => console.log(err.message));
//console.log(mongoose.connection.readyState);

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

let schema = new mongoose.Schema({ url: String, shorturl: Number });
let Url = mongoose.model("Url", schema);

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", (req, res) => {
  console.log(req.body);
  const bodyurl = req.body.url;
  const checkaddress = dns.lookup(
    urlparser.parse(bodyurl).hostname,
    (err, address) => {
      if (!address) {
        res.json({ error: "invalid url" });
      } else {
        let shortUrl = Math.floor(Math.random() * 100000);
        console.log(shortUrl);
        const url = new Url({ url: bodyurl, shorturl: shortUrl });
        const savedUrl = url.save();
        res.json(savedUrl);
      }
    }
  );
});

app.get("/api/shorturl/:shortUrl", async (req, res) => {
  let shortURL = req.params.shortUrl;
  const validUrl = await Url.findOne({ shorturl: shortURL });
  if (validUrl) {
    res.redirect(validUrl.url);
  } else {
    res.json({ error: "invalid url" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
