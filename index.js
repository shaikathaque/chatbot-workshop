const app = require('express')();
const axios = require('axios');
const bodyParser = require('body-parser');
const morgan = require('morgan');

app.use(bodyParser.json());
app.use(morgan('tiny'));

const PORT = 8080;

const urls = {
  getWoeid: 'https://www.metaweather.com/api/location/search/?query=',
  getWeather: 'https://www.metaweather.com/api/location/',
};

const dialogflowResponse = {
  fulfillmentText: '',
};

app.post('/weather', (request, response) => {
  let cityName = request.body.queryResult.parameters['geo-city'];

  // where on earth id
  let woeid;

  // query metaweather api to get woe id for that city
  axios.get(urls.getWoeid + cityName)
    .then(res => {
      // use woeid to get temperature
      return woeid = res.data[0].woeid;
    })
    .then(woeid => axios.get(urls.getWeather + woeid))
    .then(res => {
      let temperature = res.data.consolidated_weather[0].the_temp;

      // convert to fahrenheit
      temperature = temperature * ((9/5)) + 32;

      // round to 2 decimal places
      temperature = Math.round(temperature * 100) / 100;

      dialogflowResponse.fulfillmentText = `The temperature for ${cityName} is ${temerature} degrees`;
      response.json(dialogflowResponse);
    })
    .catch(err => {
      console.log(err);
      let errorResponse = `Oops! The programmer made a mistake. Please try a different query!`;
      dialogflowResponse.fulfillmentText = errorResponse;
      response.json(dialogflowResponse);
    });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
