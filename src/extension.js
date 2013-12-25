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
    },
    destroy: function() {
        this.emit("destroy");
    },
    enable: function() {
        global.log("asdf");

        let PowerIndicator = Main.panel.statusArea.battery;

        this._slider = new PopupLabeledSliderMenuItem("hello", 0.3);
        PowerIndicator.menu.addMenuItem(this._slider);
    },
    disable: function() {
        global.log("fdsa");
        if (this._slider) {
            this._slider.destroy();
            this._slider = null;
        }
    }
});



function init() {
    return new TpBat();
}


