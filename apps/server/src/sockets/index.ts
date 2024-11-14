import { Server } from 'socket.io';
import type { Card } from '@popcorn/shared';

let io: Server;

export const init = (socketIo: Server): void => {
    io = socketIo;
};

export const cardsRefresh = (cards: Card[]): void => {
    io.emit('cards:refresh', cards);
};

export const manageTimer = (isTiming: boolean): void => {
    io.emit(isTiming ? 'timer:start' : 'timer:stop');
}; 