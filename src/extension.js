const Lang = imports.lang;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Util = imports.misc.util;
const St = imports.gi.St;
const Me = imports.misc.extensionUtils.getCurrentExtension();


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
        this.batCtlViews = [];
    },
    destroy: function() {
        this.emit("destroy");
    },
    enable: function() {
        global.log("enable");
        
        // TODO: detect which batteries are actually available
        this.batCtlViews.push(this.createBatterySubmenu("Battery 1"));
        this.batCtlViews.push(this.createBatterySubmenu("Battery 2"));
        
        let PowerIndicator = Main.panel.statusArea.battery;
        
        this.batCtlViews.forEach(Lang.bind(this, function(m) {
            PowerIndicator.menu.addMenuItem(m);
        }));
    },
    disable: function() {
        global.log("disable");
        while (this.batCtlViews.length > 0) {
            let it = this.batCtlViews.pop();
            it.destroy();
        }
        if (this._slider) {
            this._slider.destroy();
            this._slider = null;
        }
    },
    createBatterySubmenu: function(title) {
        let menuEntry = new PopupMenu.PopupSubMenuMenuItem(title);
        menuEntry.menu.tpbatStartThresh = new PopupLabeledSliderMenuItem("Start Thrsh.", 0.3);
        menuEntry.menu.addMenuItem(menuEntry.menu.tpbatStartThresh);
        menuEntry.menu.tpbatStopThresh = new PopupLabeledSliderMenuItem("Stop Thrsh.", 0.3);
        menuEntry.menu.addMenuItem(menuEntry.menu.tpbatStopThresh);

        menuEntry.menu.tpbatInhibitCharge = new PopupMenu.PopupSwitchMenuItem("Inhibit Charge");
        menuEntry.menu.addMenuItem(menuEntry.menu.tpbatInhibitCharge);
        menuEntry.menu.tpbatForceDischarge = new PopupMenu.PopupSwitchMenuItem("Force Discharge");
        menuEntry.menu.addMenuItem(menuEntry.menu.tpbatForceDischarge);

        return menuEntry;
    }
});



function init() {
    return new TpBat();
}


