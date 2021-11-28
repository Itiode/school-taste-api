import { Request, Response, NextFunction } from 'express';

export default (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err.stack);
  res.status(500).send({ msg: 'An internal server error occured.' });
};
