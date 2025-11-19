const Jwt = require('@hapi/jwt');

const ServerTestHelper = {
  generateAccessToken: () => {
    return Jwt.token.generate({ username: 'unit_test_user', id: 'user-123' }, process.env.ACCESS_TOKEN_KEY)
  }
}

module.exports = ServerTestHelper