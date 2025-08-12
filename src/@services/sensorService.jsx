import BaseService from './baseService'
import { APIStatusCode } from '@/utils/statusCodes'

class SensorService extends BaseService {
  constructor() {
    super()
    this.controllerName = 'Sensor'
  }

  async getSensors(page = 1, pageSize = 20, InActive = false) {
    return await this.Get('', { Page: page, PageSize: pageSize, InActive })
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
async activateSensor(sensorId) {
  try {
    console.log(`PATCH request to: ${this.controllerName}/${sensorId}`)
    const response = await this.Patch(`${sensorId}`, { status: 'active' })

    console.log('Sensor activation response:', response)

   
    const statusCode = response?.data?.statusCode

    if (
      statusCode === APIStatusCode.Created ||
      statusCode === APIStatusCode.Ok ||
      statusCode === APIStatusCode.NoContent
    ) {
      return {
        success: true,
        message: response?.data?.message || 'Successfully Activated'
      }
    } else {
      return {
        success: false,
        message: response?.data?.message || ''
      }
    }
  } catch (error) {
    console.error('Sensor activation error:', error)
    return {
      success: false,
      message: error?.response?.data?.message || ''
    }
  }
}

}

export default new SensorService()
