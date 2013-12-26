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
    _callTpacpiBat: function(cmd, value) {
        if (value == null) {
            return GLib.spawn_command_line_sync("%s %s %d".format(
                                            TPACPI_BAT_EXEC,
                                            cmd,
                                            this._battery));
        } else {
            return GLib.spawn_command_line_sync("%s %s %d %d".format(
                                            TPACPI_BAT_EXEC,
                                            cmd,
                                            this._battery,
                                            value));
        }
    },
    
    getStartThreshold: function() {
        global.log("getStartThreshold");
        
        [ret, stdout, stderr, status] = this._callTpacpiBat("-g ST");

        if (ret && status == 0) {
            // first number in out string is percentage, parseInt stops at first non-number
            return parseInt(stdout);
        }
        return 0;
    },
    setStartThreshold: function(value) {
        global.log("setStartThreshold " + value);
        [ret, stdout, stderr, status] = this._callTpacpiBat("-s ST", value);
        this.emit("start-threshold-changed", value);
    },

    getStopThreshold: function() {
        global.log("getStopThreshold");

        [ret, stdout, stderr, status] = this._callTpacpiBat("-g SP");
        if (ret && status == 0) {
            // first number in out string is percentage, parseInt stops at first non-number
            return parseInt(stdout);
        }
        return 0;
    },
    setStopThreshold: function(value) {
        global.log("setStopThreshold " + value);
        [ret, stdout, stderr, status] = this._callTpacpiBat("-s SP", value);
        this.emit("stop-threshold-changed", value);
    },

    getInhibitCharge: function() {
        global.log("getInhibitCharge");

        [ret, stdout, stderr, status] = this._callTpacpiBat("-g IC");
        if (ret && status == 0) {
            return (stdout.toString().indexOf("yes") == 0);
        }
        return false;
    },
    setInhibitCharge: function(value) {
        global.log("setInhibitCharge " + value);
        [ret, stdout, stderr, status] = this._callTpacpiBat("-s IC", value ? 1 : 0);
        this.emit("inhibit-charge-changed", value);
    },

    getForceDischarge: function() {
        global.log("getForceDischarge");
        [ret, stdout, stderr, status] = this._callTpacpiBat("-g FD");
        if (ret && status == 0) {
            return (stdout.toString().indexOf("yes") == 0);
        }
        return true;
    },
    setForceDischarge: function(value) {
        global.log("setForceDischarge " + value);
        [ret, stdout, stderr, status] = this._callTpacpiBat("-s FD", value ? 1 : 0);
        this.emit("force-discharge-changed", value);
    },
});
Signals.addSignalMethods(BatteryControlACPI.prototype);
