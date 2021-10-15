import axios from 'axios'

export default axios.create({
    baseURL: "http://directus.crowdedtra.in/",
})
