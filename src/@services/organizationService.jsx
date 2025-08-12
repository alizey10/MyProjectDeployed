import BaseService from './baseService'
import { APIStatusCode } from '@/utils/statusCodes'

class OrganizationService extends BaseService {
  constructor() {
    super()
    this.controllerName = 'organization'
  }

  async getOrganizations(page = 1, pageSize = 20, InActive = false) {
    return await this.Get('', { Page: page, PageSize: pageSize, InActive })
  }

  async deleteOrganization(organizationId) {
    return await this.Delete(`${organizationId}`)
  }

  async updateOrganization(organizationId, payload) {
    return await this.Put(`${organizationId}`, payload)
  }

  async createOrganization(payload) {
    return await this.Post('', payload)
  }

  async activateOrganization(organizationId) {
    try {
      const response = await this.Patch(`${organizationId}`, { Status: 'active' })



      if (
        response.status === APIStatusCode.Created ||
        response.status === APIStatusCode.Ok ||
        response.status === APIStatusCode.NoContent
      ) {
        return { success: true, message: 'Successfully Activated' }
      } else {
        return {
          success: false,
          message: response?.data?.message || 'Activation failed on server'
        }
      }
    } catch (error) {
     
      return {
        success: false,
        message: error?.response?.data?.message || error.message || 'Network or server error'
      }
    }
  }
}

export default new OrganizationService()
