import BaseService from './baseService'

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
}

export default new OrganizationService()
