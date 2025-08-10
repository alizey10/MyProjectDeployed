import BaseService from './baseService'

class BranchService extends BaseService {
  constructor() {
    super()
    this.controllerName = 'Branch'
  }

  async getBranchsWithParams(params) {
    function buildQuery(params) {
      return Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
    }

    const queryString = buildQuery(params)
    return await this.Get(queryString ? `?${queryString}` : '')
  }


  async getBranchs(page = 1, pageSize = 20, InActive = false) {
    return await this.Get('', {
      Page: page,
      PageSize: pageSize,
      InActive
    })
  }

  async getBranchsByOrgId(page = 1, pageSize = 20, organizationId, branchId, InActive = false) {
    return await this.Get('', {
      Page: page,
      PageSize: pageSize,
      OrganizationId: organizationId,
      BranchId: branchId,
      InActive
    })
  }

 
  async getBranchsByOrgName(page = 1, pageSize = 20, organizationName, InActive = false) {
    return await this.Get('', {
      Page: page,
      PageSize: pageSize,
      OrganizationName: organizationName,
      InActive
    })
  }


  async deleteBranch(branchId) {
    return await this.Delete(`${branchId}`)
  }

  async updateBranch(branchId, payload) {
    return await this.Put(`${branchId}`, payload)
  }

  async createBranch(payload) {
    return await this.Post('', payload)
  }
}

export default new BranchService()
