import { Request, Response } from 'express';
import * as sockets from '../sockets';
import { CardModel } from '../models/card';

// Helper function for better shuffling
const shuffleArray = <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // swap elements
    }
    return array;
};

export const popcornscrum = (_req: Request, res: Response): void => {
    res.render('popcornscrum', {
        env: process.env.NODE_ENV
    });
};

export const create_card = async (req: Request, res: Response): Promise<void> => {
    try {
        const card = await CardModel.create({
            title: req.body.title,
            createdAt: new Date(),
            updatedAt: new Date(),
            completed: false
        });
        res.send(card);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

export const get_cards = async (_req: Request, res: Response): Promise<void> => {
    try {
        const cards = await CardModel.findAll({
            order: [['sequence', 'ASC']]
        });
        
        // Mark first incomplete card as active
        const processedCards = cards.map((card, index, array) => {
            const firstIncompleteIndex = array.findIndex(c => !c.completed);
            return {
                ...card.toJSON(),
                isActive: index === firstIncompleteIndex
            };
        });
        
        res.send(processedCards);
        sockets.cardsRefresh(processedCards);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

export const update_card = async (req: Request, res: Response): Promise<void> => {
    try {
        const card = await CardModel.findByPk(req.params.id);
        if (!card) {
            res.status(404).send('Card not found');
            return;
        }

        card.completed = req.body.completed === 'true';
        card.title = req.body.title;
        await card.save();

        const cards = await CardModel.findAll({
            order: [['sequence', 'ASC']]
        });

        res.send();
        sockets.cardsRefresh(cards);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

export const shuffle_cards = async (_req: Request, res: Response): Promise<void> => {
    try {
        // First, mark current active card as completed
        const currentCards = await CardModel.findAll({
            order: [['sequence', 'ASC']]
        });
        
        const activeCard = currentCards.find(card => !card.completed);
        if (activeCard) {
            activeCard.completed = true;
            await activeCard.save();
        }

        // Get all cards and shuffle only the uncompleted ones
        const cards = await CardModel.findAll({
            order: [['sequence', 'ASC']]
        });

        // Separate completed and uncompleted cards
        const completedCards = cards.filter(card => card.completed);
        const uncompletedCards = cards.filter(card => !card.completed);

        // Shuffle only the uncompleted cards
        const shuffledUncompleted = shuffleArray([...uncompletedCards]);

        // Combine back together with completed cards at the end
        const finalOrder = [...shuffledUncompleted, ...completedCards];
        
        // Update sequences
        await Promise.all(finalOrder.map((card, index) => {
            card.sequence = index;
            return card.save();
        }));

        // Process cards to mark new active card
        const processedCards = finalOrder.map((card, index, array) => {
            const firstIncompleteIndex = array.findIndex(c => !c.completed);
            return {
                ...card.toJSON(),
                isActive: index === firstIncompleteIndex
            };
        });

        res.send();
        sockets.cardsRefresh(processedCards);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

export const remove_card = async (req: Request, res: Response): Promise<void> => {
    try {
        await CardModel.destroy({
            where: { id: req.params.id }
        });
        res.send();
        const cards = await CardModel.findAll({
            order: [['sequence', 'ASC']]
        });
        sockets.cardsRefresh(cards);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

export const manage_timer = (req: Request, res: Response): void => {
    sockets.manageTimer(req.body.isTiming);
    res.send();
}; 