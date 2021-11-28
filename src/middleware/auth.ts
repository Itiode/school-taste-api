import * as jwt from 'jsonwebtoken';
import config from 'config';

export default (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token)
    return res
      .status(401)
      .send({ msg: 'Access denied! No authorization token provided.' });

  try {
    const decoded = jwt.verify(token, config.get('jwtAuthPrivateKey'));
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(400).send({ msg: 'Authorization token: ' + err.message });
  }
};
