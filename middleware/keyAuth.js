const crypto = require('crypto');

const githubWeekhookAuth = (req, res, next) => {
    const payload = JSON.stringify(req.body);
    const hubSignature = req.headers['x-hub-signature'];

    const signature = crypto
        .createHmac('sha1', process.env.GITHUB_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

    if (`sha1=${signature}` !== hubSignature) {
        return res.status(401).send('Invalid signature');
    }
    return next();
}

const authorizeWebsocket = (req, res, next) => {
  const secretKey = req.headers['x-secret-key'];

  if (!secretKey || secretKey !== process.env.WEBSOCKET_SECRET) {
      return res.status(403).json({ error: 'Unauthorized' });
  }

  next();
}

module.exports = {
  githubWeekhookAuth,
  authorizeWebsocket
}