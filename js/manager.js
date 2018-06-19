'use strict';

module.exports = function (oAppData) {
	var
		_ = require('underscore'),
		ko = require('knockout'),
		$ = require('jquery'),
		
		App = require('%PathToCoreWebclientModule%/js/App.js'),
		ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),
		
		MailSettings = require('modules/MailWebclient/js/Settings.js')
	;
	
	MailSettings.init(oAppData);
	
	if (!ModulesManager.isModuleAvailable('CoreMobileWebclient'))
	{
		return null;
	}
	
	require('modules/MailWebclient/js/enums.js');
	
//	require('node_modules/framework7/dist/css/framework7.css');
	require('node_modules/framework7/dist/css/framework7.material.css');
	require('node_modules/framework7/dist/css/framework7.material.colors.css');
//	require('node_modules/framework7/dist/css/framework7.ios.css');
//	require('node_modules/framework7/dist/css/framework7.ios.colors.css');
	
	$('html').addClass("md");
	
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

						MailSettings.userMailAccountsCount(aAuthAcconts.length);
					}, this);
				},
				getScreens: function () {
					var oScreens = {};
					oScreens[MailSettings.HashModuleName] = function () {
						return require('modules/%ModuleName%/js/views/MailView.js');
					};
					oScreens[MailSettings.HashModuleName + '-compose'] = function () {
						var CComposeView = require('modules/MailWebclient/js/views/CComposeView.js');
						CComposeView.prototype.registerOwnToolbarControllers = function ()
{							this.registerToolbarController({
								ViewTemplate: 'MailWebclient_Compose_BackButtonView',
								sId: 'back',
								bOnlyMobile: true,
								backToListCommand: this.backToListCommand
							});
							this.registerToolbarController({
								ViewTemplate: '%ModuleName%_Compose_SendButtonView',
								sId: 'send',
								bAllowMobile: true,
								sendCommand: this.sendCommand
							});
							this.registerToolbarController({
								ViewTemplate: '%ModuleName%_Compose_SaveButtonView',
								sId: 'save',
								bAllowMobile: true,
								saveCommand: this.saveCommand
							});
							this.registerToolbarController({
								ViewTemplate: 'MailWebclient_Compose_ImportanceDropdownView',
								sId: 'importance',
								selectedImportance: this.selectedImportance
							});
							this.registerToolbarController({
								ViewTemplate: 'MailWebclient_Compose_ConfirmationCheckboxView',
								sId: 'confirmation',
								sendReadingConfirmation: this.sendReadingConfirmation
							});
						};
						var oComposeView = new CComposeView();
						oComposeView.ViewTemplate = '%ModuleName%_ComposeView';
						oComposeView.oHtmlEditor.ViewTemplate = '%ModuleName%_HtmlEditorView';
						oComposeView.executeBackToList = function ()
						{
							if (App.isNewTab())
							{
								window.close();
							}
							else if (!!this.shown && this.shown())
							{
								var
									HeaderItemView = require('modules/MailMobileWebclient/js/views/HeaderItemView.js'),
									Routing = require('%PathToCoreWebclientModule%/js/Routing.js')
								;
								HeaderItemView.hash(HeaderItemView.baseHash());
								Routing.setPreviousHash();
							}
							this.backToListOnSendOrSave(false);
						};
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
