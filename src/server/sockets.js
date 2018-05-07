'use strict';

let io;

// Initialize with provided socket.io instance
exports.init = function (_io) {
    io = _io;
};

exports.cardsRefresh = function (card) {
    io.emit('cardsRefresh', card);
};

exports.manageTimer = function (isTiming) {
    io.emit('manageTimer', isTiming);
};

