"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send({ msg: 'An internal server error occured.' });
};
