class Comment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, threadId, content, owner, date } = payload;

    this.id = id
    this.threadId = threadId
    this.content = content
    this.owner = owner
    this.date = date
  }

  _verifyPayload({id, threadId, content, owner, date}) {
    if (!id || !threadId || !content || !owner || !date) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')   
    }

    if (typeof id !== 'string' || typeof threadId !== 'string' || typeof content !== 'string' || typeof owner !== 'string') { 
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')   
    }
  }
}

module.exports = Comment