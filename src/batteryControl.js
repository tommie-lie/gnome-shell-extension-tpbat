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
        [ret, stdout, stderr, status] = this._callTpacpiBat("-g ST");
        if (ret && status == 0) {
            // first number in out string is percentage, parseInt stops at first non-number
            ret = parseInt(stdout);
            // be symetrical to setStartThreshold: 0 means 100
            if (ret == 0) {
                ret = 100;
            }
            return ret;
        }
        return 0;
    },
    setStartThreshold: function(value) {
        // A start theshold of 100 would mean "start immediately" which
        // the controller actually maps to 0.
        if (value > 99) {
            value = 0;
        }
        [ret, stdout, stderr, status] = this._callTpacpiBat("-s ST", value);
        this.emit("start-threshold-changed", value);
    },

    getStopThreshold: function() {
        [ret, stdout, stderr, status] = this._callTpacpiBat("-g SP");
        if (ret && status == 0) {
            // first number in out string is percentage, parseInt stops at first non-number
            ret = parseInt(stdout);
            // be symetrical to setStopThreshold: 0 means 100
            if (ret == 0) {
                ret = 100;
            }
            return ret;
        }
        return 0;
    },
    setStopThreshold: function(value) {
        // A stop threshold of 100 would mean "charge until full" which
        // the controller actually maps to 0.
        if (value > 99) {
            value = 0;
        }
        [ret, stdout, stderr, status] = this._callTpacpiBat("-s SP", value);
        this.emit("stop-threshold-changed", value);
    },

    getInhibitCharge: function() {
        [ret, stdout, stderr, status] = this._callTpacpiBat("-g IC");
        if (ret && status == 0) {
            return (stdout.toString().indexOf("yes") == 0);
        }
        return false;
    },
    setInhibitCharge: function(value) {
        [ret, stdout, stderr, status] = this._callTpacpiBat("-s IC", value ? 1 : 0);
        this.emit("inhibit-charge-changed", value);
    },

    getForceDischarge: function() {
        [ret, stdout, stderr, status] = this._callTpacpiBat("-g FD");
        if (ret && status == 0) {
            return (stdout.toString().indexOf("yes") == 0);
        }
        return true;
    },
    setForceDischarge: function(value) {
        [ret, stdout, stderr, status] = this._callTpacpiBat("-s FD", value ? 1 : 0);
        this.emit("force-discharge-changed", value);
    },
});
Signals.addSignalMethods(BatteryControlACPI.prototype);
