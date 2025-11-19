const Comment = require("../Comment")

describe("Comment entities", () => {
  it('should throw error when payload not containing correct property', () => {
    // Arrange
    const payload = {
      content: 'test title'
    }

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload contain incorrect data type', () => {
    // Arrange
    const payload = {
      id: 'test-123',
      threadId: 123,
      content: 123,
      owner: 'user-123',
      date: new Date().toISOString()
    }

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create Comment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      threadId: 'thread-123',
      content: 'Unit Test Comment',
      owner: 'user-123',
      date: new Date().toISOString()
    }

    // Action
    const comment = new Comment(payload)

    // Assert
    expect(comment).toBeInstanceOf(Comment);
    expect(comment.threadId).toEqual(payload.threadId)
    expect(comment.content).toEqual(payload.content)
    expect(comment.owner).toEqual(payload.owner)
    expect(comment.date).toEqual(payload.date)
  })
})