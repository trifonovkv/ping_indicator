# Ping Indicator
![screenshot](https://github.com/trifonovkv/ping_indicator/blob/master/screenshot.png)  

## Troubleshooting

Try the following:

1. Try to manually install the extension:

  ```
cd ~/.local/share/gnome-shell/extensions/
rm -rf ping_indicator@trifonovkv.gmail.com/
wget https://github.com/trifonovkv/ping_indicator/releases/download/v20/ping_indicator@trifonovkv.gmail.com.zip
unzip ping_indicator@trifonovkv.gmail.com.zip -d ping_indicator@trifonovkv.gmail.com
rm ping_indicator@trifonovkv.gmail.com.zip
```

2. Check for Gnome Shell errors with `sudo journalctl -f` or `tail -f ~.xsession-errors`.
3. Check for errors using Gnome Looking Glass: Alt+F2 > Type `lg` > Extensions.
4. Check if the extension is listed as installed: `gnome-extensions list`.
5. Run `gnome-tweaks` (install using `sudo apt-get install gnome-tweaks`), go to Extensions and make sure they are enabled.

## Development

```
cd ~/.local/share/gnome-shell/extensions
git clone git@github.com:trifonovkv/ping_indicator.git ping_indicator@trifonovkv.gmail.com
cd ping_indicator@trifonovkv.gmail.com/

# Hack-hack-hack, then:
dbus-run-session -- gnome-shell --nested --wayland
```
