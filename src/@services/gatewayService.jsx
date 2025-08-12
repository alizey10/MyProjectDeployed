import BaseService from './baseService'

class GatewayService extends BaseService {
  constructor() {
    super()
    this.controllerName = 'gateway'  
  }

  getGateways(page = 1, pageSize = 20, InActive = false) {
    return this.Get('', { Page: page, PageSize: pageSize, InActive })
  }

  deleteGateway(id) {
    return this.Delete(`${id}`)
  }

  updateGateway(id, payload) {
    return this.Put(`${id}`, payload)
  }

  createGateway(payload) {
    return this.Post('', payload)
  }

  activateGateway(id) {
    return this.Patch(`${id}`, { status: 'active' })  
  }
}

export default new GatewayService()
