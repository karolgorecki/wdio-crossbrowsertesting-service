"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var cbt = require('cbt_tunnels');

var CrossBrowserTestingLauncher =
/*#__PURE__*/
function () {
  function CrossBrowserTestingLauncher() {
    _classCallCheck(this, CrossBrowserTestingLauncher);
  }

  _createClass(CrossBrowserTestingLauncher, [{
    key: "onPrepare",
    value: function onPrepare(config) {
      var _this = this;

      if (!config.cbtTunnel) {
        return;
      }

      this.cbtTunnelOpts = Object.assign({
        username: config.user,
        authkey: config.key
      }, config.cbtTunnelOpts);
      this.cbtTunnel = cbt;
      return new Promise(function (resolve, reject) {
        return _this.cbtTunnel.start({
          'username': config.user,
          'authkey': config.key
        }, function (err) {
          if (err) {
            return reject(err);
          }

          _this.tunnel = true;
          return resolve('connected');
        });
      });
    }
  }, {
    key: "onComplete",
    value: function onComplete() {
      var _this2 = this;

      if (!this.tunnel) {
        return;
      }

      return new Promise(function (resolve, reject) {
        return _this2.cbtTunnel.stop(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve('stopped');
        });
      });
    }
  }]);

  return CrossBrowserTestingLauncher;
}();

exports["default"] = CrossBrowserTestingLauncher;