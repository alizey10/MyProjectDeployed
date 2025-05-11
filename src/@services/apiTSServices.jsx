import axios from 'axios'
import https from 'https'

export default class OrganizationService {
  constructor() {
    this.controllerName = 'Organization'
    this.baseHeaders = {
      'Content-Type': 'application/json' // ✅ correct casing
    }
  }

  async assembleHeaders() {
    return { ...this.baseHeaders }
  }

  assembleEndpoint(action, data) {
    const apiAddress = 'https://95.111.245.195:5001/api/Organization/'
    let endpoint

    if (action) {
      endpoint = `${apiAddress}/${this.controllerName}/${action}`
    } else {
      endpoint = `${apiAddress}/${this.controllerName}`
    }

    if (data) {
      const query = Object.entries(data)
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
      endpoint = `${endpoint}?${query}`
    }

    return endpoint
  }

  GetToken() {
    // Optional: implement if you're using cancel tokens
    return axios.CancelToken.source()
  }

  async Put(action, body) {
    const headers = await this.assembleHeaders()

    try {
      //   const cancelToken = this.GetToken()
      console.log('action', action, 'body', body)
      const response = await axios.put(this.assembleEndpoint(action), body, {
        headers,
        // cancelToken: cancelToken.token,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }) // only for development
      })
      console.log(response)

      return response.data
    } catch (e) {
      console.error('PUT error:', e)
      return null
    }
  }

  // Specific method to call for updating organization
  async updateOrganization(id, payload) {
    return await this.Put(id.toString(), payload)
  }
}
