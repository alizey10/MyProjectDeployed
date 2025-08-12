import BaseService from './baseService'
import { APIStatusCode } from '@/utils/statusCodes'

class BranchService extends BaseService {
  constructor() {
    super()
    this.controllerName = 'branch'
  }

  getBranchs(page = 1, pageSize = 20, InActive = false) {
    return this.Get('', { Page: page, PageSize: pageSize, InActive })
  }

  getBranchsWithParams(params) {
 
    const queryString = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')

    return this.Get(queryString ? `?${queryString}` : '')
  }

  getBranchsByOrgId(page = 1, pageSize = 20, organizationId, InActive = false) {
    return this.Get('', { Page: page, PageSize: pageSize, OrganizationId: organizationId, InActive })
  }

  deleteBranch(branchId) {
    return this.Delete(`${branchId}`)
  }

  updateBranch(branchId, payload) {
    return this.Put(`${branchId}`, payload)
  }

  createBranch(payload) {
    return this.Post('', payload)
  }

  activateBranch(branchId) {
    return this.Patch(`${branchId}`) 
  }
}

export default new BranchService()
