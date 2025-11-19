const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const CommentRepository = require("../../Domains/comments/CommentRepository");
const Comment = require("../../Domains/comments/entities/Comment");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super()
    this._pool = pool;
    this._idGenerator = idGenerator
  }

  async addComment(payload) {
    const id = `comment-${this._idGenerator()}`

    const { threadId, content, userId } = payload;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, date, thread_id as "threadId", user_id as owner',
      values: [id, content, threadId, userId]
    }

    const result = await this._pool.query(query)
    
    return new Comment({ 
      ...result.rows[0]
     });
  }

  async verifyCommentAvailability(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)
    
    if(!result.rows.length) {
      throw new NotFoundError('Comment tidak ditemukan')
    }
  }

  async verifyCommentOwner(id, userId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND user_id = $2',
      values: [id, userId]
    }

    const result = await this._pool.query(query)
    
    if(!result.rows.length) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  async deleteComment(id) {
    const query = {
      text: "UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id, content",
      values: [id]
    }

    const result = await this._pool.query(query)

    return result.rows[0]
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: 'select comments.id, comments.date, comments.content, comments.thread_id, comments.is_delete, users.username from comments INNER JOIN users ON comments.user_id = users.id WHERE thread_id = $1 ORDER BY comments.date ASC',
      values: [threadId]
    }

    const result = await this._pool.query(query)
 
    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres