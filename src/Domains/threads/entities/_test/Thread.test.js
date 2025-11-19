const Thread = require("../Thread")

describe("Thread entities", () => {
  it('should throw error when payload not containing correct property', () => {
    // Arrange
    const payload = {
      title: 'test title'
    }

    // Action & Assert
    expect(() => new Thread(payload)).toThrowError('THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload contain incorrect data type', () => {
    // Arrange
    const payload = {
      id: 'test-123',
      title: 123,
      body: 123,
      owner: 'user-123'
    }

    // Action & Assert
    expect(() => new Thread(payload)).toThrowError('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create Thread entities correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread content',
      owner: 'user-123'
    }

    // Action
    const thread = new Thread(payload)

    // Assert
    expect(thread).toBeInstanceOf(Thread);
    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title)
    expect(thread.body).toEqual(payload.body)
  })
})