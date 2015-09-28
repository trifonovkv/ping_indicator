const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Lang = imports.lang;
const Gettext = imports.gettext.domain('gnome-shell-extension-pingindicator');
const _ = Gettext.gettext;

const PING_SETTINGS_SCHEMA = 'org.gnome.shell.extensions.pingindicator';
const PING_DESTINATION = 'ping-destination';
const REFRESH_INTERVAL = 'refresh-interval';
const BEEP_WHEN_TIMEOUT = 'beep-when-timeout';

function init() {
    Convenience.initTranslations('gnome-shell-extension-pingindicator');
}

const PingPrefsWidget = new GObject.Class({
    Name: 'PingIndicatorExtension.Prefs.Widget',
    GTypeName: 'PingIndicatorExtensionPrefsWidget',
    Extends: Gtk.Grid,

    _init: function(params) {
        this._loadConfig();
        this.parent(params);
        this.margin = 20;
        this.row_spacing = this.column_spacing = 10;
        this.set_orientation(Gtk.Orientation.VERTICAL);

        let hbox = new Gtk.HBox({
            homogeneous: true
        });
        let label = new Gtk.Label({
            label: _("Interval, sec."),
            halign: Gtk.Align.CENTER
        });
        let ad = new Gtk.Adjustment({
            lower: 1.0,
            step_increment: 1.0,
            upper: 86400.0,
            value: 1.0
        });
        let spinButton = new Gtk.SpinButton({
            adjustment: ad,
            digits: 0
        });
        spinButton.set_value(this._refreshInterval);
        spinButton.connect("value_changed", Lang.bind(this, function() {
            this._refreshInterval = spinButton.value;
        }));
        hbox.pack_start(label, false, false, 50);
        hbox.pack_end(spinButton, false, false, 50);
        this.add(hbox);

        let hbox = new Gtk.HBox({
            homogeneous: true
        });
        let label = new Gtk.Label({
            label: _("Destination, IP or URL")
        });

        this._entry = new Gtk.Entry({
            text: this._pingDestination,
            halign: Gtk.Align.CENTER
        });
        this._entry.connect("activate", Lang.bind(this, function() {
            this._pingDestination = this._entry.text;
        }));

        hbox.pack_start(label, false, false, 50);
        hbox.pack_end(this._entry, false, false, 50);
        this.add(hbox);

        let hbox = new Gtk.HBox({
            homogeneous: true
        });
        let label = new Gtk.Label({
            label: _("Beep signal when timeout")
        });

        this._switch = new Gtk.Switch({
            active: this._playBeep,
            halign: Gtk.Align.CENTER
        });
        this._switch.connect("state_changed", Lang.bind(this, function() {
            this._playBeep = this._switch.active;
        }));

        hbox.pack_start(label, false, false, 50);
        hbox.pack_end(this._switch, false, false, 50);
        this.add(hbox);
    },

    _loadConfig: function() {
        this._settings = Convenience.getSettings(PING_SETTINGS_SCHEMA);
    },

    get _pingDestination() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_string(PING_DESTINATION);
    },

    set _pingDestination(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_string(PING_DESTINATION, v);
    },

    get _refreshInterval() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_int(REFRESH_INTERVAL);
    },

    set _refreshInterval(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_int(REFRESH_INTERVAL, v);
    },

    get _playBeep() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_boolean(BEEP_WHEN_TIMEOUT);
    },

    set _playBeep(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_boolean(BEEP_WHEN_TIMEOUT, v);
    },

});

function buildPrefsWidget() {
    let widget = new PingPrefsWidget();
    widget.show_all();
    return widget;
}
