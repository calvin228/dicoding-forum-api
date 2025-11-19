const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper")
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper")
const NotFoundError = require("../../../Commons/exceptions/NotFoundError")
const NewThread = require("../../../Domains/threads/entities/NewThread")
const Thread = require("../../../Domains/threads/entities/Thread")
const pool = require("../../database/postgres/pool")
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres")

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()  
  })

  describe('addThread function', () => {
    it('should store the thread to db and return created thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'user_unit_test',
        password: 'password',
        fullname: 'User 123'
      })

      const newThread = new NewThread({
        title: 'AddThread Title',
        body: 'AddThread Body',
        owner: 'user-123'
      })

      const fakeIdGenerator = () => '123'

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
    
      // Action
      const result = await threadRepositoryPostgres.addThread(newThread)

      // Assert
      const addedThread = await ThreadsTableTestHelper.findThreadById('thread-123')
      expect(result).toStrictEqual(new Thread({
        id: 'thread-123',
        title: 'AddThread Title',
        body: 'AddThread Body',
        owner: 'user-123'
      }))
      expect(addedThread).toHaveLength(1)
    }) 
  })

  describe('verifyThreadAvailability function', () => {
    it('should not return error when thread available', async () => {
      // Arrange  
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'user_unit_test',
        password: 'password',
        fullname: 'User 123'
      })
      
      const threadPayload = {
        id: 'thread-123',
        title: 'Test Thread Title',
        body: 'AddThread Body',
        owner: 'user-123'
      }
      await ThreadsTableTestHelper.addThread(threadPayload)

      const fakeIdGenerator = () => '123'

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator)

      // Action & Assert;
      await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-123')).resolves.not.toThrowError(new NotFoundError('Thread tidak ditemukan'));
    })

    it('should throw error when thread not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator)

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-xxx')).rejects.toThrowError(new NotFoundError('Thread tidak ditemukan'));
    })
  })

  describe('getThreadById function', () => {
    it('should return thread detail', async () => {
      // Arrange
      const threadPayload = {
        id: 'thread-123',
        title: 'Thread Title',
        body: 'Thread Body',
        username: 'user-123'
      }
      
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'user_unit_test',
        password: 'password',
        fullname: 'User 123'
      })

      await ThreadsTableTestHelper.addThread(threadPayload)

      const fakeIdGenerator = () => '123'

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator)

      // Action
      const result = await threadRepositoryPostgres.getThreadById('thread-123')

      // Assert
      expect(result).not.toBeUndefined()
      expect(result.id).toEqual('thread-123')
      expect(result.title).toEqual('Thread Title')
      expect(result.body).toEqual('Thread Body')
      expect(result.username).toEqual('user_unit_test')
    })
  })
})