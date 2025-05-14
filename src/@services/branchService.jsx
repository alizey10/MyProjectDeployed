import BaseService from './baseService'

class BranchService extends BaseService {
  constructor() {
    super()
    this.controllerName = 'Branch'
  }

  async getBranchs(page = 1, pageSize = 20) {
    return await this.Get('', { Page: page, PageSize: pageSize })
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
