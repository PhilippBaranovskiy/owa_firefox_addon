var timer;
var unreadMessages = 0;
var documentTitle = document.title;

var owaIcon = document.createElement("link");
owaIcon.rel = "icon";
owaIcon.type = "image/png";
owaIcon.sizes = "64x64";
owaIcon.href = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAABvUlEQVQ4y6WTz0tUURTHP/e9N04MBqNJQRDYDKK5tEAINxHRsk24sWWL6G+wheImWriYaBVuRHMZGrVxIQ4pxRQtZiU5OjNU2nOycV6D8+bNPS7e/MAZfC38woUL55zPvffc71EiIpxDRlDw6NhjdeswEGA1Nrbjkso5fM47bO6USO6WKP+rgQjyciwY8OxDlpn3ebAMMFUrGjbA0/+/gWEoCJtnJi2nC8wm92mgy65mYSJGvC/SekJTIsQvXWDbPm7e5kexytr3IihAC28eDRDvi3Q20VBwMH2LufEYrx72g/Y/SIkGV3Pn+kXKz0dJZoosff19uokAD4Z7SKz/YupdnsKLUZ4uZiBk8GTsKiPXuukOm8RmvrBX9Lg7EO0EWKbCd4WgRQB/JdZ/svTNZmPbgZAByo+0AYS36UNeT9/k3mCU+ZQNYQu0xjIVG9myX1yX6gQoqlromUzR39tFxq74TdRQ9QQqtVaVJyhF5xMANJD5457yw+PbV7h/I9oEiMDQ5UgLUNP1E9qNVFckZDJYL2iXagxT7m+FVK7Ep6zDx90Sm1kH7WrfyomzrYwEaO+oIivpQlCKqPOO8wknR+1GRWhuAQAAAABJRU5ErkJggg==";
document.head.appendChild(owaIcon);

var img = document.createElement("img");
img.src = owaIcon.href;

function generateIcon(number, clear) {
  number = new String(number);

  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");

  ctx.drawImage(img, 0,0);

  if (!clear) {
    (function(context, x, y, w, h, radius) {
      var r = x + w;
      var b = y + h;
      context.beginPath();
      context.fillStyle = "red";
      context.lineWidth="1";
      context.moveTo(x+radius, y);
      context.lineTo(r-radius, y);
      context.quadraticCurveTo(r, y, r, y+radius);
      context.lineTo(r, y+h-radius);
      context.quadraticCurveTo(r, b, r-radius, b);
      context.lineTo(x+radius, b);
      context.quadraticCurveTo(x, b, x, b-radius);
      context.lineTo(x, y+radius);
      context.quadraticCurveTo(x, y, x+radius, y);
      context.fill();
    })(ctx, 2, -2, 16, 14, 0);

    ctx.font = "bold 10px Arial";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(number, 9,2);
  }

  return canvas.toDataURL("image/png");
}

function getBase64Icon(number) {
  if (!number) {
    number = 0;
  } else if (number > 99) {
    number = "99";
  }
  var icon;
  if (number != 0) {
    icon = generateIcon(number);
  } else {
    icon = generateIcon(number, true);
  }
  return icon;
}

function setFavicon(count) {
  var icon = getBase64Icon(count);
  var s = document.querySelectorAll("link[rel*='icon'][type='image/png']");

  if (s.length != 1 || s[0].href != icon) {
    for(var i = s.length-1; i >= 0; i--){
      s[i].remove();
    }
    owaIcon.href = icon;
    document.head.appendChild(owaIcon);
  }
}

function setDocumentTitle(count) {
  var countPrefix = "";
  if (count > 0) {
    countPrefix = "(" + count + ") ";
  }
  document.title = countPrefix + documentTitle;
}

function countIt(unreadContainer) {
  var count = 0;
  for(var u_node = unreadContainer.length-1; u_node>=0; u_node--) {
    count += parseInt(unreadContainer[u_node].innerHTML.match(/\d{1,} unread/gi).join(""), 10);
  }
  return count;
}

function countUnreadMessages() {
  var unreadContainer;
  var count = 0;

  var folder_panes = document.querySelectorAll("[aria-label='Folder Pane']");
  if (folder_panes.length > 0) {
    for(var pane = folder_panes.length-1; pane >= 0; pane--){
      unreadContainer = folder_panes[pane].querySelectorAll("[id*='.ucount']");
      count = countIt(unreadContainer);
    }
  } else {
    unreadContainer = document.querySelectorAll('#spnCV');
    var subSetunreadContainer = [];
    for(var u_node = unreadContainer.length-1; u_node>=0; u_node--) {
        var container = unreadContainer[u_node];
        var folderName = container.parentNode.parentNode.querySelector('#spnFldrNm').getAttribute("fldrnm");
        // Can be used to check for other folder names also
        if(folderName == "Unread Mail") {
            subSetunreadContainer.push(container);
        }
    }
    count = countIt(subSetunreadContainer);
  }
  return count;
}

function notify() {
  var count = countUnreadMessages();
  if (count != unreadMessages) {
    setFavicon(count);
    setDocumentTitle(count);
    if (count > unreadMessages) {
      self.port.emit("notify", count - unreadMessages);
    }
  }
  unreadMessages = count;
}

self.port.on("startMonitor", function(delayBetweenChecks) {
  if (timer) {
    clearInterval(timer);
  }
  if (delayBetweenChecks < 1) {
    delayBetweenChecks = 1;
  }
  timer = setInterval(notify, delayBetweenChecks * 1000);
});

self.port.on("detach", function() {
  clearInterval(timer);
  setFavicon(0);
  setDocumentTitle(0);
});

