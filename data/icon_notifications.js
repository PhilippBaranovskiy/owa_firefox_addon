var timer;
var currentUnreadMessageCount = 0;
var currentReminderCount = 0;
var documentTitle = document.title;
var owaIcon = getOwaIcon();
document.head.appendChild(owaIcon);


self.port.on("startMonitor", function(delayBetweenChecks) {
    if (timer) {
        clearInterval(timer);
    }
    if (delayBetweenChecks < 1) {
        delayBetweenChecks = 1;
    }
    timer = setInterval(notify, delayBetweenChecks * 5000);
});

self.port.on("detach", function() {
    tearDown();
});

function tearDown(){
    clearInterval(timer);
    setFavicon(0);
    addCountToDocumentTitle(0);
}

function getOwaIcon(){
    var owaIcon = document.createElement("link");
    owaIcon.rel = "icon";
    owaIcon.type = "image/png";
    owaIcon.sizes = "64x64";
    owaIcon.href = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAABvUlEQVQ4y6WTz0tUURTHP/e9N04MBqNJQRDYDKK5tEAINxHRsk24sWWL6G+wheImWriYaBVuRHMZGrVxIQ4pxRQtZiU5OjNU2nOycV6D8+bNPS7e/MAZfC38woUL55zPvffc71EiIpxDRlDw6NhjdeswEGA1Nrbjkso5fM47bO6USO6WKP+rgQjyciwY8OxDlpn3ebAMMFUrGjbA0/+/gWEoCJtnJi2nC8wm92mgy65mYSJGvC/SekJTIsQvXWDbPm7e5kexytr3IihAC28eDRDvi3Q20VBwMH2LufEYrx72g/Y/SIkGV3Pn+kXKz0dJZoosff19uokAD4Z7SKz/YupdnsKLUZ4uZiBk8GTsKiPXuukOm8RmvrBX9Lg7EO0EWKbCd4WgRQB/JdZ/svTNZmPbgZAByo+0AYS36UNeT9/k3mCU+ZQNYQu0xjIVG9myX1yX6gQoqlromUzR39tFxq74TdRQ9QQqtVaVJyhF5xMANJD5457yw+PbV7h/I9oEiMDQ5UgLUNP1E9qNVFckZDJYL2iXagxT7m+FVK7Ep6zDx90Sm1kH7WrfyomzrYwEaO+oIivpQlCKqPOO8wknR+1GRWhuAQAAAABJRU5ErkJggg==";
    return owaIcon;
}

function drawRoundedRectangle(ctx, x, y, width, height, radius){
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    ctx.strokeStyle = "#aaaaaa";
    ctx.stroke();
    ctx.fillStyle = "#aaaaaa";
    ctx.fill();
}
function addTextToFavicon(ctx){
    ctx.font = "bold 40px Arial";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    var number = getPrettyNumber(getNewUnreadMessageCount());
    var numberString = (number >= 99) ? new String(number + "+") : new String(number);
    ctx.fillText(numberString, 40,15);
}

function drawIcon(){
    var canvas; 
    var context; 
    canvas = document.createElement("canvas");
    canvas.width = 75;
    canvas.height = 75;

    context = canvas.getContext("2d");
    drawRoundedRectangle(context, 0, 0, 75, 70, 30);
    addTextToFavicon(context);
    return canvas;
}

function generateTabIcon(unreadMessageCount, isAlreadyDisplayed){

    var canvas;
    if (true) {
        canvas = drawIcon();
    }
    return canvas.toDataURL("image/png");
}

function getBase64Icon(number) {
    var number = getPrettyNumber(number);
    return (number) ? generateTabIcon(number) : generateTabIcon(number, true);
}

function getPrettyNumber(number){
    var num = number;
    if (!number){
        num = 0;
    } else if (number > 99){
        num = 99;
    }
    return num;
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

function addCountToDocumentTitle(count) {
    document.title = (count === undefined || count == 0) ? "" : "(" + count + ") - " + documentTitle;
}

function getCountBasedOffFolders(folders){
    var count = 0;
    for (var folderIndex = folders.length-1 ; folderIndex >= 0; folderIndex--){
        var activeCounts = getItemsWithActiveCount(folders[folderIndex]);
        for (var activeCountIndex = activeCounts.length-1; activeCountIndex >= 0; activeCountIndex--){
            count += getCountFromHTML(activeCounts[activeCountIndex]);
        }
    }
    return count;
}

function getCountBasedOffSpans(spanContainer){
    var count = 0;
    for (var spanContainerIndex = spanContainer.length-1; spanContainerIndex >= 0 ; spanContainerIndex--){
        count += getCountFromHTML(spanContainer[spanContainerIndex]);
    }
    return count;
}

function getCountFromHTML(container){
    return parseInt(container.innerHTML.match(/\d/gi).join(""), 10);
}

function getFolders (){
    return document.querySelectorAll("[aria-label='Folder Pane']");
}

function getItemsWithActiveCount(folder){
    return folder.querySelectorAll("[id*='.ucount']");
}

function getContainersBySpanId(){
    //Selecting an based off id will return 1 item (or should)
    var containers = document.querySelectorAll('#spnCV');
    var spans = [];
    for(var containerIndex = containers.length-1; containerIndex >= 0; containerIndex--) {
        var folderName = containers[containerIndex].parentNode.parentNode.querySelector('#spnFldrNm').getAttribute("fldrnm");
        // Can be used to check for other folder names also
        if(folderName == "Unread Mail") {
            spans.push(containers[containerIndex]);
        }
    }
    return spans;
}

function getNewReminderCount(){
    //OWA check
    var reminderCount;
    var containers = document.querySelectorAll('[aria-label="New Notification"]');
    if (containers.length > 2){
        reminderCount = parseInt(containers[3].title.match(/\d/gi).join(""));
    } else {
        //365 check
        containers = document.getElementsByClassName('o365cs-notifications-notificationCounter');
        if (containers[0]){
            reminderCount = parseInt(containers[0].innerHTML.match(/\d/gi).join(""));
        }
    }
    return (reminderCount - currentReminderCount);
}

function haveNewReminders(){
    return ( getNewReminderCount() > currentReminderCount );
}

function haveNewMessages(){
    return ( getNewUnreadMessageCount() > currentUnreadMessageCount);
}

function getNewUnreadMessageCount() {
    var newUnreadMessageCount = 0;
    var folders = getFolders();
    if (folders.length > 0) {
        newUnreadMessageCount = getCountBasedOffFolders(folders);
    } else {
        newUnreadMessageCount = getCountBasedOffSpans(getContainersBySpanId());
    }
    return newUnreadMessageCount - currentUnreadMessageCount;
}

function generateMessage(count, isMessage){
    var message = "";
    if (isMessage){
        message = "You have " + count + " new " + ((count > 1) ? " messages" : " message") + ".";
    } else {
        message = "You have " + count + " new " + ((count > 1) ? " reminders" : " reminder") + ".";
    }
    return message;
}

function notify() {
    if (haveNewMessages()) {
        var newUnreadMessageCount = getNewUnreadMessageCount();
        setFavicon(newUnreadMessageCount); // Probably unnecessary since you alter the document title. 
        addCountToDocumentTitle(newUnreadMessageCount);
        self.port.emit("notify", generateMessage(newUnreadMessageCount, true));
        currentUnreadMessageCount = newUnreadMessageCount;
    }
    if (haveNewReminders()){
        var newReminderCount = getNewReminderCount();
        self.port.emit("notify", generateMessage(newReminderCount, false));
        currentReminderCount = newReminderCount;
    }
}