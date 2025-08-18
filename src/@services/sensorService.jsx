import BaseService from './baseService'

class SensorService extends BaseService {
  constructor() {
    super()
    this.controllerName = 'Sensor'
  }

  getSensors(page = 1, pageSize = 20, InActive = false) {
    return this.Get('', { Page: page, PageSize: pageSize, InActive })
  }
  getSensorById(id) {
  return this.Get('', { sensorId: id })
}



  deleteSensor(sensorId) {
    return this.Delete(`${sensorId}`)
  }

  updateSensor(sensorId, payload) {
    return this.Put(`${sensorId}`, payload)
  }

  createSensor(payload) {
    return this.Post('', payload)
  }

  activateSensor(sensorId) {
    return this.Patch(`${sensorId}`)  
  }
}

export default new SensorService()
