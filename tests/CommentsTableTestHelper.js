/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({ id = 'comment-123', threadId = 'thread-123', content = '', userId = 'user-123', createdDate = new Date().toISOString() }) {
    const query = {
      text: 'INSERT INTO comments (id, content, thread_id, user_id, date) VALUES($1, $2, $3, $4, $5)',
      values: [id, content, threadId, userId, createdDate]
    }

    await pool.query(query)
  },
  async findCommentById(id) {
    const query = {
      text: 'SELECT *, thread_id as "threadId" FROM comments WHERE id = $1',
      values: [id]
    }

    const result = await pool.query(query)
    return result.rows
  }, 
  // async findCommentsByThreadId(threadId) {
  //   const query = {
  //     // text: 'SELECT comments.id, comments.date, comments.content, comments.thread_id, users.username FROM comments INNER JOIN users ON comments.username = users.id WHERE comments.thread_id = $1',
  //     // text: 'SELECT comments.id, comments.date, comments.content, comments.thread_id, users.username FROM comments INNER JOIN users ON comments.username = users.id WHERE comments.thread_id = $1',
  //     text: 'SELECT * FROM comments WHERE thread_id = $1',
  //     values: [threadId]
  //   }

  //   const result = await pool.query(query)
  //   return result.rows
  // },
  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  }
}

module.exports = CommentsTableTestHelper