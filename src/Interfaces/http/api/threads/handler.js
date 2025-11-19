const AddCommentUseCase = require("../../../../Applications/use_case/AddCommentUseCase");
const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");
const DeleteCommentUseCase = require("../../../../Applications/use_case/DeleteCommentUseCase");
const GetThreadDetailUseCase = require("../../../../Applications/use_case/GetThreadDetailUseCase");

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadsHandler = this.postThreadsHandler.bind(this);
    this.postThreadsCommentHandler = this.postThreadsCommentHandler.bind(this);
    this.deleteThreadsCommentHandler = this.deleteThreadsCommentHandler.bind(this);
    this.getThreadDetailHandler = this.getThreadDetailHandler.bind(this);
  }

  async postThreadsHandler(request, h) {
    const { id: owner } = request.auth.credentials;

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);

    const addedThread = await addThreadUseCase.execute({
      ...request.payload,
      owner
    });

    const response = h.response({
      status: "success",
      data: {
        addedThread
      }
    });

    response.code(201);
    return response;
  }

  async postThreadsCommentHandler(request, h) {
    const { threadId } = request.params;

    const { id: userId } = request.auth.credentials;

    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);

    const addedComment = await addCommentUseCase.execute({
      ...request.payload,
      threadId,
      userId
    });

    const response = h.response({
      status: "success",
      data: {
        addedComment
      }
    });

    response.code(201);
    return response;
  }

  async deleteThreadsCommentHandler(request, h) {
    const { commentId } = request.params;

    const { id: userId } = request.auth.credentials;

    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);

    await deleteCommentUseCase.execute({
      commentId,
      userId
    });

    const response = h.response({
      status: "success"
    });
    response.code(200);
    return response;
  }

  async getThreadDetailHandler(request, h) {
    const { threadId } = request.params;

    const getThreadDetailUseCase = this._container.getInstance(GetThreadDetailUseCase.name);

    const thread = await getThreadDetailUseCase.execute({
      threadId
    });

    const response = h.response({
      status: "success",
      data: {
        thread
      }
    });

    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
