"use strict";
exports.__esModule = true;
exports.formatDate = void 0;
var moment_1 = require("moment");
function formatDate(date) {
    return (0, moment_1["default"])(date).startOf('hour').fromNow();
}
exports.formatDate = formatDate;
