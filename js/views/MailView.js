'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),
	
	App = require('%PathToCoreWebclientModule%/js/App.js'),
	
	MailCache = require('modules/MailWebclient/js/Cache.js'),
	
	CFolderListView = require('modules/%ModuleName%/js/views/CFolderListView.js'),
	
	CMailView = require('modules/MailWebclient/js/views/CMailView.js'),
	$ = require('jquery');
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
	
	this.appsDom = null;
	this.showApps = ko.observable(false);
	
	this.init();
}

_.extendOwn(CMailMobileView.prototype, CMailView.prototype);

CMailMobileView.prototype.ViewTemplate = '%ModuleName%_MailView';
CMailMobileView.prototype.ViewConstructorName = 'CMailMobileView';

CMailMobileView.prototype.init = function ()
{
	
	
	this.selectedPanel.subscribe(function (value) {
		$('body').toggleClass('with-panel-left-reveal', value === Enums.MobilePanel.Groups);
	});
	
	var self = this;
	this.appsDom = $('#apps-list');
	this.appsDom.on('click', function () {
		self.showApps(false);
	});
	
	this.showApps.subscribe(function (value) {
		if (value) 
		{
			this.appsDom.css({'display': 'block'});
		}
		else
		{
			this.appsDom.css({'display': 'none'});
		}
		
		
		$('body').toggleClass('with-panel-right-cover', value);
	}, this);
};

CMailMobileView.prototype.gotoFolderList = function ()
{
	this.changeSelectedPanel(Enums.MobilePanel.Groups);
	
};

CMailMobileView.prototype.gotoMessageList = function ()
{
	this.changeSelectedPanel(Enums.MobilePanel.Items);
	
	var
		sFolder = this.folderList().currentFolderFullName(),
		iPage = this.oMessageList.oPageSwitcher.currentPage(),
		sSearch = this.oMessageList.search(),
		sFilters = this.oMessageList.filters()
	;
	this.oMessageList.changeRoutingForMessageList(sFolder, iPage, '', sSearch, sFilters);
	
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
