'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),
	
	App = require('%PathToCoreWebclientModule%/js/App.js'),
	
	MailCache = require('modules/MailWebclient/js/Cache.js'),
	
	CFolderListView = require('modules/%ModuleName%/js/views/CFolderListView.js'),
	
	CMailView = require('modules/MailWebclient/js/views/CMailView.js')
;

/**
 * @constructor
 */
function CMailMobileView()
{
	CMailView.call(this);
	
	this.oFolderList = new CFolderListView();
	this.oMessageList.ViewTemplate = '%ModuleName%_MessagesView';
	
	this.oBaseMessagePaneView.ViewTemplate = '%ModuleName%_MessagePaneView';
	
	this.selectedPanel = ko.observable(Enums.MobilePanel.Items);
	MailCache.currentMessage.subscribe(function () {
		this.gotoMessagePane();
	}, this);
}

_.extendOwn(CMailMobileView.prototype, CMailView.prototype);

CMailMobileView.prototype.ViewTemplate = '%ModuleName%_MailView';
CMailMobileView.prototype.ViewConstructorName = 'CMailMobileView';

CMailMobileView.prototype.gotoFolderList = function ()
{
	this.changeSelectedPanel(Enums.MobilePanel.Groups);
};

CMailMobileView.prototype.gotoMessageList = function ()
{
	this.changeSelectedPanel(Enums.MobilePanel.Items);
	return true;
};

CMailMobileView.prototype.gotoMessagePane = function ()
{
	if (MailCache.currentMessage())
	{
		this.changeSelectedPanel(Enums.MobilePanel.View);
	}
	else
	{
		this.gotoMessageList();
	}
};

/**
 * @param {number} iPanel
 */
CMailMobileView.prototype.changeSelectedPanel = function (iPanel)
{
	if (App.isMobile())
	{
		if (this.selectedPanel() !== iPanel)
		{
			this.selectedPanel(iPanel);
		}
	}
};

module.exports = new CMailMobileView();
