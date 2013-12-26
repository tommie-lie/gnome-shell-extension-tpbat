const Lang = imports.lang;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Util = imports.misc.util;
const St = imports.gi.St;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const BatteryControl = Me.imports.batteryControl;


const PopupLabeledSliderMenuItem = new Lang.Class({
    Name: "PopupLabeledSliderMenuItem",
    Extends: PopupMenu.PopupSliderMenuItem,
    
    _init: function(text, value) {
        this.parent(value);
        
        this.removeActor(this._slider);
        
        this._container = new St.Table();
        this._label = new St.Label({text: text});
        this._container.add(this._label, {row: 0, col: 0});
        this._container.add(this._slider, {row: 0, col: 1});
        this.addActor(this._container, {span: 2, expand: true});
    }
});


const TpBat = new Lang.Class({
    Name: "tpbat",

    _init: function() {
        this.batCtls = [];
    },
    destroy: function() {
        this.emit("destroy");
    },
    enable: function() {
        global.log("enable");
        
        // TODO: detect wether ACPI or SMAPI should be used
        // TODO: detect which batteries are actually available
        let batCtl1 = new BatteryControl.BatteryControlACPI();
        this.batCtls.push({view: this.createBatterySubmenu("Battery 1", batCtl1), model: batCtl1});
        let batCtl2 = new BatteryControl.BatteryControlACPI();
        this.batCtls.push({view: this.createBatterySubmenu("Battery 2", batCtl2), model: batCtl2});
        
        let PowerIndicator = Main.panel.statusArea.battery;
        
        this.batCtls.forEach(Lang.bind(this, function(ctl) {
            PowerIndicator.menu.addMenuItem(ctl.view);
        }));
    },
    disable: function() {
        global.log("disable");
        while (this.batCtls.length > 0) {
            let it = this.batCtls.pop();
            it.view.destroy();
        }
        if (this._slider) {
            this._slider.destroy();
            this._slider = null;
        }
    },
    createBatterySubmenu: function(title, model) {
        let menuEntry = new PopupMenu.PopupSubMenuMenuItem(title);
        menuEntry.menu.tpbatStartThresh = new PopupLabeledSliderMenuItem("Start Thrsh.", 0.3);
        menuEntry.menu.tpbatStartThresh.connect("value-changed",
            Lang.bind(this, function(sender, value) {
                model.setStartThreshold(Math.round(value * 100));
            }));
        
        menuEntry.menu.addMenuItem(menuEntry.menu.tpbatStartThresh);
        menuEntry.menu.tpbatStopThresh = new PopupLabeledSliderMenuItem("Stop Thrsh.", 0.3);
        menuEntry.menu.addMenuItem(menuEntry.menu.tpbatStopThresh);
        menuEntry.menu.tpbatStopThresh.connect("value-changed",
            Lang.bind(this, function(sender, value) {
                model.setStopThreshold(Math.round(value * 100));
            }));


        menuEntry.menu.tpbatInhibitCharge = new PopupMenu.PopupSwitchMenuItem("Inhibit Charge");
        menuEntry.menu.addMenuItem(menuEntry.menu.tpbatInhibitCharge);
        menuEntry.menu.tpbatInhibitCharge.connect("toggled",
            Lang.bind(this, function(sender, value) {
                model.setInhibitCharge(value);
            }));
        
        menuEntry.menu.tpbatForceDischarge = new PopupMenu.PopupSwitchMenuItem("Force Discharge");
        menuEntry.menu.addMenuItem(menuEntry.menu.tpbatForceDischarge);
        menuEntry.menu.tpbatForceDischarge.connect("toggled",
            Lang.bind(this, function(sender, value) {
                model.setForceDischarge(value);
            }));
        
        return menuEntry;
    }
});



function init() {
    return new TpBat();
}


