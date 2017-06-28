'use strict';

module.exports = function (oAppData) {
	require('modules/MailWebclient/js/enums.js');
	
	var
		_ = require('underscore'),
		ko = require('knockout'),
		
		App = require('%PathToCoreWebclientModule%/js/App.js'),
		MailSettings = require('modules/MailWebclient/js/Settings.js')
	;
	
	if (App.getUserRole() === Enums.UserRole.NormalUser)
	{
		if (App.isMobile())
		{
			var Cache = require('modules/MailWebclient/js/Cache.js');
			Cache.init();
			var AccountList = require('modules/MailWebclient/js/AccountList.js');

			return {
				enableModule: ko.observable(MailSettings.AllowAddAccounts || AccountList.hasAccount() ),
				start: function (ModulesManager) {
					var
						Browser = require('%PathToCoreWebclientModule%/js/Browser.js'),
						MailUtils = require('modules/MailWebclient/js/utils/Mail.js')
					;

					require('modules/MailWebclient/js/koBindings.js');

					if (MailSettings.AllowAppRegisterMailto)
					{
						MailUtils.registerMailto(Browser.firefox);
					}

					ko.computed(function () {
						var aAuthAcconts = _.filter(AccountList.collection(), function (oAccount) {
							return oAccount.useToAuthorize();
						});

						MailSettings.userAccountsCount(aAuthAcconts.length);
					}, this);
				},
				getScreens: function () {
					var oScreens = {};
					oScreens[MailSettings.HashModuleName] = function () {
						return require('modules/%ModuleName%/js/views/MailView.js');
					};
					oScreens[MailSettings.HashModuleName + '-compose'] = function () {
						var
							CComposeView = require('modules/MailWebclient/js/views/CComposeView.js'),
							oComposeView = new CComposeView()
						;
						oComposeView.ViewTemplate = '%ModuleName%_ComposeView';
						oComposeView.oHtmlEditor.ViewTemplate = '%ModuleName%_HtmlEditorView';
						return oComposeView;
					};
					return oScreens;
				},
				getHeaderItem: function () {
					return {
						item: require('modules/%ModuleName%/js/views/HeaderItemView.js'),
						name: MailSettings.HashModuleName
					};
				}
			};
		}
	}
	
	return null;
};
