import Vue from 'vue'

var Dispatcher = require("./Dispatcher.js");

// module.exports = new Dispatcher();

Vue.prototype.$disp = new Dispatcher();


