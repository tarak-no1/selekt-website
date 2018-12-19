/**
 * Created by TARUN on 19-Jul-16.
 */

var Global = {
  io: {},
  userSockets: {},
  storeUserSocket: function (id, socket) {
    this.userSockets[id] = socket;
  },

  getUserSocket: function (id) {
    return this.userSockets[id];
  }

};
module.exports = Global;

//# sourceMappingURL=global-compiled.js.map

//# sourceMappingURL=global-compiled-compiled.js.map