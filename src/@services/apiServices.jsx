// services/organizationService.js
import axios from 'axios'
import https from 'https'

const BASE_URL = 'https://95.111.245.195:5001/api/Organization'

class OrganizationService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }) // For local/self-signed certs
    })
  }

  async getOrganizations(page = 1, pageSize = 20) {
    try {
      const response = await this.axiosInstance.get('', {
        params: {
          Page: page,
          PageSize: pageSize
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching organizations:', error.message)
      return null
    }
  }

  async deleteOrganization(organizationId) {
    try {
      const response = await this.axiosInstance.delete(`/${organizationId}`)
      return response.status === 204
    } catch (error) {
      console.error(`Failed to delete organization ${organizationId}:`, error.message)
      return false
    }
  }

  async updateOrganization(organizationId, payload) {
    try {
      const response = await this.axiosInstance.put(`/${organizationId}`, payload)
      return response.status === 200 ? response.data : null
    } catch (error) {
      console.error(`Failed to update organization ${organizationId}:`, error.message)
      return null
    }
  }

  async createOrganization(payload) {
    try {
      const response = await this.axiosInstance.post('', payload)
      return response.status === 201 ? response.data : null
    } catch (error) {
      console.error('Failed to create organization:', error.message)
      return null
    }
  }
}

export default new OrganizationService()
