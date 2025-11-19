class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    await this._threadRepository.verifyThreadAvailability(threadId)

    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentsModified = comments?.map((comment) => {
      const content = comment.is_delete ? "**komentar telah dihapus**" : comment.content;

      delete comment.is_delete;
      return { ...comment, content };
    });

    return {
      ...thread,
      comments: commentsModified
    };
  }
}

module.exports = GetThreadDetailUseCase;
