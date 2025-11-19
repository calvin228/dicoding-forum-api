/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('comments', {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true
    },
    content: {
      type: 'VARCHAR(255)',
      notNull: true
    },
    thread_id: {
      type: 'TEXT',
      notNull: true
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true
    },
    is_delete: {
      type: 'BOOLEAN',
      notNull: true,
      default: false
    },
    date: {
      type: 'TIMESTAMPTZ',
      default: pgm.func('current_timestamp'),
    }
  })

  pgm.addConstraint(
    'comments',
    'fk_thread_comments.thread_id_thread.id',
    'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE'
  );

  pgm.addConstraint(
    'comments',
    'fk_user_comments.user_id_users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE'
  );
};

exports.down = pgm => {
    pgm.dropTable('comments')
};
