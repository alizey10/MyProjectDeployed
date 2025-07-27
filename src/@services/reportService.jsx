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
   * @param {string} params.OrgCountry
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

  /**
   * Fetch sensor summary data using selected filters
   * @param {Object} params - Filter parameters
   * @param {string} params.OrganizationId
   * @param {string} params.OrgCountry
   * @param {string} params.BranchId
   * @param {number} params.FloorSectionId
   * @param {date} params.StartDate
   * @param {date} params.EndDate
   * @returns {Promise<any>}
   */
  async getSensorSummary(params) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, value === undefined ? '' : value])
    )
    return await this.Get('SensorSummary', cleanParams)
  }
}

export default new ReportServices()
