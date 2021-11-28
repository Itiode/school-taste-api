import mongoose, { Mongoose } from 'mongoose';
import config from 'config';

const url = config.get('dbUrl') as string;
export default (cb: (db: Mongoose | null, err: Error | null) => void) => {
  mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then((res) => {
      cb(res, null);
    })
    .catch((err) => {
      cb(null, err);
    });
};
