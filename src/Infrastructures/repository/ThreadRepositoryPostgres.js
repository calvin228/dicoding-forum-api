const Thread = require("../../Domains/threads/entities/Thread");
const ThreadRepository = require("../../Domains/threads/ThreadRepository");
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super()
    this._pool = pool;
    this._idGenerator = idGenerator
  }

  async addThread(payload) {
    const id = `thread-${this._idGenerator()}`

    const { title, body, owner } = payload;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, body, owner',
      values: [id, title, body, owner]
    }

    const result = await this._pool.query(query)

    return new Thread({ ...result.rows[0] });
  }

  async verifyThreadAvailability(threadId) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Thread tidak ditemukan')
    }
  }

  async getThreadById(threadId) {    
    const query = {
      text:  'SELECT threads.*, users.username FROM threads INNER JOIN users on threads.owner = users.id WHERE threads.id = $1',
      values: [threadId]
    }

    const result = await this._pool.query(query)
    
    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres