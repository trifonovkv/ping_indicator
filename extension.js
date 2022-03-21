const St = imports.gi.St;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const GObject = imports.gi.GObject;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Config = imports.misc.config;
const Util = imports.misc.util;
const Gettext = imports.gettext.domain('gnome-shell-extension-pingindicator');
const _ = Gettext.gettext;

const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);
const PING_SETTINGS_SCHEMA = 'org.gnome.shell.extensions.pingindicator';
const PING_DESTINATION = 'ping-destination';
const REFRESH_INTERVAL = 'refresh-interval';
const BEEP_WHEN_TIMEOUT = 'beep-when-timeout';

const SOUND_FILE_PATH = '/usr/share/sounds/freedesktop/stereo/bell.oga';

const PingMenuButton = GObject.registerClass(
class PingMenuButton extends PanelMenu.Button {
    _init() {
        super._init(St.Align.START);
        this._loadConfig();

        this.buttonText = new St.Label({
            text: _("..."),
            y_align: Clutter.ActorAlign.CENTER
        });

        // Compatibility with gnome-shell >= 3.32
        if (SHELL_MINOR > 30) {
            this.add_actor(this.buttonText);
        }
        else {
            this.actor.add_actor(this.buttonText);
        }

        let item = new PopupMenu.PopupMenuItem(_("Settings"));
        item.connect('activate', Lang.bind(this, this._onPreferencesActivate));
        this.menu.addMenuItem(item);

        this._refresh();
    };

    _loadConfig() {
        this._settings = Convenience.getSettings(PING_SETTINGS_SCHEMA);
        this._settingsC = this._settings.connect("changed", Lang.bind(this, function() {
            this._refresh();
        }));
    };

    _onPreferencesActivate() {
        ExtensionUtils.openPrefs();
    };

    _loadData() {
        let success;
        this.command = ["ping", "-c 1", this._pingDestination];
        [success, this.child_pid, this.std_in, this.std_out, this.std_err] =
        GLib.spawn_async_with_pipes(
            null, 
            this.command, 
            null,
            GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
            null);

        if (!success) {
            return;
        }

        this.IOchannelIN = GLib.IOChannel.unix_new(this.std_in);
        this.IOchannelOUT = GLib.IOChannel.unix_new(this.std_out);
        this.IOchannelERR = GLib.IOChannel.unix_new(this.std_err);
        
        this.IOchannelIN.shutdown(false);        

        this.tagWatchChild = GLib.child_watch_add(GLib.PRIORITY_DEFAULT, this.child_pid,
            Lang.bind(this, function(pid, status, data) {
                GLib.source_remove(this.tagWatchChild);
                GLib.spawn_close_pid(pid);
                this.child_pid = undefined;
            })                
        );
        this.tagWatchOUT = GLib.io_add_watch(this.IOchannelOUT, GLib.PRIORITY_DEFAULT,
            GLib.IOCondition.IN | GLib.IOCondition.HUP,
            Lang.bind(this, this._loadPipeOUT)
        );
        this.tagWatchERR = GLib.io_add_watch(this.IOchannelERR, GLib.PRIORITY_DEFAULT,
            GLib.IOCondition.IN | GLib.IOCondition.HUP,
            Lang.bind(this, this._loadPipeERR)
        );
    };

    _loadPipeOUT(channel, condition, data) {
        if (condition != GLib.IOCondition.HUP) {
            let [size, out] = channel.read_to_end();
            let result = String.fromCharCode.apply(null, out).match(/(?<=\w=)\d+(?=(.\d+)?\s\w+$)/m);

            if(result != null) {
                let str = result[0];
                str = str.concat(_(" ms"));
                this.buttonText.set_text(str);
	    }
        }
        GLib.source_remove(this.tagWatchOUT);
        channel.shutdown(true);
    };

    _loadPipeERR(channel, condition, data) {
        if (condition != GLib.IOCondition.HUP) {
            this.buttonText.set_text(_("Error"));
        }
        GLib.source_remove(this.tagWatchERR);
        channel.shutdown(false);
    };

    get _pingDestination() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_string(PING_DESTINATION);
    };

    get _refreshInterval() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_int(REFRESH_INTERVAL);
    };

    get _playBeep() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_boolean(BEEP_WHEN_TIMEOUT);
    };

    _refresh() {
        this._removeTimeout();
        if (this.child_pid === undefined) {
            this._loadData();
        } else {
            this.buttonText.set_text(_('Waiting'));
            if (this._playBeep) {
              Util.trySpawnCommandLine('canberra-gtk-play -f ' + SOUND_FILE_PATH);
            }
        }
        this._timeout = Mainloop.timeout_add_seconds(this._refreshInterval,
            Lang.bind(this, this._refresh));
        return true;
    };

    _removeTimeout() {
        if (this._timeout !== undefined) {
            Mainloop.source_remove(this._timeout);
            this._timeout = undefined;
        }
    };

    stop() {
        this._removeTimeout();
        if (this._settingsC) {
            this._settings.disconnect(this._settingsC);
            this._settingsC = undefined;
        }
        this.menu.removeAll();
    };
});

let pingMenu;

function init() {
    log(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);
    Convenience.initTranslations('gnome-shell-extension-pingindicator');
}

function enable() {
    log(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);
    pingMenu = new PingMenuButton;
    Main.panel.addToStatusArea('ping-indicator', pingMenu);
}

function disable() {
    log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
    pingMenu.stop();
    pingMenu.destroy();
}
