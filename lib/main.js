var pageMod = require("sdk/page-mod");
var notifications = require("sdk/notifications");
var self = require("sdk/self");
var { MatchPattern } = require("sdk/util/match-pattern");

var owa_pattern = new MatchPattern(/http.?:\/\/.*\/owa\/.*/);

var notify_icon = self.data.url("owa_full.png");

pageMod.PageMod({
  include: /http.?:\/\/.*\/owa\/.*/,
  contentStyleFile: self.data.url("fix_style.css"),
  contentScriptWhen: 'ready',
  contentScriptFile: self.data.url("icon_notifications.js"),
  attachTo: ["existing", "top"],
  onAttach: function(worker) {
    worker.port.on("notify", function(count) {
      notifications.notify({
        text: "Notify!",
        iconURL: notify_icon
      });
      console.log("notify",count);
    });
  }
});
