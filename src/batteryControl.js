const Lang = imports.lang;
const Util = imports.misc.util;
const Signals = imports.signals;

const Me = imports.misc.extensionUtils.getCurrentExtension();



const BatteryControlACPI = new Lang.Class({
    Name: "BatteryControlACPI",
    
    getStartThreshold: function() {
    },
    setStartThreshold: function(value) {
        this.emit("start-threshold-changed", value);
    },

    getStopThreshold: function() {
    },
    setStopThreshold: function(value) {
        this.emit("stop-threshold-changed", value);
    },

    getInhibitCharge: function() {
    },
    setInhibitCharge: function(value) {
        this.emit("inhibit-charge-changed", value);
    },

    getForceDischarge: function() {
    },
    setForceDischarge: function(value) {
        this.emit("force-discharge-changed", value);
    },
});
Signals.addSignalMethods(BatteryControlACPI.prototype);
