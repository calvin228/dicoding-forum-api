const ThreadRepository = require("../ThreadRepository")

describe("ThreadRepository interface", () => {
  it('should throw error when invoke abstract error behavior', async () => { 
    // Arrange 
    const threadRepository = new ThreadRepository()

    // Action & Assert
    await expect(threadRepository.addThread({})).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(threadRepository.verifyThreadAvailability('id')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(threadRepository.getThreadById('id')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })
})