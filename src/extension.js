const Lang = imports.lang;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Util = imports.misc.util;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
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
        this._container.add(this._label, {row: 0, col: 0, x_expand: true});

        // force minimum width to the widest text we will display
        this._valueLabel = new St.Label({text: "100"});
        this._valueLabel.set_width(this._valueLabel.get_width());
        this._valueLabel.get_clutter_text().set_x_align(Clutter.ActorAlign.END);
        this.onValueChanged(this, value);
        this._container.add(this._valueLabel, {row: 0, col: 1, x_expand: false});
        
        this.connect("value-changed", Lang.bind(this, this.onValueChanged));
        this._container.add(this._slider, {row: 0, col: 2, x_fill: true});
        this.addActor(this._container, {span: -1, expand: true});
    },    
    onValueChanged: function(sender, value) {
        this._valueLabel.set_text(Math.round(value * 100).toString());
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
        menuEntry.menu.tpbatStartThresh = new PopupLabeledSliderMenuItem("Start Threshold", 0.3);
        menuEntry.menu.tpbatStartThresh.connect("value-changed",
            Lang.bind(this, function(sender, value) {
                model.setStartThreshold(Math.round(value * 100));
            }));
        
        menuEntry.menu.addMenuItem(menuEntry.menu.tpbatStartThresh);
        menuEntry.menu.tpbatStopThresh = new PopupLabeledSliderMenuItem("Stop Threshold", 0.3);
        menuEntry.menu.addMenuItem(menuEntry.menu.tpbatStopThresh);
        menuEntry.menu.tpbatStopThresh.connect("value-changed",
            Lang.bind(this, function(sender, value) {
                model.setStopThreshold(Math.round(value * 100));
            }));

        menuEntry.menu.tpbatInhibitCharge = new PopupMenu.PopupSwitchMenuItem("Inhibit Charge");
        // monkey-patch activate function to keep menu open after toggling
        // function body taken from popupMenu.js:797
        menuEntry.menu.tpbatInhibitCharge.activate =
            Lang.bind(menuEntry.menu.tpbatInhibitCharge, function(event) {
                if (this._switch.actor.mapped) {
                    this.toggle();
                }
            });
        menuEntry.menu.addMenuItem(menuEntry.menu.tpbatInhibitCharge);
        menuEntry.menu.tpbatInhibitCharge.connect("toggled",
            Lang.bind(this, function(sender, value) {
                model.setInhibitCharge(value);
            }));
        
        menuEntry.menu.tpbatForceDischarge = new PopupMenu.PopupSwitchMenuItem("Force Discharge");
        // monkey-patch activate function to keep menu open after toggling
        // function body taken from popupMenu.js:797
        menuEntry.menu.tpbatForceDischarge.activate =
            Lang.bind(menuEntry.menu.tpbatForceDischarge, function(event) {
                if (this._switch.actor.mapped) {
                    this.toggle();
                }
            });
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


