const jwt = require('jsonwebtoken')
/**
 * Authentication helper class to generate and decode auth token
 */
const Authentication = class Authentication {
  static privateKey() {
    return 'PRIVATE_KEY'
  }

  static privateRefreshTokenKey() {
    return 'NEW_PRIVATE_KEY'
  }

  /**
   * Creates a new auth token for a given user
   */
  static generateAuthToken(user) {
    const authToken = jwt.sign(
      { data: JSON.stringify(user) },
      this.privateKey(),
      {
        expiresIn: '10m',
        algorithm: 'HS256',
      }
    )
    return authToken
  }

  static generateRefreshToken(user) {
    const refreshToken = jwt.sign(
      { data: JSON.stringify(user) },
      this.privateRefreshTokenKey(),
      {
        expiresIn: '1d',
        algorithm: 'HS256',
      }
    )
    return refreshToken
  }

  /**
   * Extracts the user from a given auth token
   */
  static extractUser(authToken) {
    // sent by frontend as 'Bearer <token>'
    if (authToken.startsWith('Bearer ')) {
      const splitToken = authToken.split(' ')
      const decoded = jwt.verify(splitToken[1], this.privateKey())
      return JSON.parse(decoded.data)
    }
    throw new Error('Authorization header was not Bearer')
  }

  /**
   * Extracts the user from a given refresh token
   */
  static extractUserForRefreshToken(refreshToken) {
    const decoded = jwt.verify(refreshToken, this.privateRefreshTokenKey())
    return JSON.parse(decoded.data)
  }
}

module.exports = Authentication;