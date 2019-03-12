'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class GKW2000D extends ZwaveDevice {
	onMeshInit() {

		// enable debugging
		//this.enableDebug();

		// print the node's info to the console
		//this.printNode();


		let wireless_unlocked = new Homey.FlowCardTriggerDevice('wireless_unlocked');
		wireless_unlocked.register();

		let wireless_locked = new Homey.FlowCardTriggerDevice('wireless_locked');
		wireless_locked.register();

		let button_unlocked = new Homey.FlowCardTriggerDevice('button_unlocked');
		button_unlocked.register();

		let button_locked = new Homey.FlowCardTriggerDevice('button_locked');
		button_locked.register();

		let user_unlocked = new Homey.FlowCardTriggerDevice('user_unlocked');
		user_unlocked.register();

		let keypad_locked = new Homey.FlowCardTriggerDevice('keypad_locked');
		keypad_locked.register();

		let manual_unlocked = new Homey.FlowCardTriggerDevice('manual_unlocked');
		manual_unlocked.register();

		let manual_locked = new Homey.FlowCardTriggerDevice('manual_locked');
		manual_locked.register();

		let auto_locked = new Homey.FlowCardTriggerDevice('auto_locked');
		auto_locked.register();

		let deadbolt_jammed = new Homey.FlowCardTriggerDevice('deadbolt_jammed');
		deadbolt_jammed.register();

		//register capabilities for this device
		this.registerCapability('locked', 'DOOR_LOCK', {
			get: 'DOOR_LOCK_OPERATION_GET',
			getOpts: {
				getOnOnline: true,
			},
			set: 'DOOR_LOCK_OPERATION_SET',
			setParserV2: value => {
				if (this.getCapabilityValue('locked') === value){
					// The registerCapability using NOTIFICATION seems to cause a repeated lock/unlock command.
					// This condition is to prevent the repeated lock command from firing
					return null;
				}else{
					return {
						'Door Lock Mode': (!value) ? 'Door Unsecured' : 'Door Secured',
					};
				}
			},
			report: 'DOOR_LOCK_OPERATION_REPORT',
			reportParserV2(report) {
				if (report && report.hasOwnProperty('Door Lock Mode')) return report['Door Lock Mode'] === 'Door Secured';
				return null;
			},
		});


		this.registerCapability('locked', 'NOTIFICATION', {
					getOpts: {
						getOnOnline: true,
					},
					reportParser: report => {
						if (report && report['Notification Type'] === 'Access Control') {
							switch(report['Event']) {
							  case 1:
							    // locked by button
									//console.log("locked by button");
									button_locked.trigger(this, null, null);
									return true;
							    break;
							  case 2:
							    // unlocked by button
									//console.log("unlocked by button");
									button_unlocked.trigger(this, null, null);
									return false;
							    break;
								case 3:
									// locked by BLE or Z-Wave
										//console.log("locked by BLE/Z-Wave");
										wireless_unlocked.trigger(this, null, null);
									 	return true;
								  break;
								case 4:
									//unlocked by BLE or Z-Wave
									//console.log("unlocked by BLE/Z-Wave");
									wireless_locked.trigger(this, null, null);
								 	return false;
									break;
								case 5:
									// locked by Keypad
									//console.log("locked by keypad");
									keypad_locked.trigger(this, null, null);
									return true;
									break;
								case 6:
									// unlocked by Keypad
									let keyType = parseInt(report['Event Parameter'][0]);
									const tokens = {
										"userslot": keyType
									}
									user_unlocked.trigger(this, tokens, null);

									//console.log("unlocked by keypad " + keyType);
									return false;
									break;
								case 9:
									// autolocked
									//console.log("autolocked");
									auto_locked.trigger(this, null, null);
									return true;
									break;
								case 11:
									// deadbolt jammed
									//console.log("deadbolt jammed");
									deadbolt_jammed.trigger(this, null, null);
									return null;
									break;
								case 24:
									// unlocked by knob or key
									//console.log("unlocked by knob");
									manual_unlocked.trigger(this, null, null);
									return false;
									break;
								case 25:
									// locked by knob or key
									//console.log("locked by knob");
									manual_locked.trigger(this, null, null);
									return true;
									break;
							  default:
							    return null;
							}
						}
						return null;
					}
				});

				// register BATTERY capabilities
				this.registerCapability('measure_battery', 'BATTERY', {
					getOpts: {
						getOnOnline: true,
						getOnStart : true,
					}
				});

				// this contact alarm does not send update in real time. Only by polling, thus is removed for saving battery life
				// this.registerCapability('alarm_contact', 'DOOR_LOCK', {
				// 	get: 'DOOR_LOCK_OPERATION_GET',
				// 	getOpts: {
				// 		getOnOnline: true,
				// 	},
				// 	report: 'DOOR_LOCK_OPERATION_REPORT',
				// 	reportParserV2(report) {
				// 		if (report && report.hasOwnProperty('Door Condition')) {
				// 			this.log('Door Condition has changed:', report['Door Condition']);
				// 			// check if Bit 0 is 1 (door closed) and return the inverse (alarm when door open)
				// 			return report['Door Condition'] == 2;
				// 		};
				// 		return null;
				// 	},
				// });
	}
}

module.exports = GKW2000D;
