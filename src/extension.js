const Lang = imports.lang;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Util = imports.misc.util;
const St = imports.gi.St;
const Me = imports.misc.extensionUtils.getCurrentExtension();


const TpBat = new Lang.Class({
    Name: "tpbat",

    _init: function() {
    },
    destroy: function() {
        this.emit("destroy");
    },
    enable: function() {
        global.log("asdf");
    },
    disable: function() {
        global.log("fdsa");
    }
});



function init() {
    return new TpBat();
}


