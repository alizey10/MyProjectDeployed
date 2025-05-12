import BaseService from './baseService'

class SensorService extends BaseService {
  constructor() {
    super()
    this.controllerName = 'sensor'
  }

  async getSensors(page = 1, pageSize = 20) {
    return await this.Get('', { Page: page, PageSize: pageSize })
  }

  async deleteSensor(sensorId) {
    return await this.Delete(`${sensorId}`)
  }

  async updateSensor(sensorId, payload) {
    return await this.Put(`${sensorId}`, payload)
  }

  async createSensor(payload) {
    return await this.Post('', payload)
  }
}

export default new SensorService()
