const NewThread = require("../../Domains/threads/entities/NewThread");

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository
  }
  
  async execute(useCasePayload) {
    const newThread = new NewThread(useCasePayload);
    return await this._threadRepository.addThread(newThread)
  }
}

module.exports = AddThreadUseCase