'use strict';

const Homey = require('homey');

class KeyWeLockApp extends Homey.App {

	onInit() {

		this.log('KeyWe Z-Wave Lock is running...');

	}

}

module.exports = KeyWeLockApp;
