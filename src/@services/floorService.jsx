import BaseService from './baseService'

class FloorService extends BaseService {
  constructor() {
    super()
    this.controllerName = 'FloorSection'
  }

  async getFloor(page = 1, pageSize = 20) {
    return await this.Get('', { Page: page, PageSize: pageSize })
  }

  async createFloor(payload) {
    return await this.Post('', payload)
  }
}

export default new FloorService()
