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
const db = process.env.DB_URI;
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
// app.post("/api/shorturl", (req, res) => {
//   const bodyurl = req.body.url;
//   const checkaddress = dns.lookup(
//     urlparser.parse(bodyurl).host,
//     async (err, address) => {
//       if (!address) {
//         res.json({ error: "invalid url" });
//       } else {
//         let shortUrl = Math.floor(Math.random() * 100000);
//         const url = new Url({ url: bodyurl, shorturl: shortUrl });
//         const data = url.save();
//         // res.json({ original_url: data.url, short_url: data.shorturl });
//         // console.log({ original_url: data.url, short_url: data.shorturl })
//         console.log(data);
//       }
//     }
//   );
// });

app.post("/api/shorturl", (req, res) => {
  const urlParser = req.body.url;
  const host = urlParser.replace(/http[s]?\:\/\//, "").replace(/\/(.+)?/, "");

  dns.lookup(host, async (err, addresses) => {
    try {
      if (err) throw err.message;

      if (!addresses) {
        res.json({ error_msg: "Invalid URl" });
      } else {
        let shortUrl = Math.floor(Math.random() * 100000);
        const newUrl = new Url({
          url: urlParser,
          shorturl: shortUrl,
        });
        const data = await newUrl.save();
        res.json({ original_url: data.url, short_url: data.shorturl });
      }
    } catch (err) {
      console.log(err.message);
    }
  });
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
