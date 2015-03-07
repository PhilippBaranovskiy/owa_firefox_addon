var pageMod = require("sdk/page-mod");
var notifications = require("sdk/notifications");
var self = require("sdk/self");
var prefs = require('sdk/simple-prefs');
var notificationIconURL = self.data.url("owa_full.png");

var { MatchPattern } = require("sdk/util/match-pattern");
var owaUrlPattern = new RegExp('https?:\/\/.*\/owa\/.*', 'i');

pageMod.PageMod({
	include: [
		owaUrlPattern,
		'http://nope.philipp.ninja/owa/testing'
	],
    contentStyleFile: self.data.url("fix_style.css"),
    contentScriptWhen: 'ready',
    contentScriptFile: self.data.url("icon_notifications.js"),
    attachTo: ["existing", "top"],
    onAttach: function(worker) {
        worker.port.on("notify", function(message) {
            notifications.notify({
                text: message,
                iconURL: notificationIconURL,
                onClick: function() {
                    worker.tab.activate();
                }
            });
        });
        prefs.on("delayBetweenChecks", function(prefName) {
            worker.port.emit("startMonitor", prefs.prefs.delayBetweenChecks);
        });
        worker.port.emit("startMonitor", prefs.prefs.delayBetweenChecks);
    }
});