const yargs = require('yargs');
const axios = require('axios');
const fs = require('fs');

const argv = yargs
  .options({
    a: {
      alias: 'address',
      describe: 'Address to fetch weather for',
      string: true
    },
    d: {
      alias: 'default',
      describe: 'Sets given address to default',
      boolean: true
    }
  })
  .help().alias('help', 'h')
  .argv;

var api_key_geocode = "";
var api_key_darksky = "";
var address = "";

if (argv.a) {
  address = argv.a;
} else {
  try {
    address = JSON.parse(fs.readFileSync("default.json"));
  } catch (err) {
    throw new Error("File not found");
  }
}

if (argv.d) {
  fs.writeFileSync("default.json", JSON.stringify(address));
}

var encodedAddress = encodeURIComponent(argv.address);
var geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${api_key_geocode}`;

axios.get(geocodeUrl).then((response) => {

  if (response.data.status === "ZERO_RESULTS") {
    throw new Error("Unable to find the address");
  }

  var lat = response.data.results[0].geometry.location.lat;
  var lng = response.data.results[0].geometry.location.lng;
  var weatherUrl = `https://api.darksky.net/forecast/${api_key_darksky}/${lat},${lng}`;
  return axios.get(weatherUrl);

}).then((response) => {

  var temp = response.data.currently.temperature;
  var feelsLikeTemp = response.data.currently.apparentTemperature;
  var summary = response.data.currently.summary;
  console.log(`${summary} - It is currently ${temp}. But it feels like ${feelsLikeTemp}.`)

}).catch((err) => {

  if (err.code === 'ENOTFOUND') {
    console.log("Unable to connect to API servers");
  } else {
    console.log(err.message);
  }

});
