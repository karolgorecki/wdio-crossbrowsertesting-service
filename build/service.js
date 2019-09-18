"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _request = _interopRequireDefault(require("request"));

var _logger = _interopRequireDefault(require("@wdio/logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var log = (0, _logger["default"])('@wdio/crossbrowsertesting-service');
var jobDataProperties = ['name', 'tags', 'public', 'build', 'extra'];

var CrossBrowserTestingService =
/*#__PURE__*/
function () {
  function CrossBrowserTestingService() {
    _classCallCheck(this, CrossBrowserTestingService);

    this.testCnt = 0;
    this.failures = 0;
  }
  /**
   * gather information about runner
   */


  _createClass(CrossBrowserTestingService, [{
    key: "beforeSession",
    value: function beforeSession(config, capabilities) {
      this.config = config;
      this.capabilities = capabilities;
      this.config.user = config.user;
      this.config.key = config.key;
      this.cbtUsername = this.config.user;
      this.cbtAuthkey = this.config.key;
      this.isServiceEnabled = this.cbtUsername && this.cbtAuthkey;
    }
    /**
     * Before suite
     * @param {Object} suite Suite
    */

  }, {
    key: "beforeSuite",
    value: function beforeSuite(suite) {
      this.suiteTitle = suite.title;
    }
    /**
     * Before test
     * @param {Object} test Test
    */
    // beforeTest (test) {
    //     if (!this.isServiceEnabled) {
    //         return
    //     }
    //     /**
    //      * in jasmine we get Jasmine__TopLevel__Suite as title since service using test
    //      * framework hooks in order to execute async functions.
    //      * This tweak allows us to set the real suite name for jasmine jobs.
    //      */
    //     /* istanbul ignore if */
    //     if (this.suiteTitle === 'Jasmine__TopLevel__Suite') {
    //         this.suiteTitle = test.fullName.slice(0, test.fullName.indexOf(test.title) - 1)
    //     }
    //     const context = test.parent === 'Jasmine__TopLevel__Suite' ? test.fullName : test.parent + ' - ' + test.title
    //     global.browser.execute('cbt:test-context=' + context)
    // }

  }, {
    key: "afterSuite",
    value: function afterSuite(suite) {
      if (suite.hasOwnProperty('error')) {
        ++this.failures;
      }
    }
    /**
     * After test
     * @param {Object} test Test
     */

  }, {
    key: "afterTest",
    value: function afterTest(test) {
      if (!test.passed) {
        ++this.failures;
      }
    }
    /**
     * Before feature
     * @param {Object} feature Feature
     */
    // beforeFeature (feature) {
    //     if (!this.isServiceEnabled) {
    //         return
    //     }
    //     this.suiteTitle = feature.name || feature.getName()
    //     global.browser.execute('cbt:test-context=Feature: ' + this.suiteTitle)
    // }

    /**
     * After step
     * @param {Object} feature Feature
     */

  }, {
    key: "afterStep",
    value: function afterStep(feature) {
      if (
      /**
       * Cucumber v1
       */
      feature.failureException ||
      /**
       * Cucumber v2
       */
      typeof feature.getFailureException === 'function' && feature.getFailureException() ||
      /**
       * Cucumber v3, v4
       */
      feature.status === 'failed') {
        ++this.failures;
      }
    }
    /**
     * Before scenario
     * @param {Object} scenario Scenario
     */
    // beforeScenario (scenario) {
    //     if (!this.isServiceEnabled) {
    //         return
    //     }
    //     const scenarioName = scenario.name || scenario.getName()
    //     global.browser.execute('cbt:test-context=Scenario: ' + scenarioName)
    // }

    /**
     * Update info
     * @return {Promise} Promsie with result of updateJob method call
     */

  }, {
    key: "after",
    value: function after(result) {
      var _this = this;

      if (!this.isServiceEnabled) {
        return;
      }

      var failures = this.failures;
      /**
       * set failures if user has bail option set in which case afterTest and
       * afterSuite aren't executed before after hook
       */

      if (global.browser.config.mochaOpts && global.browser.config.mochaOpts.bail && Boolean(result)) {
        failures = 1;
      }

      var status = 'status: ' + (failures > 0 ? 'failing' : 'passing');

      if (!global.browser.isMultiremote) {
        log.info("Update job with sessionId ".concat(global.browser.sessionId, ", ").concat(status));
        return this.updateJob(global.browser.sessionId, failures);
      }

      return Promise.all(Object.keys(this.capabilities).map(function (browserName) {
        log.info("Update multiremote job for browser \"".concat(browserName, "\" and sessionId ").concat(global.browser[browserName].sessionId, ", ").concat(status));
        return _this.updateJob(global.browser[browserName].sessionId, failures, false, browserName);
      }));
    }
  }, {
    key: "onReload",
    value: function onReload(oldSessionId, newSessionId) {
      if (!this.isServiceEnabled) {
        return;
      }

      var status = 'status: ' + (this.failures > 0 ? 'failing' : 'passing');

      if (!global.browser.isMultiremote) {
        log.info("Update (reloaded) job with sessionId ".concat(oldSessionId, ", ").concat(status));
        return this.updateJob(oldSessionId, this.failures, true);
      }

      var browserName = global.browser.instances.filter(function (browserName) {
        return global.browser[browserName].sessionId === newSessionId;
      })[0];
      log.info("Update (reloaded) multiremote job for browser \"".concat(browserName, "\" and sessionId ").concat(oldSessionId, ", ").concat(status));
      return this.updateJob(oldSessionId, this.failures, true, browserName);
    }
  }, {
    key: "updateJob",
    value: function updateJob(sessionId, failures) {
      var _this2 = this;

      var calledOnReload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var browserName = arguments.length > 3 ? arguments[3] : undefined;
      return new Promise(function (resolve, reject) {
        return _request["default"].put(_this2.getRestUrl(sessionId, failures), {
          json: true,
          auth: {
            user: _this2.cbtUsername,
            pass: _this2.cbtAuthkey
          }
        }, function (e, res, body) {
          /* istanbul ignore if */
          _this2.failures = 0;

          if (e) {
            return reject(e);
          }

          global.browser.jobData = body;
          return resolve(body);
        });
      });
    }
    /**
     *
     * @param {String} sessionId Session id
     * @returns {String}
     */

  }, {
    key: "getRestUrl",
    value: function getRestUrl(sessionId, failures) {
      var score = failures ? 'fail' : 'pass';
      return "https://crossbrowsertesting.com/api/v3/selenium/".concat(sessionId, "?action=set_score&score=").concat(score);
    }
  }]);

  return CrossBrowserTestingService;
}();

exports["default"] = CrossBrowserTestingService;