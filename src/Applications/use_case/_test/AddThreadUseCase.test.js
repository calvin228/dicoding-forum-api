const AuthenticationRepository = require("../../../Domains/authentications/AuthenticationRepository")
const Thread = require("../../../Domains/threads/entities/Thread")
const NewThread = require("../../../Domains/threads/entities/NewThread")
const ThreadRepository = require("../../../Domains/threads/ThreadRepository")
const AddThreadUseCase = require("../AddThreadUseCase")

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread use case action correctly', async () => {
    // Arrange
    const addThreadPayload = {
      title: 'Add Thread Use Case Title',
      body: 'Add Thread Use Case Body',
      owner: 'user-123'
    } 

    const mockThread = new Thread({
      id: 'thread-123',
      title: 'Add Thread Use Case Title',
      body: 'Add Thread Use Case Body',
      owner: 'user-123'
    })

    const mockThreadRepository = new ThreadRepository()
    
    mockThreadRepository.addThread = jest.fn().mockImplementation(() => Promise.resolve(mockThread))

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository
    });

    // Action
    const createdThread = await addThreadUseCase.execute(addThreadPayload)

    // Assert
    expect(createdThread).toStrictEqual(new Thread({
      id: 'thread-123',
      title: 'Add Thread Use Case Title',
      body: 'Add Thread Use Case Body',
      owner: 'user-123'
    }));
    expect(mockThreadRepository.addThread).toBeCalledWith(new NewThread({
      title: 'Add Thread Use Case Title',
      body: 'Add Thread Use Case Body',
      owner: 'user-123'
    }))
  })
})