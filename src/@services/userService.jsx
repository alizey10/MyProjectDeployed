import BaseService from './baseService'

class UserService extends BaseService {
  constructor() {
    super()
    this.controllerName = 'User'
  }

  getUsers(page = 1, pageSize = 20) {
    return this.Get('', { Page: page, PageSize: pageSize })
  }

  createUser(payload) {
    return this.Post('', payload)
  }

}

export default new UserService()
