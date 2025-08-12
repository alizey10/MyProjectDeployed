import BaseService from './baseService'
import { APIStatusCode } from '@/utils/statusCodes'

class OrganizationService extends BaseService {
  constructor() {
    super()
    this.controllerName = 'organization'
  }

  getOrganizations(page = 1, pageSize = 20, InActive = false) {
    return this.Get('', { Page: page, PageSize: pageSize, InActive })
  }

  deleteOrganization(id) {
    return this.Delete(`${id}`)
  }

  updateOrganization(id, payload) {
    return this.Put(`${id}`, payload)
  }

  createOrganization(payload) {
    return this.Post('', payload)
  }

  activateOrganization(id) {
    return this.Patch(`${id}`) 
  }
}

export default new OrganizationService()
