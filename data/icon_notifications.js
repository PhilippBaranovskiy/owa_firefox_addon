var prev_unread_messages = 0;

var owa_icon = document.createElement("link");
owa_icon.rel = "icon";
owa_icon.type = "image/png";
owa_icon.sizes = "64x64";
owa_icon.href = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAABvUlEQVQ4y6WTz0tUURTHP/e9N04MBqNJQRDYDKK5tEAINxHRsk24sWWL6G+wheImWriYaBVuRHMZGrVxIQ4pxRQtZiU5OjNU2nOycV6D8+bNPS7e/MAZfC38woUL55zPvffc71EiIpxDRlDw6NhjdeswEGA1Nrbjkso5fM47bO6USO6WKP+rgQjyciwY8OxDlpn3ebAMMFUrGjbA0/+/gWEoCJtnJi2nC8wm92mgy65mYSJGvC/SekJTIsQvXWDbPm7e5kexytr3IihAC28eDRDvi3Q20VBwMH2LufEYrx72g/Y/SIkGV3Pn+kXKz0dJZoosff19uokAD4Z7SKz/YupdnsKLUZ4uZiBk8GTsKiPXuukOm8RmvrBX9Lg7EO0EWKbCd4WgRQB/JdZ/svTNZmPbgZAByo+0AYS36UNeT9/k3mCU+ZQNYQu0xjIVG9myX1yX6gQoqlromUzR39tFxq74TdRQ9QQqtVaVJyhF5xMANJD5457yw+PbV7h/I9oEiMDQ5UgLUNP1E9qNVFckZDJYL2iXagxT7m+FVK7Ep6zDx90Sm1kH7WrfyomzrYwEaO+oIivpQlCKqPOO8wknR+1GRWhuAQAAAABJRU5ErkJggg==";
document.head.appendChild(owa_icon);

var img = document.createElement("img");
img.src = owa_icon.href;

var current_icon_number = 0;

function generate_icon(number, clear) {
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

function get_base64_icon(number) {
  
  if (!number)
    number = 0;
  else if (number > 99)
    number = "99";
  var icon;
  
  if (number != 0)
    icon = generate_icon(number);
  else
    icon = generate_icon(number, true);
        
  current_icon_number = number;
  
  return icon;
}

function set_favicon(count) {
  var icon = get_base64_icon(count);
  var s = document.querySelectorAll("link[rel*='icon'][type='image/png']");

  if (s.length != 1 || s[0].href != "data:image/png;base64,"+icon) {
    for(var i = s.length-1; i >= 0; i--){
      s[i].remove();
    }
    owa_icon.href = icon;
    document.head.appendChild(owa_icon);
  }
}

function countIt(unread_container) {
  var count = 0;
  for(var u_node = unread_container.length-1; u_node>=0; u_node--) {
    count += parseInt(unread_container[u_node].innerHTML.match(/\d/gi).join(""), 10);
  }
  return count;
}
  
function countUnreadMessages() {
  var unread_container;
  var count = 0;

  var folder_panes = document.querySelectorAll("[aria-label='Folder Pane']");
  if (folder_panes.length > 0) {
    for(var pane = folder_panes.length-1; pane >= 0; pane--){
      unread_container = folder_panes[pane].querySelectorAll("[id*='.ucount']");
      count = countIt(unread_container);
    }
  } else {
    unread_container = document.querySelectorAll('#spnCV');
    count = countIt(unread_container);
  }
  return count;
}

function notify() {
  var count = countUnreadMessages();
  if (count != prev_unread_messages) {
	set_favicon(count);
	if (count > prev_unread_messages) {
	  self.port.emit("notify", count - prev_unread_messages);
    }
  }
  prev_unread_messages = count;
}

setInterval(notify, 1000);
