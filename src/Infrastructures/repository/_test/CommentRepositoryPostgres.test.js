const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper")
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper")
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper")
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError")
const NotFoundError = require("../../../Commons/exceptions/NotFoundError")
const Comment = require("../../../Domains/comments/entities/Comment")
const NewComment = require("../../../Domains/comments/entities/NewComment")
const pool = require("../../database/postgres/pool")
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres")

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'unit_test_user',
      password: 'password',
      fullname: "Unit Test User"
    })
  })
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()  
  })

  describe('addComment function', () => { 
    it('should store the comment to db and return created comment', async () => {
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Test Each Thread',
        body: 'Test Each Thread Body',
        userId: 'user-123'
      })
      
      const newComment = new NewComment({
        threadId: 'thread-123',
        content: 'Comment',
        userId: 'user-123'
      })

      const fakeIdGenerator = () => '123'

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)
      
      // Action
      const result = await commentRepositoryPostgres.addComment(newComment)
      
      // Assert
      expect(result).toBeInstanceOf(Comment)
      const {date, ...resultWithoutDate} = result
      expect(resultWithoutDate).toStrictEqual({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'Comment',
        owner: 'user-123'
      })
      expect(date).toBeDefined()
      expect(new Date(date).toString()).not.toBe('Invalid Date')

      const addedComment = await CommentsTableTestHelper.findCommentById('comment-123')
      expect(addedComment).toHaveLength(1)
    })
  })

  describe('verifyCommentOwner function', () => {
    it('should throw error if commment is not owned by the user', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Test Thread To Verify Owner',
        body: 'Test Thread Body To Verify Owner',
        username: 'user-123'
      })
      await CommentsTableTestHelper.addComment({
        id: 'comment-xxx',
        threadId: 'thread-123',
        content: 'Comment To Verify Owner',
        userId: 'user-123',
      })

      const fakeIdGenerator = () => '123'
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-xxx', 'user-444')).rejects.toThrowError(AuthorizationError)
    })

    it('should not throw error if comment is owned by the user', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Test Thread To Verify Owner',
        body: 'Test Thread Body To Verify Owner',
        username: 'user-123'
      })
      await CommentsTableTestHelper.addComment({
        id: 'comment-xxx',
        threadId: 'thread-123',
        content: 'Comment To Verify Owner',
        userId: 'user-123',
      })
      
      const fakeIdGenerator = () => '123'
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-xxx', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    })
  })

  describe('verifyCommentAvailability function', () => {
    it('should throw error if comment not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-xxx')).rejects.toThrowError(NotFoundError)
    })  

    it('should not throw error if comment is found', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Test Thread To Verify Owner',
        body: 'Test Thread Body To Verify Owner',
        username: 'user-123'
      })
      await CommentsTableTestHelper.addComment({
        id: 'comment-xxx',
        threadId: 'thread-123',
        content: 'Comment To Verify Owner',
        userId: 'user-123',
      })
      
      const fakeIdGenerator = () => '123'
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-xxx')).resolves.not.toThrowError(new NotFoundError('Comment tidak ditemukan'));
    })
  })
  
  describe('deleteComment function', () => {
    it('should update the deleted comment to "**komentar telah dihapus**"', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-444',
        title: 'Test Thread To Delete Comment',
        body: 'Test Thread Body To Delete Comment',
        username: 'user-123'
      })
      await CommentsTableTestHelper.addComment({
        id: 'comment-555',
        threadId: 'thread-444',
        content: 'Comment To Delete',
        userId: 'user-123',
        is_delete: false
      })

      const fakeIdGenerator = () => '555'

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)

      // Action
      await commentRepositoryPostgres.deleteComment('comment-555')

      // Assert
      const deletedComment = await CommentsTableTestHelper.findCommentById('comment-555')
      expect(deletedComment[0].is_delete).toEqual(true)
    })
  })

  describe('getCommentsByThreadId function', () => {
    it('should display comments by provided thread ID', async () => {
      // Arrange
      const createdDate = new Date()

      await ThreadsTableTestHelper.addThread({
        id: 'thread-444',
        title: 'Test Thread To GET Comment',
        body: 'Test Thread Body To GET Comment',
        username: 'user-123'
      })
      await CommentsTableTestHelper.addComment({
        id: 'comment-444',
        threadId: 'thread-444',
        content: 'Comment Content 1',
        userId: 'user-123',
        createdDate: createdDate
      })
      await CommentsTableTestHelper.addComment({
        id: 'comment-555',
        threadId: 'thread-444',
        content: 'Comment Content 2',
        userId: 'user-123',
        createdDate: createdDate
      })



      const fakeIdGenerator = () => '444'
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-444')

      // Assert
      expect(comments).toHaveLength(2)
      expect(comments[0].id).toEqual('comment-444')
      expect(comments[0].content).toEqual('Comment Content 1')
      expect(comments[0].username).toEqual('unit_test_user')
      expect(comments[0].thread_id).toEqual('thread-444')
      expect(comments[0].is_delete).toEqual(false)
      expect(comments[0].date).toBeInstanceOf(Date)
      expect(new Date(comments[0].date).toString()).not.toBe('Invalid Date')
      expect(comments[0].date).toEqual(createdDate)
      expect(comments[1].id).toEqual('comment-555')
      expect(comments[1].content).toEqual('Comment Content 2')
      expect(comments[1].username).toEqual('unit_test_user')
      expect(comments[1].thread_id).toEqual('thread-444')
      expect(comments[1].is_delete).toEqual(false)
      expect(comments[1].date).toBeInstanceOf(Date)
      expect(new Date(comments[1].date).toString()).not.toBe('Invalid Date')
      expect(comments[1].date).toEqual(createdDate)
    })
  })
})