const Lang = imports.lang;
const Util = imports.misc.util;
const Signals = imports.signals;

const Me = imports.misc.extensionUtils.getCurrentExtension();



const BatteryControlACPI = new Lang.Class({
    Name: "BatteryControlACPI",
    
    getStartThreshold: function() {
        global.log("getStartThreshold")
        return 42;
    },
    setStartThreshold: function(value) {
        global.log("setStartThreshold " + value);
        this.emit("start-threshold-changed", value);
    },

    getStopThreshold: function() {
        global.log("getStopThreshold")
        return 23;
    },
    setStopThreshold: function(value) {
        global.log("setStopThreshold " + value);
        this.emit("stop-threshold-changed", value);
    },

    getInhibitCharge: function() {
        global.log("getInhibitCharge")
        return false;
    },
    setInhibitCharge: function(value) {
        global.log("setInhibitCharge " + value);
        this.emit("inhibit-charge-changed", value);
    },

    getForceDischarge: function() {
        global.log("getForceDischarge")
        return true;
    },
    setForceDischarge: function(value) {
        global.log("setForceDischarge " + value);
        this.emit("force-discharge-changed", value);
    },
});
Signals.addSignalMethods(BatteryControlACPI.prototype);
