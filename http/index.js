const axios = require('axios');
const config = require('config');

const url_api = config.get('Server.URL.API');
const robo_api_url = config.get('Server.URL.ROBOKASSA_API_URL');

const $api = axios.create({
  withCredentials: true,
  baseURL: url_api
});


const $robo_api = axios.create({
  withCredentials: true,
  baseURL: robo_api_url
});

$api.interceptors.request.use((config) => { 
  config.headers.token = `${config.token}`;
  return config;
})

module.exports = {
  main_api: $api,
  robo_api: $robo_api
};