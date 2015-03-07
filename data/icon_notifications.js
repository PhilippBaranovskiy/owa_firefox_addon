var timer;
var currentUnreadMessageCount = 0;
var currentReminderCount = 0;
var documentTitle = document.title;
var owaIcon = getOwaIcon();
if (document.head) {
	document.head.appendChild(owaIcon);
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
function addTextToFavicon(ctx, count){
	ctx.font = "bold 40px Arial";
	ctx.textBaseline = "top";
	ctx.textAlign = "center";
	ctx.fillStyle = "black";
	var number = getPrettyNumber(count || 0);
	var numberString = (number >= 99) ? new String(number + "+") : new String(number);
	ctx.fillText(numberString, 40,15);
}

function drawIcon(count){
	var canvas; 
	var context; 
	canvas = document.createElement("canvas");
	canvas.width = 75;
	canvas.height = 75;

	context = canvas.getContext("2d");
	drawRoundedRectangle(context, 0, 0, 75, 70, 30);
	addTextToFavicon(context, count);
	return canvas.toDataURL("image/png");
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
	var icon = drawIcon(count);
	var s = document.querySelectorAll("link[rel*='icon'][type='image/png']");

	if (s.length != 1 || s[0].href != icon) {
		for(var i = s.length-1; i >= 0; i--){
			s[i].remove();
		}

		owaIcon.href = icon;
		try {
			document.head.appendChild(owaIcon);
		} catch (exp) {
			console.error(exp);
		}
	}
}

function addCountToDocumentTitle(counts) {
	var title = [];
	if ( !counts.messages ) {
		title.push(counts.messages);
	}
	if ( !counts.reminders ) {
		title.push(counts.reminders);
	}
	if (title.length) {
		title = title.join(' / ') + ' — ';
	}
	document.title = title + documentTitle;
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
		count += getCountFromHTML2010(spanContainer[spanContainerIndex]);
	}
	return count;
}

function getCountFromHTML(container){
	var amountArr = container.innerHTML.match(/\d{1,} unread/gi);
	var count = 0;
	if ( Array.isArray(amountArr) ) {
		count += parseInt(amountArr[0], 10);
	}
	return count;
}

// OWA 2010 version support:
function getCountFromHTML2010(container){
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

function noMinus(count) {
	return count < 0 ? 0 : count;
}

function haveNewReminders(){
	return Boolean(getNewReminderCount());
}

function getNewReminderCount() {
	return noMinus( getReminderCount() - currentReminderCount );
}

function getReminderCount(){
	//OWA check
	var reminderCount = 0;
	var notificationTray = document.querySelector('[tempid*="id=notificationTray"]');
	if (notificationTray) {
		var container = notificationTray.querySelector('[aria-label="New Notification"][title*="reminder"]');
		if (container){
			reminderCount = parseInt(container.title.match(/\d/gi).join(''));
		}
	} else {
		//365 check
		containers = document.getElementsByClassName('o365cs-notifications-notificationCounter');
		if (containers[0]){
			reminderCount = parseInt(containers[0].innerHTML.match(/\d/gi).join(''));
		}
	}
	return reminderCount;
}

function haveNewMessages(){
	return Boolean(getNewUnreadMessageCount());
}

function getNewUnreadMessageCount() {
	return noMinus( getUnreadMessageCount() - currentUnreadMessageCount );
}

function getUnreadMessageCount() {
	var unreadMessageCount = 0;
	var folders = getFolders();
	if (folders.length > 0) {
		unreadMessageCount = getCountBasedOffFolders(folders);
	} else {
		unreadMessageCount = getCountBasedOffSpans(getContainersBySpanId());
	}
	return unreadMessageCount;
}

function generateMessage(count, message){
	return count + ' new ' + ((count <= 1) ? message : message + 's') + '.';
}

function notify() {
	var notifyMessages = ['You have'];

	var newUnreadMessageCount = getNewUnreadMessageCount();
	var unreadMessageCount = getUnreadMessageCount();
	setFavicon(unreadMessageCount); // Probably unnecessary since you alter the document title.

	var reminderCount = getReminderCount();
	var newReminderCount = getNewReminderCount();

	if (haveNewMessages()){
		notifyMessages.push( generateMessage(newUnreadMessageCount, 'message') );
	}
	if (haveNewReminders()){
		notifyMessages.push( generateMessage(newReminderCount, 'reminder') );
	}
	if (notifyMessages.length > 1) {
		if (notifyMessages.length == 2) {
			self.port.emit("notify", notifyMessages.join(' '));
		} else {
			notifyMessages[0] += ':';
			self.port.emit("notify", notifyMessages.join('\n— ') + '\n ');
		}
	}
	addCountToDocumentTitle( {messages: unreadMessageCount, reminders: reminderCount} );

	currentReminderCount = reminderCount;
	currentUnreadMessageCount = unreadMessageCount;
}