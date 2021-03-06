blippex.define('blippex.core', {
	tabs: {},
	_tabs: {}, /* just to get tab id for safari */
	icons: {
		'active': {
			'icon':  'safari/images/toolbar.png'
		},
		'inactive': {
			'icon':  'safari/images/toolbar_disabled.png'
		}
	},

	init: function() {
		blippex.core.addListeners();
		blippex.libs.timespent.init();
		blippex.libs.disabled.init();
		blippex.browser.settings._init();
		blippex.api.search.init();
		blippex.core.changeIcon();
	},
	
	changeIcon: function(){
		var toolbarIcon = safari.extension.toolbarItems[0];
		if (toolbarIcon){
			toolbarIcon.image = safari.extension.baseURI + (blippex.core.icons[blippex.libs.disabled.isEnabled() ? 'active' : 'inactive'].icon);
		}
	},
	
	getTabId: function(tab){
		var tabId = null;
		for (var i=0; i<safari.application.activeBrowserWindow.tabs.length;i++){
			if (safari.application.activeBrowserWindow.tabs[i] == tab){
				tab = safari.application.activeBrowserWindow.tabs[i];
			}
		}
		for (var _tabId in blippex.core._tabs){
			if (blippex.core._tabs[_tabId] == tab){
				tabId = _tabId;
			}
		}
		tabId = tabId || ((new Date().getTime()) + Math.round(Math.random()*1000));
		blippex.core._tabs[tabId] = tab;
		return tabId;
	},
	
	addListeners: function() {
		safari.application.addEventListener("message", function(messageEvent){
			switch (messageEvent.message.action){
				case 'pageLoaded':
					if (!(safari.application.privateBrowsing || {'enabled': false}).enabled){
							blippex.core.onLoad({
								'tab':	messageEvent.target
							})
					}
					break;
				case 'onUnload':
					blippex.browser.debug.log('got document unload');
					//blippex.core.onUnload({
					//	'tab':	messageEvent.target
					//})
				}
			}
		);
		
		safari.application.addEventListener("close", function(e){
			blippex.core._tabHandlerEvent(e);
		}, true);
		safari.application.addEventListener("beforeNavigate", function(e){
			blippex.core._tabHandlerEvent(e);
		}, true);
	},
	
	_tabHandlerEvent: function(e){
		if (e.target){
			var tabId = blippex.core.getTabId(e.target);
			if (tabId && blippex.core.tabs[tabId]){
				window.setTimeout(function(){
					blippex.libs.timespent.upload({
						'tabId':	tabId
					});
				}, 2000)
			}
		}
	},
	
	onLoad: function(oArgs){
		var tabId = blippex.core.getTabId(oArgs.tab)
		blippex.libs.timespent.upload({
			'tabId':	tabId
		});
		blippex.core.tabs[tabId] = {
			'status':			blippex.browser.tabs.check({'url':	oArgs.tab.url}),
			'timespent':	0,
			'timestamp':	blippex.libs.misc.formatDate(),
			'url':				oArgs.tab.url
		}
	},
	
	onUnload: function(oArgs){
		blippex.libs.timespent.upload({
			'tabId':	blippex.core.getTabId(oArgs.tab)
		});
		blippex.core.tabs[blippex.core.getTabId(oArgs.tab)] = blippex.config.status.uploaded;
		
	}
});