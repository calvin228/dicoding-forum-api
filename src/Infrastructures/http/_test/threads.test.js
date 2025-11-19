const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper")
const ServerTestHelper = require("../../../../tests/ServerTestHelper")
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper")
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper")
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper")
const AuthenticationTokenManager = require("../../../Applications/security/AuthenticationTokenManager")
const AddUserUseCase = require("../../../Applications/use_case/AddUserUseCase")
const LoginUserUseCase = require("../../../Applications/use_case/LoginUserUseCase")
const container = require("../../container")
const pool = require("../../database/postgres/pool")
const createServer = require("../createServer")

describe('/threads endpoint', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'unit_test_user',
      password: 'password',
      fullname: "Unit Test User"
    })
  })

  afterAll(async () => {
    await pool.end()
  })
  
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  describe('When POST /threads', () => {
    it('should return 201 and persist new threads', async () => {
      // Arrange
      const server = await createServer(container)
  
      const accessToken = ServerTestHelper.generateAccessToken()

      // Action
      const response = await server.inject({
        method: "POST",
        url: '/threads',
        payload: {
          title: "Test Thread Title",
          body: "Test Thread Body",
        },
        headers: {
          'Authorization': 'Bearer '+accessToken
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
    })

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 123
      }
      const server = await createServer(container)
      const accessToken = ServerTestHelper.generateAccessToken()

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          'Authorization': 'Bearer '+accessToken
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');

    })
  })

  describe('When POST /threads/{threadId}/comments', () => {
    it('should return 201 and persist new comments', async () => {
      // Arrange
      const server = await createServer(container)
      const accessToken = ServerTestHelper.generateAccessToken()
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Add Thread Title',
        body: 'Add Thread Body',
        owner: 'user-123'
      })

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: {
          content: 'Test Comment Content',
        },
        headers: {
          'Authorization': 'Bearer '+accessToken
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
    })

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {}

      const server = await createServer(container)
      const accessToken = ServerTestHelper.generateAccessToken()

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Add Thread Title',
        body: 'Add Thread Body',
        owner: 'user-123'
      })

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          'Authorization': 'Bearer '+accessToken
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    })

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container)
      const accessToken = ServerTestHelper.generateAccessToken()

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-xxx/comments',
        payload: {
          content: 'Test Comment Content',
        },
        headers: {
          'Authorization': 'Bearer '+accessToken
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    })
  })

  describe('When DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should return 200 and delete comment', async () => {
      // Arrange
      const server = await createServer(container)
      const accessToken = ServerTestHelper.generateAccessToken()
      
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Add Thread Title',
        body: 'Add Thread Body',
        owner: 'user-123'
      })

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'Add Comment Content',
        userId: 'user-123'
      })

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          'Authorization': 'Bearer '+accessToken
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    })
  })

  describe('When GET /threads/{threadId}', () => {
    it('should return 200 and return thread detail', async () => {
      // Arrange
      const server = await createServer(container)
      const threadId = `thread-abc`
      const commentId = `comment-abc`

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'Add Thread Title',
        body: 'Add Thread Body',
        owner: 'user-123'
      })

      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: threadId,
        content: 'Add Comment Content',
        userId: 'user-123'
      })

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      })

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.title).toEqual('Add Thread Title');
      expect(responseJson.data.thread.body).toEqual('Add Thread Body');
      expect(responseJson.data.thread.owner).toEqual('user-123');
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].id).toEqual(commentId);
      expect(responseJson.data.thread.comments[0].content).toEqual('Add Comment Content');
      expect(responseJson.data.thread.comments[0].username).toEqual('unit_test_user');
    })

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-xxx',
      })

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    })
  })
})