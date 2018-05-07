const axios = require('axios');

module.exports = {
    fetch(callback) {
        axios.get('/api/get')
        .then(response => {
            // JSON responses are automatically parsed.
            callback(null, response.data);
        })
        .catch(e => {
            callback(e, null);
        })
    },
    
    update(card, callback) {
        axios.post('/api/update/' + card.id,
            {
                completed: card.completed.toString()
            }
        )
        .then(response => {
            // JSON responses are automatically parsed.
            callback(null, response.data);
        })
        .catch(e => {
            callback(e, null);
        })
    },
    
    shuffle(callback) {
        axios.post('/api/shuffle')
        .then(response => {
            // JSON responses are automatically parsed.
            callback(null, response.data);
        })
        .catch(e => {
            callback(e, null);
        })
    },
    
    manageTimer(isTiming,callback){
        axios.post('/api/manageTimer',
            {
                isTiming: isTiming
            }
        )
        .then(response => {
            // JSON responses are automatically parsed.
            callback(null, response.data);
        })
        .catch(e => {
            callback(e, null);
        })
    }
};