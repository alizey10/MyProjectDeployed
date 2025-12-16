import BaseService from './baseService'

class FormService extends BaseService {
  constructor() {
    super('DynamicForm')
  }

  getAllForms(page = 1, pageSize = 20) {
    return this.Get('', { Page: page, PageSize: pageSize })
  }

  getFormById(formId) {
    return this.Get(`${formId}`)
  }

  createForm(payload) {
    return this.Post('', payload)
  }

  updateForm(formId, payload) {
    return this.Put(`${formId}`, payload)
  }

  deleteForm(formId) {
    return this.Delete(`${formId}`)
  }

  submitForm(payload) {
    return this.Post('responses', payload)
  }

  getResponseById(responseId) {
    return this.Get(`responses/${responseId}`)
  }

  deleteResponse(responseId) {
    return this.Delete(`responses/${responseId}`)
  }

  getAllResponses(formId, page = 1, pageSize = 20) {
    return this.Get(`${formId}/responses`, { page, pageSize })
  }

  getMyResponses(page = 1, pageSize = 20) {
    return this.Get('my-responses', { page, pageSize })
  }
}

export default new FormService()
