import BaseService from './baseService'
import { APIStatusCode } from '@/utils/statusCodes'

class GatewayService extends BaseService {
  constructor() {
    super()
    this.controllerName = 'Gateway'  
  }

  async getGateways(page = 1, pageSize = 20, InActive = false) {
    return await this.Get('', { Page: page, PageSize: pageSize, InActive })
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

async activateGateway(gatewayId) {
  try {
   
    const response = await this.Patch(`${gatewayId}`, { status: 'active' })


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


   
    return {
      success: false,
      message: error?.response?.data?.message || ''
    }
  }
}

}

export default new GatewayService()
