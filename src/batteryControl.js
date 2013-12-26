const Lang = imports.lang;
const Util = imports.misc.util;
const Signals = imports.signals;
const GLib = imports.gi.GLib;

const Me = imports.misc.extensionUtils.getCurrentExtension();


const TPACPI_BAT_EXEC = "sudo /usr/local/bin/tpacpi-bat"

const BatteryControlACPI = new Lang.Class({
    Name: "BatteryControlACPI",
    
    _init: function(battery) {
        if (battery == 1 || battery == 2) {
            this._battery = battery;
        } else {
            throw new Error("The battery argument must be 1 or 2.");
        }
    },
    
    getStartThreshold: function() {
        global.log("getStartThreshold");
        
        [ret, stdout, stderr, status] =
            GLib.spawn_command_line_sync("%s -g ST %d".format(TPACPI_BAT_EXEC, this._battery));
        if (ret && status == 0) {
            // first number in out string is percentage, parseInt stops at first non-number
            return parseInt(stdout);
        }
        return 0;
    },
    setStartThreshold: function(value) {
        global.log("setStartThreshold " + value);
        this.emit("start-threshold-changed", value);
    },

    getStopThreshold: function() {
        global.log("getStopThreshold");

        [ret, stdout, stderr, status] =
            GLib.spawn_command_line_sync("%s -g SP %d".format(TPACPI_BAT_EXEC, this._battery));
        if (ret && status == 0) {
            // first number in out string is percentage, parseInt stops at first non-number
            return parseInt(stdout);
        }
        return 0;
    },
    setStopThreshold: function(value) {
        global.log("setStopThreshold " + value);
        this.emit("stop-threshold-changed", value);
    },

    getInhibitCharge: function() {
        global.log("getInhibitCharge");

        [ret, stdout, stderr, status] =
            GLib.spawn_command_line_sync("%s -g IC %d".format(TPACPI_BAT_EXEC, this._battery));
        if (ret && status == 0) {
            // first number in out string is percentage, parseInt stops at first non-number
            return (stdout.toString().indexOf("yes") == 0);
        }
        return false;
    },
    setInhibitCharge: function(value) {
        global.log("setInhibitCharge " + value);
        this.emit("inhibit-charge-changed", value);
    },

    getForceDischarge: function() {
        global.log("getForceDischarge");
        [ret, stdout, stderr, status] =
            GLib.spawn_command_line_sync("%s -g FD %d".format(TPACPI_BAT_EXEC, this._battery));
        if (ret && status == 0) {
            // first number in out string is percentage, parseInt stops at first non-number
            return (stdout.toString().indexOf("yes") == 0);
        }
        return true;
    },
    setForceDischarge: function(value) {
        global.log("setForceDischarge " + value);
        this.emit("force-discharge-changed", value);
    },
});
Signals.addSignalMethods(BatteryControlACPI.prototype);
