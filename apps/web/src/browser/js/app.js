const Vue = require('vue');
const PopcornApp = require('./components/PopcornApp.vue');

new Vue({
    el: '.popcornApp',
    render: h => h(PopcornApp)
});
