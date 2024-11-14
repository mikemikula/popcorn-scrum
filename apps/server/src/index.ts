'use strict';

import { createServer } from 'http';
import { Server } from 'socket.io';
import config from './config';
import app from './app';
import * as sockets from './sockets';
import { log } from './shared/log';

const server = createServer(app);
const io = new Server(server);

sockets.init(io);

const startServer = (port: number): void => {
    server.listen(port)
        .on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
                log(`Port ${port} is busy, trying ${port + 1}`);
                startServer(port + 1);
            } else {
                throw err;
            }
        })
        .on('listening', () => {
            log(`Express server listening on port *:${port}`);
        });
};

startServer(config.port);
