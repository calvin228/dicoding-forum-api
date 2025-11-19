const NewComment = require("../NewComment")

describe('NewComment entities', () => {
  it('should throw error when payload not containing correct property', () => {
    // Arrange
    const payload = {
      content: 123
    }

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload contain incorrect data type', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      content: 123,
      userId: 'user-123'
    }

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create NewComment entities correctly', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      content: 'comment',
      userId: 'user-123'
    }

    // Action
    const comment = new NewComment(payload)

    // Assert
    expect(comment).toBeInstanceOf(NewComment);
    expect(comment.threadId).toEqual(payload.threadId)
    expect(comment.content).toEqual(payload.content)
    expect(comment.userId).toEqual(payload.userId)
  })
})