const axios = require('axios');

module.exports = {
    fetch(callback) {
        axios.get('/cards')
        .then(response => {
            // JSON responses are automatically parsed.
            callback(null, response.data);
        })
        .catch(e => {
            callback(e, null);
        })
    }
};