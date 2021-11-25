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

const PingPrefsWidget = GObject.registerClass(
class PingPrefsWidget extends Gtk.Box {
    _init() {
        this._loadConfig();

        super._init({
            orientation: Gtk.Orientation.VERTICAL,
            margin_top: 20,
            margin_bottom: 20,
            margin_start: 20,
            margin_end: 20,
            spacing: 10,
        });

        let row = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
        });
        let label = new Gtk.Label({
            label: _("Interval, sec."),
        });
        let ad = new Gtk.Adjustment({
            lower: 1.0,
            step_increment: 1.0,
            upper: 86400.0,
            value: 1.0
        });
        let timeoutSpinButton = new Gtk.SpinButton({
            adjustment: ad,
            digits: 0
        });
        timeoutSpinButton.set_value(this._refreshInterval);
        row.append(label);
        row.append(timeoutSpinButton);
        this.append(row);

        row = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
        });
        label = new Gtk.Label({
            label: _("Destination, IP or URL")
        });
        let destinationEntry = new Gtk.Entry({
            text: this._pingDestination,
        });
        row.append(label);
        row.append(destinationEntry);
        this.append(row);

        row = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
        });
        label = new Gtk.Label({
            label: _("Beep signal when timeout")
        });
        let beepSwitch = new Gtk.Switch({
            active: this._playBeep
        });
        row.append(label);
        row.append(beepSwitch);
        this.append(row);

        row = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
        });
        let submitButton = new Gtk.Button({
            label: _("Submit")
        });
        submitButton.connect("clicked", Lang.bind(this, function() {
            this._refreshInterval = timeoutSpinButton.value;
            this._pingDestination = destinationEntry.text;
            this._playBeep = beepSwitch.active;
        }));
        row.append(submitButton);
        this.append(row);
    };

    _loadConfig() {
        this._settings = Convenience.getSettings(PING_SETTINGS_SCHEMA);
    };

    get _pingDestination() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_string(PING_DESTINATION);
    };

    set _pingDestination(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_string(PING_DESTINATION, v);
    };

    get _refreshInterval() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_int(REFRESH_INTERVAL);
    };

    set _refreshInterval(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_int(REFRESH_INTERVAL, v);
    };

    get _playBeep() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_boolean(BEEP_WHEN_TIMEOUT);
    };

    set _playBeep(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_boolean(BEEP_WHEN_TIMEOUT, v);
    };
});

function init() {
    Convenience.initTranslations('gnome-shell-extension-pingindicator');
}

function buildPrefsWidget() {
    return new PingPrefsWidget();
}
