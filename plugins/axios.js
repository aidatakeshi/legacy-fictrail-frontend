import axios from 'axios'
const env = require('~/config.js');

export default axios.create({
    baseURL: env.API_BASE_URL,
})
