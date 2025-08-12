import BaseService from './baseService'
import { APIStatusCode } from '@/utils/statusCodes'

class BranchService extends BaseService {
  constructor() {
    super()
    this.controllerName = 'branch'
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

  async getBranchsByOrgId(page = 1, pageSize = 20, organizationId,  InActive = false) {
    return await this.Get('', {
      Page: page,
      PageSize: pageSize,
      OrganizationId: organizationId,
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

  async activateBranch(branchId) {
    try {

      const response = await this.Patch(`${branchId}`, { status: 'active' })

    

      if (
        response.status === APIStatusCode.Created ||
        response.status === APIStatusCode.Ok ||
        response.status === APIStatusCode.NoContent
      ) {
        return { success: true, message: 'Successfully Activated' }
      } else {
        return {
          success: false,
          message: response?.data?.message || 'Branch activation failed on server'
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

export default new BranchService()
