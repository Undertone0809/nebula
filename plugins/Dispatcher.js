var dispIns = [];
var dispCbs = [];

function Dispatcher() {
  dispIns.push(this);
  dispCbs.push({});
}

Dispatcher.prototype = {
  // listen
  on(topic, cb) {
    let cbtypes = dispCbs[dispIns.indexOf(this)];
    let cbs = cbtypes[topic] = cbtypes[topic] || [];
    if (!~cbs.indexOf(cb)) { cbs.push(cb) }
  },
  // close listen
  off(topic, cb) {
    let cbtypes = dispCbs[dispIns.indexOf(this)];
    let cbs = cbtypes[topic] = cbtypes[topic] || [];
    let curTypeCbIdx = cbs.indexOf(cb);
    if (~curTypeCbIdx) {
      cbs.splice(curTypeCbIdx, 1);
    }
  },
  // publish broadcast
  fire(topic, ...args) {
    let cbtypes = dispCbs[dispIns.indexOf(this)];
    let cbs = cbtypes[topic] = cbtypes[topic] || [];

    for (let i = 0; i < cbs.length; i++) {
      cbs[i].apply(null, args);
    }
  }

};
module.exports = Dispatcher;