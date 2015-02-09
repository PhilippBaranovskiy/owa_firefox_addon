var pageMod = require("sdk/page-mod");
var notifications = require("sdk/notifications");
var self = require("sdk/self");
var prefs = require('sdk/simple-prefs');
var notificationIconURL = self.data.url("owa_full.png");

pageMod.PageMod({
    include: /https?:\/\/.*\/owa\/.*/,
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
