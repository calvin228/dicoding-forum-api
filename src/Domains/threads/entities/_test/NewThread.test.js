const NewThread = require("../NewThread")

describe("NewThread entities", () => {
  it('should throw error when payload not containing correct property', () => {
    // Arrange
    const payload = {
      title: 'test title'
    }

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload contain incorrect data type', () => {
    // Arrange
    const payload = {
      title: 123,
      body: 123,
      owner: 123
    }

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create NewThread entities correctly', () => {
    // Arrange
    const payload = {
      title: 'Thread Title',
      body: 'Thread content',
      owner: 'user-123'
    }

    // Action
    const thread = new NewThread(payload)

    // Assert
    expect(thread).toBeInstanceOf(NewThread);
    expect(thread.title).toEqual(payload.title)
    expect(thread.body).toEqual(payload.body)
    expect(thread.owner).toEqual(payload.owner)
  })
})