const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");
const Thread = require("../../../Domains/threads/entities/Thread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const pool = require("../../../Infrastructures/database/postgres/pool");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");

describe('GetThreadDetailUseCase', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  })

  afterAll(async () => {
    await pool.end();
  })

  it('should orchestrate the get thread and comments correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    }

    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'unit_test_user',
      password: 'password',
      fullname: "Unit Test User"
    })

    await ThreadsTableTestHelper.addThread({
      id: useCasePayload.threadId,
      title: 'Thread Title',
      body: 'Thread Body',
      owner: 'user-123',
    });

    const mockThread = {
      id: useCasePayload.threadId,
      title: 'Thread Title',
      body: 'Thread Body',
      username: 'user-123',
    };

    const mockComments = [
      {
        id: 'comment-123',
        threadId: useCasePayload.threadId,
        content: 'Comment 1',
        username: 'user-123',
        date: '2025-01-01',
        is_delete: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(mockThread));
    mockThreadRepository.verifyThreadAvailability = jest.fn().mockImplementation(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockImplementation(() => Promise.resolve(mockComments));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const result = await getThreadDetailUseCase.execute(useCasePayload)

    // Assert
    expect(result).toStrictEqual({
      id: useCasePayload.threadId,
      title: 'Thread Title',
      body: 'Thread Body',
      username: 'user-123',
      comments: [
        {
          id: 'comment-123',
          threadId: useCasePayload.threadId,
          content: 'Comment 1',
          username: 'user-123',
          date: '2025-01-01'
        },
      ],
    });
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId);
  })

  it('should return the thread and comments with modified content if the comment is deleted', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    }

    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'unit_test_user',
      password: 'password',
      fullname: "Unit Test User"
    })
    
    await ThreadsTableTestHelper.addThread({
      id: useCasePayload.threadId,
      title: 'Thread Title',
      body: 'Thread Body',
      username: 'user-123',
    });

    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      threadId: useCasePayload.threadId,
      content: 'Comment 1',
      userId: 'user-123',
    });

    const mockThread = {
      id: useCasePayload.threadId,
      title: 'Thread Title',
      body: 'Thread Body',
      username: 'user-123',
    };

    const mockComments = [
      {
        id: 'comment-123',
        threadId: useCasePayload.threadId,
        content: 'Comment 1',
        username: 'user-123',
        date: '2025-01-01',
        is_delete: true,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(mockThread));
    mockThreadRepository.verifyThreadAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockImplementation(() => Promise.resolve(mockComments));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const result = await getThreadDetailUseCase.execute(useCasePayload)

    // Assert
    expect(result).toStrictEqual({
      id: useCasePayload.threadId,
      title: 'Thread Title',
      body: 'Thread Body',
      username: 'user-123',
      comments: [
        {
          id: 'comment-123',
          threadId: useCasePayload.threadId,
          content: '**komentar telah dihapus**',
          username: 'user-123',
          date: '2025-01-01',
        },
      ],
    });
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId);
  })
})