// services/reportService.ts
import BaseService from './baseService'

class ReportServices extends BaseService {
  constructor() {
    super()
    this.controllerName = 'Report'
  }

  /**
   * Fetch entity counts using selected filters
   * @param {Object} params - Filter parameters
   * @param {string} params.organizationId
   * @param {string} params.country
   * @param {string} params.branchId
   * @param {number} params.floorSectionId
   * @returns {Promise<any>}
   */
  async getEntityCounts(params) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, value === undefined ? '' : value])
    )

    return await this.Get('EntityCounts', cleanParams)
  }
}

export default new ReportServices()
