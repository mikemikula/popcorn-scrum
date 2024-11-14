import express from 'express';
import morgan from 'morgan';
import { json, urlencoded } from 'body-parser';
import { join } from 'path';
import * as http from './controllers/http';

const app = express();

// Configure middleware
app.use(morgan('combined'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.set('x-powered-by', false);

// Serve Vue.js frontend
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(join(__dirname, '../../web/dist')));
} else {
    // In development, Vue dev server handles static files
    app.get('/', (_req, res) => {
        res.redirect('http://localhost:5173');
    });
}

// Setup API routes
app.get('/api/get', http.get_cards);
app.post('/api/create', http.create_card);
app.put('/api/update/:id', http.update_card);
app.delete('/api/remove/:id', http.remove_card);
app.post('/api/shuffle', http.shuffle_cards);
app.post('/api/timer', http.manage_timer);

export default app; 