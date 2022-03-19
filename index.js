const cheerio = require("cheerio");
const request = require("request-promise");
const express = require("express");
const bodyparser = require('body-parser')

const app = express();

app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index",{profile:''});
});
/* Create the base function to be ran */
const start = async (username) => {
  /* Here you replace the username with your actual instagram username that you want to check */
  const BASE_URL = `https://www.instagram.com/${username}/`;

  /* Send the request and get the html content */
  let response = await request(BASE_URL, {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "accept-encoding": "gzip, deflate, br",
    "accept-language":
      "en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3",
    "cache-control": "max-age=0",
    "upgrade-insecure-requests": "1",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
  });

  /* Initiate Cheerio with the response */
  let $ = cheerio.load(response);

  /* Get the proper script of the html page which contains the json */
  let script = $("script").eq(4).html();

  /* Traverse through the JSON of instagram response */
  let {
    entry_data: {
      ProfilePage: {
        [0]: {
          graphql: { user },
        },
      },
    },
  } = JSON.parse(/window\._sharedData = (.+);/g.exec(script)[1]);

  /* Output the data */
  return user;
};

app.post('/getinfo', (req, res) => {
  start(req.body.username).then((data) => {
      console.log(data);
      res.render('index',{profile:data})
  });  
})

app.listen(5000, () => {
  console.log("App is listening on port 5000");
});