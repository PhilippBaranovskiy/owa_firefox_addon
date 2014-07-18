var pageMod = require("sdk/page-mod");
var notifications = require("sdk/notifications");
var self = require("sdk/self");
var { MatchPattern } = require("sdk/util/match-pattern");

var owa_pattern = new MatchPattern(/https:\/\/.*\/owa\/.*/);

var notify_icon = self.data.url("owa_full.png");

function get_first_owa_tab() {
  var tabs = require("sdk/tabs");
  for each (var tab in tabs) {
    if (owa_pattern.test(tab.url)) {
      return tab;
      break;
    }
  }
}

pageMod.PageMod({
  include: /http.?:\/\/.*\/owa\/.*/,
  contentStyleFile: self.data.url("fix_style.css"),
  contentScriptWhen: 'ready',
  contentScriptFile: self.data.url("icon_notifications.js"),
  attachTo: ["existing", "top"],
  onAttach: function(worker) {
    
    worker.port.on("notify", function(count) {
      var mess = "";
      if (count > 1) {
        mess = "messages";
      } else {
        mess = "message";
      }
      if (count > 0) {
        notifications.notify({
          text: "You have " + count + " new " + mess,
          iconURL: notify_icon,
          onClick: function(){
            get_first_owa_tab().activate();
          }
        });
      }
    });
    
    get_first_owa_tab().on("activate", function(tab){
      worker.port.emit("activated");
    });
    
    get_first_owa_tab().on("deactivate", function(tab){
      worker.port.emit("deactivated");
    });

  }
});
