import axios from 'axios'

export default class BaseService {
  controllerName = 'ping'
  baseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-type': 'Application/json'
  }
  baseHeadersFile = {
    'content-type': 'multipart/form-data'
  }
  timeout

  constructor() {
    this.timeout = 60000
    axios.defaults.timeout = this.timeout
  }

  async Get(action, body) {
    const headers = await this.assembleHeaders()

    try {
      const response = await axios.get(this.assembleEndpoint(action, body), {
        headers: { ...headers }
      })

      return response
    } catch (e) {
      return e
    }
  }

  async Post(action, body) {
    const headers = await this.assembleHeaders()

    try {
      const response = await axios.post(this.assembleEndpoint(action), body, {
        headers: { ...headers }
      })

      return response
    } catch (e) {
      return e
    }
  }

  async Patch(action, body) {
    const headers = await this.assembleHeaders()

    try {
      const response = await axios.patch(this.assembleEndpoint(action), body, {
        headers: { ...headers }
      })

      return response
    } catch (e) {
      return e
    }
  }

  async Put(action, body) {
    const headers = await this.assembleHeaders()

    try {
      const response = await axios.put(this.assembleEndpoint(action), body, {
        headers: { ...headers }
      })

      return response
    } catch (e) {
      return e
    }
  }

  async Delete(action) {
    const headers = await this.assembleHeaders()

    try {
      const response = await axios.delete(this.assembleEndpoint(action), {
        headers: { ...headers }
      })

      return response
    } catch (e) {
      return e
    }
  }

  assembleEndpoint(action, data) {
    const apiAddress = process.env.NEXT_PUBLIC_HEALTH_AND_SAFETY_API_ADDRESS
    let endpoint

    if (action) endpoint = `${apiAddress}/${this.controllerName}/${action}`
    else endpoint = `${apiAddress}/${this.controllerName}`

    if (data) {
      let query = ''

      Object.keys(data).forEach(k => {
        query = `${query}${k}=${data[k]}&`
      })

      endpoint = `${endpoint}?${query}`
    }

    return endpoint
  }

  async assembleHeaders() {
    return { ...this.baseHeaders }
  }
}
