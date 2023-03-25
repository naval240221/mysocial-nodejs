const Authentication = require('./authentication');

/**
 * Verifies the users and after validation add user to locals variable
 * sends status 400 if no token is provided
 * sends status 401 if not authorised
 */
const auth = (req, res, next) => {
  try {
    const authToken = req.get('Authorization');
    if (!authToken) {
      res.status(400).send('Auth token not provided')
      return
    } else {
      const userDoc = Authentication.extractUser(authToken)
      if (!userDoc.id) {
        res.status(401).json('Invalid auth token')
        return
      }
      res.locals.userdoc = userDoc;
      next()
    }
  } catch {
    res.status(401).json('Invalid Request')
    return
  }
}
module.exports = auth;