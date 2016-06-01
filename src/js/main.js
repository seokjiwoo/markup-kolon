/* global $ */

var pageId;
var pageModule;

$(document).ready(function() {
	var PageModuleClass;
	pageId = $('body').data('pageId');
	
	switch(pageId) {
		case 'member-login':
			PageModuleClass = require('./pages/Login.js');
			break;
		case 'member-join':
			PageModuleClass = require('./pages/Join.js');
			break;
		default:
			PageModuleClass = require('./pages/Page.js');
			break;
	}
	
	pageModule = PageModuleClass();
	pageModule.init();
});