import BaseService from './baseService'

class GatewayService extends BaseService {
  constructor() {
    super()
    this.controllerName = 'gateway'
  }

  async getGateways(page = 1, pageSize = 20) {
    return await this.Get('', { Page: page, PageSize: pageSize })
  }

  async getGatewayByBranchId(page = 0, pageSize = 0, branchId) {
    return await this.Get('', { Page: page, PageSize: pageSize, branchId: branchId })
  }

  async deleteGateway(gatewayId) {
    return await this.Delete(`${gatewayId}`)
  }

  async updateGateway(gatewayId, payload) {
    return await this.Put(`${gatewayId}`, payload)
  }

  async createGateway(payload) {
    return await this.Post('', payload)
  }
}

export default new GatewayService()
