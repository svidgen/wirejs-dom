import QUnit from 'qunit';
import './util/cli-shim.js';

// no longer testing v1 on the CLI, since jsdom is failing a percentage of
// tests that pass correctly in the browser.
import './v2/index.js';

global.QUnit = QUnit;