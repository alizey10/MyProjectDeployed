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

getAllResponses(formId, page = 1, pageSize = 20, inActive = false) {
  return this.Get(`${formId}/responses`, {
    Page: page,
    PageSize: pageSize,
    InActive: inActive
  })
}
getAssignedUsersByFormId(formId) {
  return this.Get(`${formId}/assignments`)
}


  getMyResponses(page = 1, pageSize = 20) {
    return this.Get('my-responses', { page, pageSize })
  }
  updateResponse(responseId, payload) {
  return this.Put(`responses/${responseId}`, payload)
}
assignFormBulk(payload) {
  return this.Post('assign/bulk', payload)
}
getMyAssignments(page = 1, pageSize = 20, inActive = false) {
  return this.Get('my-assignments', {
    Page: page,
    PageSize: pageSize,
    InActive: inActive
  })
}
 getAssignmentById(assignmentId) {
    return this.Get(`assignments/${assignmentId}`);
  }
updateAssignmentStatus(assignmentId, payload) {
  return this.Patch(`assignments/${assignmentId}/status`, payload)
}

}

export default new FormService()
