Ext.namespace('Zarafa.plugins.files.backend.Seafile');

/**
 * @class Zarafa.plugins.files.backend.Seafile.SeafileBackend
 * @extends Zarafa.core.Plugin
 *
 * Plugin for the Seafile backend. It requires the main files plugin.
 */
Zarafa.plugins.files.backend.Seafile.SeafileBackend = Ext.extend(Zarafa.core.Plugin, {

	/**
	 * Constructor
	 * @protected
	 */
	constructor: function (config) {
		config = config || {};

		Zarafa.plugins.files.backend.Seafile.SeafileBackend.superclass.constructor.call(this, config);
	},

	/**
	 * Initialze all insertion points.
	 */
	initPlugin: function () {
		Zarafa.plugins.files.backend.Seafile.SeafileBackend.superclass.initPlugin.apply(this, arguments);

		this.registerInsertionPoint('plugin.files.sharedialog', this.createShareDialogInsertionPoint, this);

		// Register common specific dialog types
		Zarafa.core.data.SharedComponentType.addProperty('filesplugin.seafile.useredit');
	},

	/**
	 * Callback for the plugin.files.sharedialog insertion point.
	 *
	 * @return {{xtype: string}}
	 */
	createShareDialogInsertionPoint: function () {
		return {
			xtype: 'filesplugin.seafile.filessharedialogpanel'
		};
	},

	/**
	 * Bid for the type of shared component
	 * and the given record.
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Number} The bid for the shared component
	 */
	bidSharedComponent: function (type, record) {
		var bid = -1;
		switch (type) {
			case Zarafa.core.data.SharedComponentType['filesplugin.seafile.useredit']:
				bid = 1;
				break;
		}
		return bid;
	},

	/**
	 * Will return the reference to the shared component.
	 * Based on the type of component requested a component is returned.
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Ext.Component} Component
	 */
	getSharedComponent: function (type, record) {
		var component;
		switch (type) {
			case Zarafa.core.data.SharedComponentType['filesplugin.seafile.useredit']:
				component = Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserEditContentPanel;
				break;
		}

		return component;
	}
});

// Register plugin
Zarafa.onReady(function () {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name             : 'filesbackendSeafile', // this name must be in format "filesbackend<Backendname>"
		displayName      : dgettext('plugin_filesbackendSeafile', 'Files: Seafile Backend'),
		allowUserDisable : false, // don't allow to disable this plugin - files will get confused if it is disabled
		pluginConstructor: Zarafa.plugins.files.backend.Seafile.SeafileBackend
	}));
});

Ext.namespace('Zarafa.plugins.files.backend.Seafile.data');

/**
 * @class Zarafa.plugins.files.backend.Seafile.data.RecipientTypes
 * @extends Zarafa.core.Enum
 *
 * Enum containing the different recipient types that are available in the Seafile backend.
 *
 * @singleton
 */
Zarafa.plugins.files.backend.Seafile.data.RecipientTypes = Zarafa.core.Enum.create({

	/**
	 * RecipientType: user
	 *
	 * @property
	 * @type Number
	 */
	USER: 0,

	/**
	 * RecipientType: group
	 *
	 * @property
	 * @type Number
	 */
	GROUP: 1,

	/**
	 * RecipientType: link
	 *
	 * @property
	 * @type Number
	 */
	LINK: 3
});

Ext.namespace('Zarafa.plugins.files.backend.Seafile.data');

/**
 * @class Zarafa.plugins.files.backend.Seafile.data.ResponseHandler
 * @extends Zarafa.core.data.AbstractResponseHandler
 * @xtype filesplugin.seafile.responsehandler
 *
 * Files plugin specific response handler.
 */
Zarafa.plugins.files.backend.Seafile.data.ResponseHandler = Ext.extend(Zarafa.core.data.AbstractResponseHandler, {
	/**
	 * @cfg {Function} successCallback The function which
	 * will be called after success request.
	 */
	successCallback: null,

	/**
	 * @cfg {Function} failureCallback The function which
	 * will be called after a failed request.
	 */
	failureCallback: null,

	/**
	 * Call the successCallback callback function.
	 *
	 * @param {Object} response Object contained the response data.
	 */
	doLoadsharingdetails: function (response) {
		this.successCallback(response);
	},

	/**
	 * Call the successCallback callback function.
	 *
	 * @param {Object} response Object contained the response data.
	 */
	doCreatenewshare: function (response) {
		this.successCallback(response);
	},

	/**
	 * Call the successCallback callback function.
	 *
	 * @param {Object} response Object contained the response data.
	 */
	doDeleteexistingshare: function (response) {
		this.successCallback(response);
	},

	/**
	 * Call the successCallback callback function.
	 *
	 * @param {Object} response Object contained the response data.
	 */
	doUpdateexistingshare: function (response) {
		this.successCallback(response);
	},

	/**
	 * In case exception happened on server, server will return
	 * exception response with the code of exception.
	 *
	 * @param {Object} response Object contained the response data.
	 */
	doError: function (response) {
		Zarafa.common.dialogs.MessageBox.show({
			title  : response.header,
			msg    : response.message,
			icon   : Zarafa.common.dialogs.MessageBox.ERROR,
			buttons: Zarafa.common.dialogs.MessageBox.OK
		});
		this.failureCallback(response);
	}
});

Ext.reg('filesplugin.seafile.responsehandler', Zarafa.plugins.files.backend.Seafile.data.ResponseHandler);

Ext.namespace('Zarafa.plugins.files.backend.Seafile.data');

/**
 * @class Zarafa.plugins.files.backend.Seafile.data.ShareGridRecord
 *
 * This class specifies the ShareGridRecord and it's fields.
 */
Zarafa.plugins.files.backend.Seafile.data.ShareGridRecord = Ext.data.Record.create(
	{name: "id", type: "string"},
	{name: "shareWith", type: "string"},
	{name: "shareWithDisplayname", type: "string"},
	{name: "type", type: "string"},
	{name: "permissionCreate", type: "bool"},
	{name: "permissionChange", type: "bool"},
	{name: "permissionDelete", type: "bool"},
	{name: "permissionShare", type: "bool"}
);

Ext.namespace('Zarafa.plugins.files.backend.Seafile.data');

/**
 * @class Zarafa.plugins.files.backend.Seafile.data.ShareGridStore
 * @extends Ext.data.ArrayStore
 * @xtype filesplugin.seafile.sharegridstore
 *
 * This simple array store holds all group and user shares. Do not use the save or commit method as
 * the store does not implement a writer.
 */
Zarafa.plugins.files.backend.Seafile.data.ShareGridStore = Ext.extend(Ext.data.ArrayStore, {
	/**
	 * @constructor
	 */
	constructor: function (fileType) {
		Zarafa.plugins.files.backend.Seafile.data.ShareGridStore.superclass.constructor.call(this, {
			fields  : [
				'id', 'shareWith', 'shareWithDisplayname', 'type', 'permissionCreate', 'permissionChange', 'permissionDelete', 'permissionShare'
			],
			fileType: fileType
		});
	}
});

Ext.reg('filesplugin.seafile.sharegridstore', Zarafa.plugins.files.backend.Seafile.data.ShareGridStore);

Ext.namespace('Ext.ux');

/**
 * This class is a wrapper for the ZeroClipboard library.
 * It will only work with ZeroClipboard 1.3.x and ExtJS 3.4
 *
 * @author Kopano
 * @class Ext.ux.CopyButton
 * @extends Ext.Button
 * @xtype copybutton
 */
Ext.ux.CopyButton = Ext.extend(Ext.Button, {
	/**
	 * @var ZeroClipboard clipboard client
	 */
	zclipboard: undefined,

	/**
	 * @var String Complete Text
	 */
	completeText: "Text copied to clipboard",

	/**
	 * @var String Path to SWF Object
	 */
	swfPath: "ZeroClipboard.swf",

	/**
	 * Constructor
	 * @param config
	 */
	constructor: function(config) {
		config = config || {};

		Ext.ux.CopyButton.superclass.constructor.call(this, config);

		this.init();
	},

	/**
	 * Init ZeroClipboard
	 * @private
	 */
	init: function() {
		ZeroClipboard.config({ moviePath: this.swfPath }); // set the swfPath
		this.zclipboard = new ZeroClipboard();
	},

	/**
	 * Afterrender callback, bind the clipboard to an dom element and add listeners
	 */
	afterRender: function() {
		Ext.ux.CopyButton.superclass.afterRender.call(this);
		this.zclipboard.clip(this.getEl().dom);

		this.zclipboard.on('complete', this.onCopyComplete.createDelegate(this));
		this.zclipboard.on('dataRequested', this.onDataRequested.createDelegate(this));
	},

	/**
	 * On destroy callback
	 */
	onDestroy: function() {
		this.zclipboard.destroy();
		Ext.ux.CopyButton.superclass.onDestroy.call(this);
	},

	/**
	 * onDataRequested callback
	 *
	 * @param client
	 * @param args
	 */
	onDataRequested: function (client, args) {
		client.setText( this.getValue() );
	},

	/**
	 * onCopyComplete callback
	 *
	 * @param client
	 * @param args
	 */
	onCopyComplete: function (client, args) {
		alert(this.completeText);
	},

	/**
	 * Sets the value that should be used when the button is pressed
	 * @param {String} value The value to set
	 */
	setValue: function(value) {
		this.value = String(value);
	},

	/**
	 * Get the value that will be used when the user clicks the button
	 * @return {String} value The value used to copy to the clipboard
	 */
	getValue: function() {
		return this.value;
	}
});

Ext.reg('copybutton', Ext.ux.CopyButton);

/*!
 * ZeroClipboard
 * The ZeroClipboard library provides an easy way to copy text to the clipboard using an invisible Adobe Flash movie and a JavaScript interface.
 * Copyright (c) 2014 Jon Rohan, James M. Greene
 * Licensed MIT
 * http://zeroclipboard.org/
 * v1.3.5
 */
(function(window) {
	"use strict";
	var currentElement;
	var flashState = {
		bridge: null,
		version: "0.0.0",
		disabled: null,
		outdated: null,
		ready: null
	};
	var _clipData = {};
	var clientIdCounter = 0;
	var _clientMeta = {};
	var elementIdCounter = 0;
	var _elementMeta = {};
	var _amdModuleId = null;
	var _cjsModuleId = null;
	var _swfPath = function() {
		var i, jsDir, tmpJsPath, jsPath, swfPath = "ZeroClipboard.swf";
		if (document.currentScript && (jsPath = document.currentScript.src)) {} else {
			var scripts = document.getElementsByTagName("script");
			if ("readyState" in scripts[0]) {
				for (i = scripts.length; i--; ) {
					if (scripts[i].readyState === "interactive" && (jsPath = scripts[i].src)) {
						break;
					}
				}
			} else if (document.readyState === "loading") {
				jsPath = scripts[scripts.length - 1].src;
			} else {
				for (i = scripts.length; i--; ) {
					tmpJsPath = scripts[i].src;
					if (!tmpJsPath) {
						jsDir = null;
						break;
					}
					tmpJsPath = tmpJsPath.split("#")[0].split("?")[0];
					tmpJsPath = tmpJsPath.slice(0, tmpJsPath.lastIndexOf("/") + 1);
					if (jsDir == null) {
						jsDir = tmpJsPath;
					} else if (jsDir !== tmpJsPath) {
						jsDir = null;
						break;
					}
				}
				if (jsDir !== null) {
					jsPath = jsDir;
				}
			}
		}
		if (jsPath) {
			jsPath = jsPath.split("#")[0].split("?")[0];
			swfPath = jsPath.slice(0, jsPath.lastIndexOf("/") + 1) + swfPath;
		}
		return swfPath;
	}();
	var _camelizeCssPropName = function() {
		var matcherRegex = /\-([a-z])/g, replacerFn = function(match, group) {
			return group.toUpperCase();
		};
		return function(prop) {
			return prop.replace(matcherRegex, replacerFn);
		};
	}();
	var _getStyle = function(el, prop) {
		var value, camelProp, tagName, possiblePointers, i, len;
		if (window.getComputedStyle) {
			value = window.getComputedStyle(el, null).getPropertyValue(prop);
		} else {
			camelProp = _camelizeCssPropName(prop);
			if (el.currentStyle) {
				value = el.currentStyle[camelProp];
			} else {
				value = el.style[camelProp];
			}
		}
		if (prop === "cursor") {
			if (!value || value === "auto") {
				tagName = el.tagName.toLowerCase();
				if (tagName === "a") {
					return "pointer";
				}
			}
		}
		return value;
	};
	var _elementMouseOver = function(event) {
		if (!event) {
			event = window.event;
		}
		var target;
		if (this !== window) {
			target = this;
		} else if (event.target) {
			target = event.target;
		} else if (event.srcElement) {
			target = event.srcElement;
		}
		ZeroClipboard.activate(target);
	};
	var _addEventHandler = function(element, method, func) {
		if (!element || element.nodeType !== 1) {
			return;
		}
		if (element.addEventListener) {
			element.addEventListener(method, func, false);
		} else if (element.attachEvent) {
			element.attachEvent("on" + method, func);
		}
	};
	var _removeEventHandler = function(element, method, func) {
		if (!element || element.nodeType !== 1) {
			return;
		}
		if (element.removeEventListener) {
			element.removeEventListener(method, func, false);
		} else if (element.detachEvent) {
			element.detachEvent("on" + method, func);
		}
	};
	var _addClass = function(element, value) {
		if (!element || element.nodeType !== 1) {
			return element;
		}
		if (element.classList) {
			if (!element.classList.contains(value)) {
				element.classList.add(value);
			}
			return element;
		}
		if (value && typeof value === "string") {
			var classNames = (value || "").split(/\s+/);
			if (element.nodeType === 1) {
				if (!element.className) {
					element.className = value;
				} else {
					var className = " " + element.className + " ", setClass = element.className;
					for (var c = 0, cl = classNames.length; c < cl; c++) {
						if (className.indexOf(" " + classNames[c] + " ") < 0) {
							setClass += " " + classNames[c];
						}
					}
					element.className = setClass.replace(/^\s+|\s+$/g, "");
				}
			}
		}
		return element;
	};
	var _removeClass = function(element, value) {
		if (!element || element.nodeType !== 1) {
			return element;
		}
		if (element.classList) {
			if (element.classList.contains(value)) {
				element.classList.remove(value);
			}
			return element;
		}
		if (value && typeof value === "string" || value === undefined) {
			var classNames = (value || "").split(/\s+/);
			if (element.nodeType === 1 && element.className) {
				if (value) {
					var className = (" " + element.className + " ").replace(/[\n\t]/g, " ");
					for (var c = 0, cl = classNames.length; c < cl; c++) {
						className = className.replace(" " + classNames[c] + " ", " ");
					}
					element.className = className.replace(/^\s+|\s+$/g, "");
				} else {
					element.className = "";
				}
			}
		}
		return element;
	};
	var _getZoomFactor = function() {
		var rect, physicalWidth, logicalWidth, zoomFactor = 1;
		if (typeof document.body.getBoundingClientRect === "function") {
			rect = document.body.getBoundingClientRect();
			physicalWidth = rect.right - rect.left;
			logicalWidth = document.body.offsetWidth;
			zoomFactor = Math.round(physicalWidth / logicalWidth * 100) / 100;
		}
		return zoomFactor;
	};
	var _getDOMObjectPosition = function(obj, defaultZIndex) {
		var info = {
			left: 0,
			top: 0,
			width: 0,
			height: 0,
			zIndex: _getSafeZIndex(defaultZIndex) - 1
		};
		if (obj.getBoundingClientRect) {
			var rect = obj.getBoundingClientRect();
			var pageXOffset, pageYOffset, zoomFactor;
			if ("pageXOffset" in window && "pageYOffset" in window) {
				pageXOffset = window.pageXOffset;
				pageYOffset = window.pageYOffset;
			} else {
				zoomFactor = _getZoomFactor();
				pageXOffset = Math.round(document.documentElement.scrollLeft / zoomFactor);
				pageYOffset = Math.round(document.documentElement.scrollTop / zoomFactor);
			}
			var leftBorderWidth = document.documentElement.clientLeft || 0;
			var topBorderWidth = document.documentElement.clientTop || 0;
			info.left = rect.left + pageXOffset - leftBorderWidth;
			info.top = rect.top + pageYOffset - topBorderWidth;
			info.width = "width" in rect ? rect.width : rect.right - rect.left;
			info.height = "height" in rect ? rect.height : rect.bottom - rect.top;
		}
		return info;
	};
	var _cacheBust = function(path, options) {
		var cacheBust = options == null || options && options.cacheBust === true && options.useNoCache === true;
		if (cacheBust) {
			return (path.indexOf("?") === -1 ? "?" : "&") + "noCache=" + new Date().getTime();
		} else {
			return "";
		}
	};
	var _vars = function(options) {
		var i, len, domain, str = [], domains = [], trustedOriginsExpanded = [];
		if (options.trustedOrigins) {
			if (typeof options.trustedOrigins === "string") {
				domains.push(options.trustedOrigins);
			} else if (typeof options.trustedOrigins === "object" && "length" in options.trustedOrigins) {
				domains = domains.concat(options.trustedOrigins);
			}
		}
		if (options.trustedDomains) {
			if (typeof options.trustedDomains === "string") {
				domains.push(options.trustedDomains);
			} else if (typeof options.trustedDomains === "object" && "length" in options.trustedDomains) {
				domains = domains.concat(options.trustedDomains);
			}
		}
		if (domains.length) {
			for (i = 0, len = domains.length; i < len; i++) {
				if (domains.hasOwnProperty(i) && domains[i] && typeof domains[i] === "string") {
					domain = _extractDomain(domains[i]);
					if (!domain) {
						continue;
					}
					if (domain === "*") {
						trustedOriginsExpanded = [ domain ];
						break;
					}
					trustedOriginsExpanded.push.apply(trustedOriginsExpanded, [ domain, "//" + domain, window.location.protocol + "//" + domain ]);
				}
			}
		}
		if (trustedOriginsExpanded.length) {
			str.push("trustedOrigins=" + encodeURIComponent(trustedOriginsExpanded.join(",")));
		}
		if (typeof options.jsModuleId === "string" && options.jsModuleId) {
			str.push("jsModuleId=" + encodeURIComponent(options.jsModuleId));
		}
		return str.join("&");
	};
	var _inArray = function(elem, array, fromIndex) {
		if (typeof array.indexOf === "function") {
			return array.indexOf(elem, fromIndex);
		}
		var i, len = array.length;
		if (typeof fromIndex === "undefined") {
			fromIndex = 0;
		} else if (fromIndex < 0) {
			fromIndex = len + fromIndex;
		}
		for (i = fromIndex; i < len; i++) {
			if (array.hasOwnProperty(i) && array[i] === elem) {
				return i;
			}
		}
		return -1;
	};
	var _prepClip = function(elements) {
		if (typeof elements === "string") throw new TypeError("ZeroClipboard doesn't accept query strings.");
		if (!elements.length) return [ elements ];
		return elements;
	};
	var _dispatchCallback = function(func, context, args, async) {
		if (async) {
			window.setTimeout(function() {
				func.apply(context, args);
			}, 0);
		} else {
			func.apply(context, args);
		}
	};
	var _getSafeZIndex = function(val) {
		var zIndex, tmp;
		if (val) {
			if (typeof val === "number" && val > 0) {
				zIndex = val;
			} else if (typeof val === "string" && (tmp = parseInt(val, 10)) && !isNaN(tmp) && tmp > 0) {
				zIndex = tmp;
			}
		}
		if (!zIndex) {
			if (typeof _globalConfig.zIndex === "number" && _globalConfig.zIndex > 0) {
				zIndex = _globalConfig.zIndex;
			} else if (typeof _globalConfig.zIndex === "string" && (tmp = parseInt(_globalConfig.zIndex, 10)) && !isNaN(tmp) && tmp > 0) {
				zIndex = tmp;
			}
		}
		return zIndex || 0;
	};
	var _deprecationWarning = function(deprecatedApiName, debugEnabled) {
		if (deprecatedApiName && debugEnabled !== false && typeof console !== "undefined" && console && (console.warn || console.log)) {
			var deprecationWarning = "`" + deprecatedApiName + "` is deprecated. See docs for more info:\n" + "    https://github.com/zeroclipboard/zeroclipboard/blob/master/docs/instructions.md#deprecations";
			if (console.warn) {
				console.warn(deprecationWarning);
			} else {
				console.log(deprecationWarning);
			}
		}
	};
	var _extend = function() {
		var i, len, arg, prop, src, copy, target = arguments[0] || {};
		for (i = 1, len = arguments.length; i < len; i++) {
			if ((arg = arguments[i]) != null) {
				for (prop in arg) {
					if (arg.hasOwnProperty(prop)) {
						src = target[prop];
						copy = arg[prop];
						if (target === copy) {
							continue;
						}
						if (copy !== undefined) {
							target[prop] = copy;
						}
					}
				}
			}
		}
		return target;
	};
	var _extractDomain = function(originOrUrl) {
		if (originOrUrl == null || originOrUrl === "") {
			return null;
		}
		originOrUrl = originOrUrl.replace(/^\s+|\s+$/g, "");
		if (originOrUrl === "") {
			return null;
		}
		var protocolIndex = originOrUrl.indexOf("//");
		originOrUrl = protocolIndex === -1 ? originOrUrl : originOrUrl.slice(protocolIndex + 2);
		var pathIndex = originOrUrl.indexOf("/");
		originOrUrl = pathIndex === -1 ? originOrUrl : protocolIndex === -1 || pathIndex === 0 ? null : originOrUrl.slice(0, pathIndex);
		if (originOrUrl && originOrUrl.slice(-4).toLowerCase() === ".swf") {
			return null;
		}
		return originOrUrl || null;
	};
	var _determineScriptAccess = function() {
		var _extractAllDomains = function(origins, resultsArray) {
			var i, len, tmp;
			if (origins != null && resultsArray[0] !== "*") {
				if (typeof origins === "string") {
					origins = [ origins ];
				}
				if (typeof origins === "object" && "length" in origins) {
					for (i = 0, len = origins.length; i < len; i++) {
						if (origins.hasOwnProperty(i)) {
							tmp = _extractDomain(origins[i]);
							if (tmp) {
								if (tmp === "*") {
									resultsArray.length = 0;
									resultsArray.push("*");
									break;
								}
								if (_inArray(tmp, resultsArray) === -1) {
									resultsArray.push(tmp);
								}
							}
						}
					}
				}
			}
		};
		var _accessLevelLookup = {
			always: "always",
			samedomain: "sameDomain",
			never: "never"
		};
		return function(currentDomain, configOptions) {
			var asaLower, allowScriptAccess = configOptions.allowScriptAccess;
			if (typeof allowScriptAccess === "string" && (asaLower = allowScriptAccess.toLowerCase()) && /^always|samedomain|never$/.test(asaLower)) {
				return _accessLevelLookup[asaLower];
			}
			var swfDomain = _extractDomain(configOptions.moviePath);
			if (swfDomain === null) {
				swfDomain = currentDomain;
			}
			var trustedDomains = [];
			_extractAllDomains(configOptions.trustedOrigins, trustedDomains);
			_extractAllDomains(configOptions.trustedDomains, trustedDomains);
			var len = trustedDomains.length;
			if (len > 0) {
				if (len === 1 && trustedDomains[0] === "*") {
					return "always";
				}
				if (_inArray(currentDomain, trustedDomains) !== -1) {
					if (len === 1 && currentDomain === swfDomain) {
						return "sameDomain";
					}
					return "always";
				}
			}
			return "never";
		};
	}();
	var _objectKeys = function(obj) {
		if (obj == null) {
			return [];
		}
		if (Object.keys) {
			return Object.keys(obj);
		}
		var keys = [];
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				keys.push(prop);
			}
		}
		return keys;
	};
	var _deleteOwnProperties = function(obj) {
		if (obj) {
			for (var prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					delete obj[prop];
				}
			}
		}
		return obj;
	};
	var _safeActiveElement = function() {
		try {
			return document.activeElement;
		} catch (err) {}
		return null;
	};
	var _detectFlashSupport = function() {
		var hasFlash = false;
		if (typeof flashState.disabled === "boolean") {
			hasFlash = flashState.disabled === false;
		} else {
			if (typeof ActiveXObject === "function") {
				try {
					if (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) {
						hasFlash = true;
					}
				} catch (error) {}
			}
			if (!hasFlash && navigator.mimeTypes["application/x-shockwave-flash"]) {
				hasFlash = true;
			}
		}
		return hasFlash;
	};
	function _parseFlashVersion(flashVersion) {
		return flashVersion.replace(/,/g, ".").replace(/[^0-9\.]/g, "");
	}
	function _isFlashVersionSupported(flashVersion) {
		return parseFloat(_parseFlashVersion(flashVersion)) >= 10;
	}
	var ZeroClipboard = function(elements, options) {
		if (!(this instanceof ZeroClipboard)) {
			return new ZeroClipboard(elements, options);
		}
		this.id = "" + clientIdCounter++;
		_clientMeta[this.id] = {
			instance: this,
			elements: [],
			handlers: {}
		};
		if (elements) {
			this.clip(elements);
		}
		if (typeof options !== "undefined") {
			_deprecationWarning("new ZeroClipboard(elements, options)", _globalConfig.debug);
			ZeroClipboard.config(options);
		}
		this.options = ZeroClipboard.config();
		if (typeof flashState.disabled !== "boolean") {
			flashState.disabled = !_detectFlashSupport();
		}
		if (flashState.disabled === false && flashState.outdated !== true) {
			if (flashState.bridge === null) {
				flashState.outdated = false;
				flashState.ready = false;
				_bridge();
			}
		}
	};
	ZeroClipboard.prototype.setText = function(newText) {
		if (newText && newText !== "") {
			_clipData["text/plain"] = newText;
			if (flashState.ready === true && flashState.bridge && typeof flashState.bridge.setText === "function") {
				flashState.bridge.setText(newText);
			} else {
				flashState.ready = false;
			}
		}
		return this;
	};
	ZeroClipboard.prototype.setSize = function(width, height) {
		if (flashState.ready === true && flashState.bridge && typeof flashState.bridge.setSize === "function") {
			flashState.bridge.setSize(width, height);
		} else {
			flashState.ready = false;
		}
		return this;
	};
	var _setHandCursor = function(enabled) {
		if (flashState.ready === true && flashState.bridge && typeof flashState.bridge.setHandCursor === "function") {
			flashState.bridge.setHandCursor(enabled);
		} else {
			flashState.ready = false;
		}
	};
	ZeroClipboard.prototype.destroy = function() {
		this.unclip();
		this.off();
		delete _clientMeta[this.id];
	};
	var _getAllClients = function() {
		var i, len, client, clients = [], clientIds = _objectKeys(_clientMeta);
		for (i = 0, len = clientIds.length; i < len; i++) {
			client = _clientMeta[clientIds[i]].instance;
			if (client && client instanceof ZeroClipboard) {
				clients.push(client);
			}
		}
		return clients;
	};
	ZeroClipboard.version = "1.3.5";
	var _globalConfig = {
		swfPath: _swfPath,
		trustedDomains: window.location.host ? [ window.location.host ] : [],
		cacheBust: true,
		forceHandCursor: false,
		zIndex: 999999999,
		debug: true,
		title: null,
		autoActivate: true
	};
	ZeroClipboard.config = function(options) {
		if (typeof options === "object" && options !== null) {
			_extend(_globalConfig, options);
		}
		if (typeof options === "string" && options) {
			if (_globalConfig.hasOwnProperty(options)) {
				return _globalConfig[options];
			}
			return;
		}
		var copy = {};
		for (var prop in _globalConfig) {
			if (_globalConfig.hasOwnProperty(prop)) {
				if (typeof _globalConfig[prop] === "object" && _globalConfig[prop] !== null) {
					if ("length" in _globalConfig[prop]) {
						copy[prop] = _globalConfig[prop].slice(0);
					} else {
						copy[prop] = _extend({}, _globalConfig[prop]);
					}
				} else {
					copy[prop] = _globalConfig[prop];
				}
			}
		}
		return copy;
	};
	ZeroClipboard.destroy = function() {
		ZeroClipboard.deactivate();
		for (var clientId in _clientMeta) {
			if (_clientMeta.hasOwnProperty(clientId) && _clientMeta[clientId]) {
				var client = _clientMeta[clientId].instance;
				if (client && typeof client.destroy === "function") {
					client.destroy();
				}
			}
		}
		var htmlBridge = _getHtmlBridge(flashState.bridge);
		if (htmlBridge && htmlBridge.parentNode) {
			htmlBridge.parentNode.removeChild(htmlBridge);
			flashState.ready = null;
			flashState.bridge = null;
		}
	};
	ZeroClipboard.activate = function(element) {
		if (currentElement) {
			_removeClass(currentElement, _globalConfig.hoverClass);
			_removeClass(currentElement, _globalConfig.activeClass);
		}
		currentElement = element;
		_addClass(element, _globalConfig.hoverClass);
		_reposition();
		var newTitle = _globalConfig.title || element.getAttribute("title");
		if (newTitle) {
			var htmlBridge = _getHtmlBridge(flashState.bridge);
			if (htmlBridge) {
				htmlBridge.setAttribute("title", newTitle);
			}
		}
		var useHandCursor = _globalConfig.forceHandCursor === true || _getStyle(element, "cursor") === "pointer";
		_setHandCursor(useHandCursor);
	};
	ZeroClipboard.deactivate = function() {
		var htmlBridge = _getHtmlBridge(flashState.bridge);
		if (htmlBridge) {
			htmlBridge.style.left = "0px";
			htmlBridge.style.top = "-9999px";
			htmlBridge.removeAttribute("title");
		}
		if (currentElement) {
			_removeClass(currentElement, _globalConfig.hoverClass);
			_removeClass(currentElement, _globalConfig.activeClass);
			currentElement = null;
		}
	};
	var _bridge = function() {
		var flashBridge, len;
		var container = document.getElementById("global-zeroclipboard-html-bridge");
		if (!container) {
			var opts = ZeroClipboard.config();
			opts.jsModuleId = typeof _amdModuleId === "string" && _amdModuleId || typeof _cjsModuleId === "string" && _cjsModuleId || null;
			var allowScriptAccess = _determineScriptAccess(window.location.host, _globalConfig);
			var flashvars = _vars(opts);
			var swfUrl = _globalConfig.moviePath + _cacheBust(_globalConfig.moviePath, _globalConfig);
			var html = '      <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" id="global-zeroclipboard-flash-bridge" width="100%" height="100%">         <param name="movie" value="' + swfUrl + '"/>         <param name="allowScriptAccess" value="' + allowScriptAccess + '"/>         <param name="scale" value="exactfit"/>         <param name="loop" value="false"/>         <param name="menu" value="false"/>         <param name="quality" value="best" />         <param name="bgcolor" value="#ffffff"/>         <param name="wmode" value="transparent"/>         <param name="flashvars" value="' + flashvars + '"/>         <embed src="' + swfUrl + '"           loop="false" menu="false"           quality="best" bgcolor="#ffffff"           width="100%" height="100%"           name="global-zeroclipboard-flash-bridge"           allowScriptAccess="' + allowScriptAccess + '"           allowFullScreen="false"           type="application/x-shockwave-flash"           wmode="transparent"           pluginspage="http://www.macromedia.com/go/getflashplayer"           flashvars="' + flashvars + '"           scale="exactfit">         </embed>       </object>';
			container = document.createElement("div");
			container.id = "global-zeroclipboard-html-bridge";
			container.setAttribute("class", "global-zeroclipboard-container");
			container.style.position = "absolute";
			container.style.left = "0px";
			container.style.top = "-9999px";
			container.style.width = "15px";
			container.style.height = "15px";
			container.style.zIndex = "" + _getSafeZIndex(_globalConfig.zIndex);
			document.body.appendChild(container);
			container.innerHTML = html;
		}
		flashBridge = document["global-zeroclipboard-flash-bridge"];
		if (flashBridge && (len = flashBridge.length)) {
			flashBridge = flashBridge[len - 1];
		}
		flashState.bridge = flashBridge || container.children[0].lastElementChild;
	};
	var _getHtmlBridge = function(flashBridge) {
		var isFlashElement = /^OBJECT|EMBED$/;
		var htmlBridge = flashBridge && flashBridge.parentNode;
		while (htmlBridge && isFlashElement.test(htmlBridge.nodeName) && htmlBridge.parentNode) {
			htmlBridge = htmlBridge.parentNode;
		}
		return htmlBridge || null;
	};
	var _reposition = function() {
		if (currentElement) {
			var pos = _getDOMObjectPosition(currentElement, _globalConfig.zIndex);
			var htmlBridge = _getHtmlBridge(flashState.bridge);
			if (htmlBridge) {
				htmlBridge.style.top = pos.top + "px";
				htmlBridge.style.left = pos.left + "px";
				htmlBridge.style.width = pos.width + "px";
				htmlBridge.style.height = pos.height + "px";
				htmlBridge.style.zIndex = pos.zIndex + 1;
			}
			if (flashState.ready === true && flashState.bridge && typeof flashState.bridge.setSize === "function") {
				flashState.bridge.setSize(pos.width, pos.height);
			} else {
				flashState.ready = false;
			}
		}
		return this;
	};
	ZeroClipboard.prototype.on = function(eventName, func) {
		var i, len, events, added = {}, handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;
		if (typeof eventName === "string" && eventName) {
			events = eventName.toLowerCase().split(/\s+/);
		} else if (typeof eventName === "object" && eventName && typeof func === "undefined") {
			for (i in eventName) {
				if (eventName.hasOwnProperty(i) && typeof i === "string" && i && typeof eventName[i] === "function") {
					this.on(i, eventName[i]);
				}
			}
		}
		if (events && events.length) {
			for (i = 0, len = events.length; i < len; i++) {
				eventName = events[i].replace(/^on/, "");
				added[eventName] = true;
				if (!handlers[eventName]) {
					handlers[eventName] = [];
				}
				handlers[eventName].push(func);
			}
			if (added.noflash && flashState.disabled) {
				_receiveEvent.call(this, "noflash", {});
			}
			if (added.wrongflash && flashState.outdated) {
				_receiveEvent.call(this, "wrongflash", {
					flashVersion: flashState.version
				});
			}
			if (added.load && flashState.ready) {
				_receiveEvent.call(this, "load", {
					flashVersion: flashState.version
				});
			}
		}
		return this;
	};
	ZeroClipboard.prototype.off = function(eventName, func) {
		var i, len, foundIndex, events, perEventHandlers, handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;
		if (arguments.length === 0) {
			events = _objectKeys(handlers);
		} else if (typeof eventName === "string" && eventName) {
			events = eventName.split(/\s+/);
		} else if (typeof eventName === "object" && eventName && typeof func === "undefined") {
			for (i in eventName) {
				if (eventName.hasOwnProperty(i) && typeof i === "string" && i && typeof eventName[i] === "function") {
					this.off(i, eventName[i]);
				}
			}
		}
		if (events && events.length) {
			for (i = 0, len = events.length; i < len; i++) {
				eventName = events[i].toLowerCase().replace(/^on/, "");
				perEventHandlers = handlers[eventName];
				if (perEventHandlers && perEventHandlers.length) {
					if (func) {
						foundIndex = _inArray(func, perEventHandlers);
						while (foundIndex !== -1) {
							perEventHandlers.splice(foundIndex, 1);
							foundIndex = _inArray(func, perEventHandlers, foundIndex);
						}
					} else {
						handlers[eventName].length = 0;
					}
				}
			}
		}
		return this;
	};
	ZeroClipboard.prototype.handlers = function(eventName) {
		var prop, copy = null, handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;
		if (handlers) {
			if (typeof eventName === "string" && eventName) {
				return handlers[eventName] ? handlers[eventName].slice(0) : null;
			}
			copy = {};
			for (prop in handlers) {
				if (handlers.hasOwnProperty(prop) && handlers[prop]) {
					copy[prop] = handlers[prop].slice(0);
				}
			}
		}
		return copy;
	};
	var _dispatchClientCallbacks = function(eventName, context, args, async) {
		var handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers[eventName];
		if (handlers && handlers.length) {
			var i, len, func, originalContext = context || this;
			for (i = 0, len = handlers.length; i < len; i++) {
				func = handlers[i];
				context = originalContext;
				if (typeof func === "string" && typeof window[func] === "function") {
					func = window[func];
				}
				if (typeof func === "object" && func && typeof func.handleEvent === "function") {
					context = func;
					func = func.handleEvent;
				}
				if (typeof func === "function") {
					_dispatchCallback(func, context, args, async);
				}
			}
		}
		return this;
	};
	ZeroClipboard.prototype.clip = function(elements) {
		elements = _prepClip(elements);
		for (var i = 0; i < elements.length; i++) {
			if (elements.hasOwnProperty(i) && elements[i] && elements[i].nodeType === 1) {
				if (!elements[i].zcClippingId) {
					elements[i].zcClippingId = "zcClippingId_" + elementIdCounter++;
					_elementMeta[elements[i].zcClippingId] = [ this.id ];
					if (_globalConfig.autoActivate === true) {
						_addEventHandler(elements[i], "mouseover", _elementMouseOver);
					}
				} else if (_inArray(this.id, _elementMeta[elements[i].zcClippingId]) === -1) {
					_elementMeta[elements[i].zcClippingId].push(this.id);
				}
				var clippedElements = _clientMeta[this.id].elements;
				if (_inArray(elements[i], clippedElements) === -1) {
					clippedElements.push(elements[i]);
				}
			}
		}
		return this;
	};
	ZeroClipboard.prototype.unclip = function(elements) {
		var meta = _clientMeta[this.id];
		if (meta) {
			var clippedElements = meta.elements;
			var arrayIndex;
			if (typeof elements === "undefined") {
				elements = clippedElements.slice(0);
			} else {
				elements = _prepClip(elements);
			}
			for (var i = elements.length; i--; ) {
				if (elements.hasOwnProperty(i) && elements[i] && elements[i].nodeType === 1) {
					arrayIndex = 0;
					while ((arrayIndex = _inArray(elements[i], clippedElements, arrayIndex)) !== -1) {
						clippedElements.splice(arrayIndex, 1);
					}
					var clientIds = _elementMeta[elements[i].zcClippingId];
					if (clientIds) {
						arrayIndex = 0;
						while ((arrayIndex = _inArray(this.id, clientIds, arrayIndex)) !== -1) {
							clientIds.splice(arrayIndex, 1);
						}
						if (clientIds.length === 0) {
							if (_globalConfig.autoActivate === true) {
								_removeEventHandler(elements[i], "mouseover", _elementMouseOver);
							}
							delete elements[i].zcClippingId;
						}
					}
				}
			}
		}
		return this;
	};
	ZeroClipboard.prototype.elements = function() {
		var meta = _clientMeta[this.id];
		return meta && meta.elements ? meta.elements.slice(0) : [];
	};
	var _getAllClientsClippedToElement = function(element) {
		var elementMetaId, clientIds, i, len, client, clients = [];
		if (element && element.nodeType === 1 && (elementMetaId = element.zcClippingId) && _elementMeta.hasOwnProperty(elementMetaId)) {
			clientIds = _elementMeta[elementMetaId];
			if (clientIds && clientIds.length) {
				for (i = 0, len = clientIds.length; i < len; i++) {
					client = _clientMeta[clientIds[i]].instance;
					if (client && client instanceof ZeroClipboard) {
						clients.push(client);
					}
				}
			}
		}
		return clients;
	};
	_globalConfig.hoverClass = "zeroclipboard-is-hover";
	_globalConfig.activeClass = "zeroclipboard-is-active";
	_globalConfig.trustedOrigins = null;
	_globalConfig.allowScriptAccess = null;
	_globalConfig.useNoCache = true;
	_globalConfig.moviePath = "ZeroClipboard.swf";
	ZeroClipboard.detectFlashSupport = function() {
		_deprecationWarning("ZeroClipboard.detectFlashSupport", _globalConfig.debug);
		return _detectFlashSupport();
	};
	ZeroClipboard.dispatch = function(eventName, args) {
		if (typeof eventName === "string" && eventName) {
			var cleanEventName = eventName.toLowerCase().replace(/^on/, "");
			if (cleanEventName) {
				var clients = currentElement && _globalConfig.autoActivate === true ? _getAllClientsClippedToElement(currentElement) : _getAllClients();
				for (var i = 0, len = clients.length; i < len; i++) {
					_receiveEvent.call(clients[i], cleanEventName, args);
				}
			}
		}
	};
	ZeroClipboard.prototype.setHandCursor = function(enabled) {
		_deprecationWarning("ZeroClipboard.prototype.setHandCursor", _globalConfig.debug);
		enabled = typeof enabled === "boolean" ? enabled : !!enabled;
		_setHandCursor(enabled);
		_globalConfig.forceHandCursor = enabled;
		return this;
	};
	ZeroClipboard.prototype.reposition = function() {
		_deprecationWarning("ZeroClipboard.prototype.reposition", _globalConfig.debug);
		return _reposition();
	};
	ZeroClipboard.prototype.receiveEvent = function(eventName, args) {
		_deprecationWarning("ZeroClipboard.prototype.receiveEvent", _globalConfig.debug);
		if (typeof eventName === "string" && eventName) {
			var cleanEventName = eventName.toLowerCase().replace(/^on/, "");
			if (cleanEventName) {
				_receiveEvent.call(this, cleanEventName, args);
			}
		}
	};
	ZeroClipboard.prototype.setCurrent = function(element) {
		_deprecationWarning("ZeroClipboard.prototype.setCurrent", _globalConfig.debug);
		ZeroClipboard.activate(element);
		return this;
	};
	ZeroClipboard.prototype.resetBridge = function() {
		_deprecationWarning("ZeroClipboard.prototype.resetBridge", _globalConfig.debug);
		ZeroClipboard.deactivate();
		return this;
	};
	ZeroClipboard.prototype.setTitle = function(newTitle) {
		_deprecationWarning("ZeroClipboard.prototype.setTitle", _globalConfig.debug);
		newTitle = newTitle || _globalConfig.title || currentElement && currentElement.getAttribute("title");
		if (newTitle) {
			var htmlBridge = _getHtmlBridge(flashState.bridge);
			if (htmlBridge) {
				htmlBridge.setAttribute("title", newTitle);
			}
		}
		return this;
	};
	ZeroClipboard.setDefaults = function(options) {
		_deprecationWarning("ZeroClipboard.setDefaults", _globalConfig.debug);
		ZeroClipboard.config(options);
	};
	ZeroClipboard.prototype.addEventListener = function(eventName, func) {
		_deprecationWarning("ZeroClipboard.prototype.addEventListener", _globalConfig.debug);
		return this.on(eventName, func);
	};
	ZeroClipboard.prototype.removeEventListener = function(eventName, func) {
		_deprecationWarning("ZeroClipboard.prototype.removeEventListener", _globalConfig.debug);
		return this.off(eventName, func);
	};
	ZeroClipboard.prototype.ready = function() {
		_deprecationWarning("ZeroClipboard.prototype.ready", _globalConfig.debug);
		return flashState.ready === true;
	};
	var _receiveEvent = function(eventName, args) {
		eventName = eventName.toLowerCase().replace(/^on/, "");
		var cleanVersion = args && args.flashVersion && _parseFlashVersion(args.flashVersion) || null;
		var element = currentElement;
		var performCallbackAsync = true;
		switch (eventName) {
			case "load":
				if (cleanVersion) {
					if (!_isFlashVersionSupported(cleanVersion)) {
						_receiveEvent.call(this, "onWrongFlash", {
							flashVersion: cleanVersion
						});
						return;
					}
					flashState.outdated = false;
					flashState.ready = true;
					flashState.version = cleanVersion;
				}
				break;

			case "wrongflash":
				if (cleanVersion && !_isFlashVersionSupported(cleanVersion)) {
					flashState.outdated = true;
					flashState.ready = false;
					flashState.version = cleanVersion;
				}
				break;

			case "mouseover":
				_addClass(element, _globalConfig.hoverClass);
				break;

			case "mouseout":
				if (_globalConfig.autoActivate === true) {
					ZeroClipboard.deactivate();
				}
				break;

			case "mousedown":
				_addClass(element, _globalConfig.activeClass);
				break;

			case "mouseup":
				_removeClass(element, _globalConfig.activeClass);
				break;

			case "datarequested":
				if (element) {
					var targetId = element.getAttribute("data-clipboard-target"), targetEl = !targetId ? null : document.getElementById(targetId);
					if (targetEl) {
						var textContent = targetEl.value || targetEl.textContent || targetEl.innerText;
						if (textContent) {
							this.setText(textContent);
						}
					} else {
						var defaultText = element.getAttribute("data-clipboard-text");
						if (defaultText) {
							this.setText(defaultText);
						}
					}
				}
				performCallbackAsync = false;
				break;

			case "complete":
				_deleteOwnProperties(_clipData);
				if (element && element !== _safeActiveElement() && element.focus) {
					element.focus();
				}
				break;
		}
		var context = element;
		var eventArgs = [ this, args ];
		return _dispatchClientCallbacks.call(this, eventName, context, eventArgs, performCallbackAsync);
	};
	if (typeof define === "function" && define.amd) {
		define([ "require", "exports", "module" ], function(require, exports, module) {
			_amdModuleId = module && module.id || null;
			return ZeroClipboard;
		});
	} else if (typeof module === "object" && module && typeof module.exports === "object" && module.exports && typeof window.require === "function") {
		_cjsModuleId = module.id || null;
		module.exports = ZeroClipboard;
	} else {
		window.ZeroClipboard = ZeroClipboard;
	}
})(function() {
	return this;
}());

Ext.namespace('Zarafa.plugins.files.backend.Seafile.ui');

/**
 * @class Zarafa.plugins.files.backend.Seafile.ui.FilesShareDialogPanel
 * @extends Zarafa.plugins.files.ui.dialogs.SharePanel
 * @xtype filesplugin.seafile.filessharedialogpanel
 *
 * The panel contains all logic and UI elements that are needed for the OCS sharing functionality.
 */
Zarafa.plugins.files.backend.Seafile.ui.FilesShareDialogPanel = Ext.extend(Zarafa.plugins.files.ui.dialogs.SharePanel, {
	/**
	 * The loading mask of this panel
	 * @property
	 * @type Ext.LoadMask
	 */
	loadMask: undefined,

	/**
	 * Flag for the password field
	 * @property
	 * @type bool
	 */
	passwordChanged: false,

	/**
	 * Flag for the date field
	 * @property
	 * @type bool
	 */
	expirationDateChanged: false,

	/**
	 * Flag for the edit checkbox
	 * @property
	 * @type bool
	 */
	pubUploadChanged: false,

	/**
	 * The id of the linkshare, -1 if no linkshare is set
	 * @property
	 * @type Number
	 */
	linkShareID: -1,

	/**
	 * Id of the files record
	 * @property
	 * @type Number
	 */
	recordId: undefined,

	/**
	 * Parent files record
	 * @property
	 * @type {Ext.record}
	 */
	parentRecord: undefined,

	/**
	 * Constructor - init store and UI
	 *
	 * @constructor
	 * @param {Object} config the configuration for this panel
	 */
	constructor: function (config) {
		config = config || {};
		var type = config.ownerCt.records[0].get("type");
		this.recordId = config.ownerCt.records[0].get("id");
		this.parentRecord = config.ownerCt.records[0];
		Zarafa.plugins.files.backend.Seafile.data.singleton.ShareStore.init(type);
		this.setupGridStoreListeners();


		Ext.applyIf(config, {
			listeners: {
				afterrender: this.checkSharedRecord
			},
			height   : 450,
			width    : 780,
			items    : [{
				xtype     : "fieldset",
				title     : dgettext("plugin_filesbackendSeafile", "Share with user/group"),
				autoHeight: true,
				ref       : "userfieldset",
				items     : [{
					xtype : "filesplugin.seafile.filesshareusergrid",
					ref   : "../usergrid",
					height: 200,
					recordId: this.recordId
				}]
			}, {
				xtype     : "checkbox",
				fieldLabel: "",
				boxLabel  : dgettext("plugin_filesbackendSeafile", "Share via link"),
				ref       : "linkcheckbox",
				inputValue: "sharelink",
				style: {
					marginTop: '5px',
					marginLeft: '6px'
				},
				listeners : {
					check: this.onShareViaLinkChecked.createDelegate(this)
				}
			}, {
				xtype     : "fieldset",
				title     : dgettext("plugin_filesbackendSeafile", "Share via link"),
				autoHeight: true,
				ref       : "linkfieldset",
				hidden    : true,
				items     : [{
					layout  : "column",
					border  : false,
					defaults: {
						border: false
					},
					anchor  : "0",
					items   : [{
						columnWidth: 0.95,
						layout     : "form",
						items      : {
							xtype        : "textfield",
							fieldLabel   : dgettext("plugin_filesbackendSeafile", "Public link"),
							ref          : "../../../linkfield",
							anchor       : '100%',
							selectOnFocus: true,
							readOnly     : true
						}
					}, {
						columnWidth: 0.05,
						items      : {
							xtype       : "copybutton",
							swfPath     : "plugins/filesbackendSeafile/resources/flash/ZeroClipboard.swf",
							completeText: dgettext("plugin_filesbackendSeafile", "Link copied to clipboard"),
							iconCls     : "icon_copy_clipboard",
							getValue    : this.getPublicLinkValue.createDelegate(this)
						}
					}]
				}, {
					xtype     : "checkbox",
					fieldLabel: dgettext("plugin_filesbackendSeafile", "Password protect"),
					boxLabel  : "",
					ref       : "../passwordcheckbox",
					inputValue: "pwprotected",
					listeners : {
						check: this.onUsePasswordChecked.createDelegate(this)
					}
				}, {
					xtype     : "textfield",
					fieldLabel: dgettext("plugin_filesbackendSeafile", "Password"),
					ref       : "../passwordfield",
					hidden    : true,
					inputType : 'password',
					name      : "textvalue",
					listeners : {
						change: this.onPasswordChange.createDelegate(this),
						keyup : this.onPasswordChange.createDelegate(this)
					}
				}, {
					xtype     : "checkbox",
					fieldLabel: dgettext("plugin_filesbackendSeafile", "Public upload"),
					boxLabel  : "",
					hidden    : true,
					ref       : "../editcheckbox",
					inputValue: "allowediting",
					listeners : {
						check: this.onAllowEditingChecked.createDelegate(this)
					}
				}, {
					xtype     : "checkbox",
					fieldLabel: dgettext("plugin_filesbackendSeafile", "Expiration date"),
					boxLabel  : "",
					ref       : "../expirationcheckbox",
					inputValue: "useexpiration",
					listeners : {
						check: this.onUseExpirationDateChecked.createDelegate(this)
					}
				}, {
					xtype     : "datefield",
					ref       : "../expirationfield",
					hidden    : true,
					fieldLabel: dgettext("plugin_filesbackendSeafile", "Date"),
					minValue  : new Date(new Date().getTime() + (24 * 60 * 60 * 1000)), // tomorrow
					width     : 170,
					format    : 'Y-m-d',
					listeners : {
						change: this.onExpirationDateChange.createDelegate(this),
						keyup : this.onExpirationDateChange.createDelegate(this)
					}
				}]
			}],
			buttons  : [{
				xtype  : 'button',
				text   : dgettext('plugin_filesbackendSeafile', 'Ok'),
				handler: this.onDoneButtonClick,
				ref     : "../doneButton",
				scope  : this
			}, {
				xtype  : 'button',
				text   : dgettext('plugin_filesbackendSeafile', 'Cancel'),
				handler: this.onCancel,
				scope  : this
			}]
		});

		Zarafa.plugins.files.backend.Seafile.ui.FilesShareDialogPanel.superclass.constructor.call(this, config);
	},

	/**
	 * Create the onUpdate and onRemove listeners for the {@link Zarafa.plugins.files.backend.Seafile.data.ShareGridStore ShareGridStore}.
	 * @private
	 */
	setupGridStoreListeners: function () {
		var store = Zarafa.plugins.files.backend.Seafile.data.singleton.ShareStore.getStore();
		store.on("add", this.onGridStoreAdd, this);
		store.on("update", this.onGridStoreUpdate, this);
		store.on("remove", this.onGridStoreRemove, this);
	},

	/**
	 * Eventhandler for the remove event of the {@link Zarafa.plugins.files.backend.Seafile.data.ShareGridStore ShareGridStore}.
	 * If the shareid is set, it will remove the share from the backend.
	 *
	 * @param store the grid store holding share records
	 * @param record the share record to remove
	 * @private
	 */
	onGridStoreRemove: function (store, record) {
		// check if an id is set - if so, remove the old share
		if (record.get("id") != "" && record.get("id") != -1) {
			this.removeShareByID(record.get("id"));
		}
	},

	/**
	 * Eventhandler for the update event of the {@link Zarafa.plugins.files.backend.Seafile.data.ShareGridStore ShareGridStore}.
	 * This will first remove the new dirty record and then create a new one. So the save function of the store is not used :)
	 *
	 * @param store the grid store holding share records
	 * @param record the share record to update
	 * @private
	 */
	onGridStoreUpdate: function (store, record)
	{
		this.updateExistingShare(record);
	},

	/**
	 * Eventhandler for the add event of the {@link Zarafa.plugins.files.backend.Seafile.data.ShareGridStore ShareGridStore}.
	 * This will add a new entry to the gridstore.
	 *
	 * @param store the grid store holding share records
	 * @param records the share records to add
	 * @private
	 */
	onGridStoreAdd: function (store, records) {
		// Ignore the initial loading of the store
		if(records.length != 1 || records[0].get("id") != -1) {
			return true;
		}
		this.createShare(records[0], store, false);
	},

	/**
	 * Eventhandler for the checkbox change event.
	 *
	 * @param checkbox
	 * @param checked
	 * @private
	 */
	onShareViaLinkChecked: function (checkbox, checked) {
		if (checked) {
			this.linkfieldset.show();

			// create a new share
			this.createShareByLink();
		} else {
			this.linkfieldset.hide();
			this.removeShareByID(this.linkShareID);
			this.linkShareID = -1; // reset the id
		}
	},

	/**
	 * Eventhandler for the checkbox change event.
	 *
	 * @param checkbox
	 * @param checked
	 * @private
	 */
	onUsePasswordChecked: function (checkbox, checked) {
		if (checked) {
			this.passwordfield.show();
		} else {
			this.passwordfield.hide();
		}
	},

	/**
	 * Eventhandler for the textfield change event.
	 *
	 * @param field
	 * @param event
	 * @private
	 */
	onPasswordChange: function (field, event) {
		this.passwordChanged = true;
	},

	/**
	 * Eventhandler for the checkbox change event.
	 *
	 * @param checkbox
	 * @param checked
	 * @private
	 */
	onAllowEditingChecked: function (checkbox, checked) {
		this.pubUploadChanged = true;
	},

	/**
	 * Eventhandler for the checkbox change event.
	 *
	 * @param checkbox
	 * @param checked
	 * @private
	 */
	onUseExpirationDateChecked: function (checkbox, checked) {
		if (checked) {
			this.expirationfield.show();
		} else {
			this.expirationfield.hide();
		}
	},

	/**
	 * Eventhandler for the datefield change event.
	 *
	 * @private
	 */
	onExpirationDateChange: function () {
		this.expirationDateChanged = true;
	},

	/**
	 * Event handler which is triggered when the user presses the cancel
	 * {@link Ext.Button button}. This will close this dialog.
	 * @private
	 */
	onCancel : function()
	{
		this.dialog.close();
	},

	/**
	 * Return the current value of the public link textfield.
	 *
	 * @return {String} the linkfield value
	 */
	getPublicLinkValue: function () {
		return this.linkfield.getValue();
	},

	/**
	 * Close the dialog and clean all eventhandlers.
	 * @private
	 */
	closeDialog: function () {
		var store = Zarafa.plugins.files.backend.Seafile.data.singleton.ShareStore.getStore();

		store.un("update", this.onGridStoreUpdate, this);
		store.un("remove", this.onGridStoreRemove, this);

		this.dialog.close();
	},

	/**
	 * Close the loadmask
	 * @private
	 */
	closeLoadMask: function () {
		this.loadMask.hide();
	},

	/**
	 * Eventhandler for the "done" button.
	 * It will save all changes of the linkshare and close the dialog.
	 * @private
	 */
	onDoneButtonClick: function () {

		// check if we have a link or user/group share
		if (this.linkcheckbox.getValue()) { // we have a link share
			// check if we have to update the share
			this.updateExistingShare();
		} else { // we have a user/group share
			this.closeDialog();
		}
	},

	/**
	 * This method checks the dialog records for existing shares. If shares were found, it will try to load the details.
	 * @private
	 */
	checkSharedRecord: function () {
		// init loading mask after the panel was rendered
		this.loadMask = new Ext.LoadMask(this.getEl(), {msg: dgettext("plugin_filesbackendSeafile", "Loading details...")});

		// check if we have a shared record where we should load details
		if (Ext.isDefined(this.parentRecord)) {

			// enable the edit checkbox if we have a folder record
			if (this.parentRecord.get("type") === Zarafa.plugins.files.data.FileTypes.FOLDER) {
				this.editcheckbox.show();
			}

			if (this.parentRecord.get("isshared") === true) {
				this.initSharedRecord();
			}
		}
	},

	/**
	 * This method requests the sharedetails from the backend.
	 * @private
	 */
	initSharedRecord: function () {
		this.loadMask.show();

		var recIds = [this.recordId];

		container.getRequest().singleRequest(
			'filesbrowsermodule',
			'loadsharingdetails',
			{
				records: recIds
			},
			new Zarafa.plugins.files.backend.Seafile.data.ResponseHandler({
				successCallback: this.initGuiFromSharedRecord.createDelegate(this)
			})
		);
	},

	/**
	 * Callback for the loadsharingdetails response. This function will initialize the UI with the given
	 * share records.
	 *
	 * @param {Object} response the response object from the share record request
	 * @private
	 */
	initGuiFromSharedRecord: function (response) {
		var shares = response.shares[this.recordId];

		for (var shareid in shares) {
			var share = shares[shareid];
			if (share.shareType === Zarafa.plugins.files.backend.Seafile.data.RecipientTypes.LINK ) {
				// store the id of this share
				this.linkShareID = shareid;

				// change gui
				this.linkfieldset.show();
				this.linkcheckbox.suspendEvents(false); // Stop all events.
				this.linkcheckbox.setValue(true); // check checkbox
				this.linkcheckbox.resumeEvents(); // resume events
				this.linkfield.setValue(share.url);

				// check expiration
				if (!Ext.isEmpty(share.expiration)) {
					this.expirationcheckbox.setValue(true); // check checkbox
					var dt = new Date(share.expiration);
					this.expirationfield.setValue(dt);
				}
				// check password
				if (!Ext.isEmpty(share.shareWith)) {
					this.passwordcheckbox.setValue(true); // check checkbox
					this.passwordfield.setValue("******");
				}
				//check permissions
				if (!Ext.isEmpty(share.permissions)) {
					if (parseInt(share.permissions, 10) === 7) {
						this.editcheckbox.suspendEvents(false); // Stop all events.
						this.editcheckbox.setValue(true); // check checkbox
						this.editcheckbox.resumeEvents(); // resume events
					}
				}
			} else if (share.shareType === Zarafa.plugins.files.backend.Seafile.data.RecipientTypes.GROUP) {
				Zarafa.plugins.files.backend.Seafile.data.singleton.ShareStore.addGroup(share);
			} else {
				Zarafa.plugins.files.backend.Seafile.data.singleton.ShareStore.addUser(share);
			}

			this.doneButton.setDisabled(false);
		}

		this.loadMask.hide();
	},

	/**
	 * This method will request the creation of a new linkshare from the backend.
	 * @private
	 */
	createShareByLink: function () {
		this.loadMask.show();

		var recIds = [this.recordId];

		var shareOpts = {
			shareType: Zarafa.plugins.files.backend.Seafile.data.RecipientTypes.LINK
		};

		container.getRequest().singleRequest(
			'filesbrowsermodule',
			'createnewshare',
			{
				records: recIds,
				options: shareOpts
			},
			new Zarafa.plugins.files.backend.Seafile.data.ResponseHandler({
				successCallback: this.shareByLinkCreated.createDelegate(this),
				failureCallback: this.closeDialog.createDelegate(this)
			})
		);
	},

	/**
	 * Callback for the createnewshare response. It will update the parent record and the UI.
	 *
	 * @param {Object} response the share link creation response
	 * @private
	 */
	shareByLinkCreated: function (response) {
		var share = response.shares[this.recordId.replace(/\/+$/g, "")];
		this.linkfield.setValue(share["url"]);

		// store the id of this share
		this.linkShareID = share["id"];

		var recIds = this.parentRecord.get("sharedid") || [];
		recIds.push(share["id"]);

		// also update the parent record
		this.parentRecord.set("sharedid", recIds);
		this.parentRecord.set("isshared", true);

		// enable the done button
		this.doneButton.setDisabled(false);

		this.loadMask.hide();
	},

	/**
	 * This method will request the deletion of a one share from the backend.
	 * @private
	 */
	removeShareByID: function (id) {
		this.loadMask.show();
		var accId = this.parentRecord.getAccount().get("id");

		container.getRequest().singleRequest(
			'filesbrowsermodule',
			'deleteexistingshare',
			{
				records  : [id],
				accountid: accId
			},
			new Zarafa.plugins.files.backend.Seafile.data.ResponseHandler({
				successCallback: this.shareByIDRemoved.createDelegate(this, [id], true),
				failureCallback: this.closeDialog.createDelegate(this)
			})
		);
	},

	/**
	 * Callback for the deleteexistingshare response. It will update the parent record and the UI.
	 *
	 * @param {Object} response
	 * @param {Number} id
	 * @private
	 */
	shareByIDRemoved: function (response, id) {
		var recIds = this.parentRecord.get("sharedid") || [];
		var index = recIds.indexOf(id);

		if (index > -1) {
			recIds.splice(index, 1); // remove the id from the array
		}

		// also update the parent record
		this.parentRecord.set("sharedid", recIds);

		if (recIds.length == 0) {
			this.parentRecord.set("isshared", false);
		}
		this.loadMask.hide();
	},

	/**
	 * This method will request the creation or update of a user or group share from the backend.
	 *
	 * @param record holding data for the share to be create
	 * @param store the gridstore
	 * @private
	 */
	createShare: function (record, store)
	{
		this.loadMask.show();
		var recIds = [this.recordId]; // we're only going to share one file
		var permissions = this.getPermissions(record);
		var shareOpts = {
			shareType: record.get("type") === "user" ? Zarafa.plugins.files.backend.Seafile.data.RecipientTypes.USER : Zarafa.plugins.files.backend.Seafile.data.RecipientTypes.GROUP,
			shareWith: record.get("shareWith"),
			permissions: permissions,
			shareWithDisplayname: record.get("shareWithDisplayname")
		};

		container.getRequest().singleRequest(
			'filesbrowsermodule',
			'createnewshare',
			{
				records: recIds,
				options: shareOpts
			},
			new Zarafa.plugins.files.backend.Seafile.data.ResponseHandler({
				successCallback: this.shareCreated.createDelegate(this, [shareOpts, record], true),
				failureCallback: this.shareFailed.createDelegate(this, [store, record])
			})
		);
	},

	/**
	 * successCallback for the createnewshare response. It will update the parent record and the UI.
	 *
	 * @param {Object} response the response object from the createnewshare request
	 * @param {Object} shareOpts object with sharing options
	 * @param {Ext.data.Record} record share options record.
	 * @private
	 */
	shareCreated: function (response, shareOpts, record)
	{
		var share = response.shares[this.recordId.replace(/\/+$/g, "")];
		var recIds = this.parentRecord.get("sharedid") || [];
		recIds.push(share["id"]);
		record.data.id = share["id"];

		// update the parent record
		this.parentRecord.set("sharedid", recIds);
		this.parentRecord.set("isshared", true);
		shareOpts.id = share.id;

		this.loadMask.hide();
	},

	/**
	 * failureCallback for the createnewshare response. It will remove the record that has been tried to add.
	 * @param store the grid store
	 * @param record record that should be created
	 * @private
	 */
	shareFailed: function (store, record) {
		store.remove(record);
				this.loadMask.hide();
		},

	/**
	 * This method will request the modification of the lin share options from the backend.
	 *
	 * @param {Ext.data.Record} record share options record.
	 */
	updateExistingShare: function (record)
	{
		this.loadMask.show();
		var shareOpts = {};
		var records = [];
		if (Ext.isDefined(record)) {
			shareOpts["permissions"] = this.getPermissions(record);
			records.push(record.get("id"));
		} else {
			if (this.passwordChanged) {
				shareOpts["password"] = this.passwordfield.getValue();
			}
			if (!this.passwordcheckbox.getValue()) {
				shareOpts["password"] = "";
			}
			if (this.pubUploadChanged) {
				// don't use publicUpload as this flag does not work (yet?) - ocs bug

				if (this.editcheckbox.getValue()) {
					shareOpts["permissions"] = 7;
				} else {
					shareOpts["permissions"] = 1;
				}
			}
			if (this.expirationDateChanged) {
				shareOpts["expireDate"] = this.expirationfield.getRawValue();
			}
			if (!this.expirationcheckbox.getValue()) {
				shareOpts["expireDate"] = "";
			}
			records.push(this.linkShareID);
		}

		container.getRequest().singleRequest(
			'filesbrowsermodule',
			'updateexistingshare',
			{
				records: records,
				accountid: this.parentRecord.getAccount().get("id"),
				options: shareOpts
			},
			new Zarafa.plugins.files.backend.Seafile.data.ResponseHandler({
				successCallback: this.shareByLinkUpdated.createDelegate(this, [record]),
				failureCallback: this.closeLoadMask.createDelegate(this)
			})
		);
	},

	/**
	 * Callback for the updateexistingshare response. This function simply closes the dialog.
	 *
	 * @param {Ext.data.Record} record share options record.
	 * @private
	 */
	shareByLinkUpdated: function (record)
	{
		this.loadMask.hide();
		if (!Ext.isDefined(record)) {
			this.closeDialog();
		}
	},

	/**
	 * Helper function to get permission from record.
	 *
	 * @param {Ext.data.Record} record share options record.
	 * @returns {number} permissions return calculated permissions.
	 */
	getPermissions: function (record)
	{
		var permissions = 1;
		if (record.get("permissionChange")) {
			permissions += 2;
		}
		if (record.get("permissionCreate")) {
			permissions += 4;
		}
		if (record.get("permissionDelete")) {
			permissions += 8;
		}
		if (record.get("permissionShare")) {
			permissions += 16;
		}

		return permissions;
	}
});

Ext.reg('filesplugin.seafile.filessharedialogpanel', Zarafa.plugins.files.backend.Seafile.ui.FilesShareDialogPanel);

Ext.namespace('Zarafa.plugins.files.backend.Seafile.ui');

/**
 * @class Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserEditContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 * @xtype filesplugin.seafile.filesshareusereditcontentpanel
 *
 * This content panel contains the sharing edit panel.
 */
Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserEditContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {
	/**
	 * The load mask for this content panel
	 * @property
	 * @type Ext.LoadMask
	 */
	loadMask: undefined,

	/**
	 * @constructor
	 * @param config
	 */
	constructor: function (config) {
		Ext.applyIf(config, {
			layout     : 'fit',
			title      : dgettext('plugin_filesbackendSeafile', 'Share Details'),
			closeOnSave: true,
			model      : true,
			autoSave   : false,
			width      : 480,
			height     : 445,
			items:{
				xtype : 'filesplugin.seafile.filesshareusereditpanel',
				record: config.record,
				store : config.store,
				recordId: config.recordId
			}
		});
		Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserEditContentPanel.superclass.constructor.call(this, config);
	}
});

Ext.reg('filesplugin.seafile.filesshareusereditcontentpanel', Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserEditContentPanel);

Ext.namespace('Zarafa.plugins.files.backend.Seafile.ui');

/**
 * @class Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserEditPanel
 * @extends Ext.form.FormPanel
 * @xtype filesplugin.seafile.filesshareusereditpanel
 *
 * This content panel contains the sharing edit panel.
 */
Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserEditPanel = Ext.extend(Ext.form.FormPanel, {

	/**
	 * @cfg {Ext.record} Ext.record to be edited
	 */
	record : undefined,

	/**
	 * @cfg {Ext.data.arrayStore} store holding the user and group share data
	 */
	store : undefined,

	/**
	 * @cfg {String} record id of the parent files record
	 */
	recordId: undefined,

	/**
	 * @constructor
	 * @param config
	 */
	constructor: function (config)
	{
		if (config.record) {
			this.record = config.record;
		}

		if (config.store) {
			this.store = config.store;
		}

		if (config.recordId) {
			this.recordId = config.recordId;
		}

		Ext.applyIf(config || {}, {
			labelAlign : 'left',
			defaultType: 'textfield',
			items      : this.createPanelItems(),
			buttons    : [{
					text   : dgettext('plugin_filesbackendSeafile', 'Save'),
					handler: this.doSave,
					scope  : this
				},
				{
					text   : dgettext('plugin_filesbackendSeafile', 'Cancel'),
					handler: this.doClose,
					scope  : this
				}]
		});

		Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserEditPanel.superclass.constructor.call(this, config);
	},

	/**
	 * Eventhandler for the Cancel button, closing this dialog
	 */
	doClose: function ()
	{
		this.ownerCt.dialog.close();
	},

	/**
	 * Save the share data to the share gridstore.
	 * Create a new record or update an existing one.
	 */
	doSave: function () {
		var recipientRecord = this.shareWith.getStore().getAt(this.shareWith.selectedIndex);
		if (this.record) {
			this.record.beginEdit();
			// When we have a recipientRecord here, this means the user has refreshed or changed it.
			// Otherwise we just keep the original values and update the permissions.
			if (recipientRecord) {
				this.record.set('type', this.type.getValue());
				this.record.set('shareWith', recipientRecord.data.shareWith);
				this.record.set('shareWithDisplayname', recipientRecord.data.display_name);
			}
			this.record.set('permissionShare', this.permissionShare.getValue());
			this.record.set('permissionChange', this.permissionChange.getValue());
			this.record.set('permissionCreate', this.store.fileType === Zarafa.plugins.files.data.FileTypes.FOLDER ? this.permissionCreate.getValue() : false);
			this.record.set('permissionDelete', this.store.fileType === Zarafa.plugins.files.data.FileTypes.FOLDER ? this.permissionDelete.getValue() : false);
			this.record.endEdit();
		} else {
			var record = new this.store.recordType({
				id         : -1,
				type  : this.type.getValue(),
				shareWith: recipientRecord.data.shareWith,
				shareWithDisplayname: recipientRecord.data.display_name,
				permissionCreate    : this.store.fileType === Zarafa.plugins.files.data.FileTypes.FOLDER ? this.permissionCreate.getValue() : false,
				permissionChange: this.permissionChange.getValue(),
				permissionDelete  : this.store.fileType === Zarafa.plugins.files.data.FileTypes.FOLDER ? this.permissionDelete.getValue() : false,
				permissionShare: this.permissionShare.getValue()
			});
			this.store.add(record);
		}
		this.ownerCt.dialog.close();
	},

	/**
	 * Function will create panel items for {@link Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserEditPanel FilesShareUserEditPanel}
	 * @return {Array} array of items that should be added to panel.
	 * @private
	 */
	createPanelItems: function () {
		var type = "user"; // user or group
		var shareWithDisplayname = ""; // user/group displayname
		var permissionCreate = false;
		var permissionChange = false;
		var permissionDelete = false;
		var permissionShare = false;
		if (this.record) {
			type = this.record.get('type');
			shareWithDisplayname = this.record.get('shareWithDisplayname');
			permissionShare = this.record.get('permissionShare');
			permissionChange = this.record.get('permissionChange');
			if (this.store.fileType === Zarafa.plugins.files.data.FileTypes.FOLDER) {
				permissionCreate = this.record.get('permissionCreate');
				permissionDelete = this.record.get('permissionDelete');
			}
		}

		var permissionItems = [
			{
				xtype     : 'checkbox',
				fieldLabel: dgettext('plugin_filesbackendSeafile', 'Re-share'),
				name      : 'permissionShare',
				ref       : '../permissionShare',
				checked   : permissionShare
			},
			{
				xtype     : 'checkbox',
				fieldLabel: dgettext('plugin_filesbackendSeafile', 'Change'),
				name      : 'permissionChange',
				ref       : '../permissionChange',
				checked   : permissionChange
			}
		];
		if (this.store.fileType === Zarafa.plugins.files.data.FileTypes.FOLDER) {
			permissionItems.push(
				{
					xtype     : 'checkbox',
					fieldLabel: dgettext('plugin_filesbackendSeafile', 'Create'),
					name      : 'permissionCreate',
					ref       : '../permissionCreate',
					checked   : permissionCreate
				},
				{
					xtype     : 'checkbox',
					fieldLabel: dgettext('plugin_filesbackendSeafile', 'Delete'),
					name      : 'permissionDelete',
					ref       : '../permissionDelete',
					checked   : permissionDelete
				}
			);
		}

		return [
			{
				xtype     : 'filesplugin.seafile.usergrouppredictorfield',
				fieldLabel: dgettext('plugin_filesbackendSeafile', 'Share with'),
				name      : 'shareWith',
				ref       : 'shareWith',
				allowBlank: false,
				value     : shareWithDisplayname,
				recordId  : this.recordId
			},
			{
				xtype     : 'selectbox',
				fieldLabel: dgettext('plugin_filesbackendSeafile', 'Type'),
				name      : 'type',
				ref       : 'type',
				allowBlank: false,
				value     : type,
				store     : [
					["user", "User"],
					["group", "Group"]
				],
				mode      : 'local'
			},
			{
				xtype      : 'fieldset',
				title      : dgettext('plugin_filesbackendSeafile', 'Permissions'),
				defaults   : {
					labelWidth: 89,
					anchor    : '100%',
					xtype     : 'textfield'
				},
				items      : permissionItems
			}
		];
	}
});

Ext.reg('filesplugin.seafile.filesshareusereditpanel', Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserEditPanel);

Ext.namespace('Zarafa.plugins.files.backend.Seafile.ui');

/**
 * @class Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserGrid
 * @extends Ext.grid.GridPanel
 * @xtype filesplugin.seafile.filesshareusergrid
 *
 * The main gridpanel for our share list. It will display user and group shares.
 */
Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserGrid = Ext.extend(Ext.grid.GridPanel, {

	/**
	 * @cfg {Object} The account store.
	 */
	store: undefined,

  /**
   * @cfg {Number} The parent record id
   */
  recordId: undefined,

	/**
	 * @constructor
	 * @param {Object} config
	 */
	constructor: function (config) {
		config = config || {};

		this.store = Zarafa.plugins.files.backend.Seafile.data.singleton.ShareStore.getStore();

		Ext.applyIf(config, {
			xtype       : 'filesplugin.seafile.filesshareusergrid',
			ref         : 'sharegrid',
			store       : this.store,
			border      : false,
			baseCls     : 'shareGrid',
			enableHdMenu: false,
			loadMask    : this.initLoadMask(),
			viewConfig  : this.initViewConfig(),
			sm          : this.initSelectionModel(),
			cm          : this.initColumnModel(),
			listeners   : {
				rowdblclick: this.onRowDblClick,
				scope      : this
			},
			tbar        : [{
				iconCls: 'filesplugin_icon_add',
				text   : dgettext('plugin_filesbackendSeafile', 'Add'),
				handler: this.onAdd.createDelegate(this)
			}, '-', {
				iconCls : 'filesplugin_icon_delete',
				text    : dgettext('plugin_filesbackendSeafile', 'Delete'),
				ref     : '../removeAccountBtn',
				disabled: true,
				handler : this.onDelete.createDelegate(this)
			}]
		});

		Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserGrid.superclass.constructor.call(this, config);
	},

	/**
	 * Initialize the {@link Ext.grid.GridPanel.loadMask} field.
	 *
	 * @return {Ext.LoadMask} The configuration object for {@link Ext.LoadMask}
	 * @private
	 */
	initLoadMask: function () {
		return {
			msg: dgettext('plugin_filesbackendSeafile', 'Loading users and groups') + '...'
		};
	},

	/**
	 * Initialize the {@link Ext.grid.GridPanel#viewConfig} field.
	 *
	 * @return {Ext.grid.GridView} The configuration object for {@link Ext.grid.GridView}
	 * @private
	 */
	initViewConfig: function () {
		// enableRowBody is used for enabling the rendering of
		// the second row in the compact view model. The actual
		// rendering is done in the function getRowClass.
		//
		// NOTE: Even though we default to the extended view,
		// enableRowBody must be enabled here. We disable it
		// later in onContextViewModeChange(). If we set false
		// here, and enable it later then the row body will never
		// be rendered. So disabling after initializing the data
		// with the rowBody works, but the opposite will not.

		return {
			enableRowBody : false,
			forceFit      : true,
			emptyText     : '<div class=\'emptytext\'>' + dgettext('plugin_filesbackendSeafile', 'Add users or groups to share files.') + '</div>',
			deferEmptyText: false
		};
	},

	/**
	 * Initialize the {@link Ext.grid.GridPanel.sm SelectionModel} field.
	 *
	 * @return {Ext.grid.RowSelectionModel} The subclass of {@link Ext.grid.AbstractSelectionModel}
	 * @private
	 */
	initSelectionModel: function () {
		return new Ext.grid.RowSelectionModel({
			singleSelect: true,
			listeners   : {
				selectionchange: this.onRowSelected
			}
		});
	},

	/**
	 * Initialize the {@link Ext.grid.GridPanel.cm ColumnModel} field.
	 *
	 * @return {Ext.grid.ColumnModel} The {@link Ext.grid.ColumnModel} for this grid
	 * @private
	 */
	initColumnModel: function () {
		return new Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserGridColumnModel({fileType: this.store.fileType});
	},

	/**
	 * Function is called if a row in the grid gets selected.
	 *
	 * @param selectionModel
	 * @private
	 */
	onRowSelected: function (selectionModel) {
		var remButton = this.grid.removeAccountBtn;
		remButton.setDisabled(selectionModel.getCount() != 1);
	},

	/**
	 * Eventhandler that is triggered if a grid row gets double clicked. It will open the user edit dialog.
	 *
	 * @param grid the grid holding the share records
	 * @param rowIndex index of the currently selected record
	 */
	onRowDblClick: function (grid, rowIndex) {
		Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['filesplugin.seafile.useredit'], undefined, {
			store  : grid.getStore(),
			record : grid.getStore().getAt(rowIndex),
			manager: Ext.WindowMgr,
			recordId: this.recordId
		});
	},

	/**
	 * Eventhandler for the add button. It will create a new grid entry and starts the editor for the newly created
	 * entry.
	 *
	 * @param btn
	 * @param event
	 * @private
	 */
	onAdd: function (btn, event) {
		Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['filesplugin.seafile.useredit'], undefined, {
			store  : this.store,
			manager: Ext.WindowMgr,
			recordId: this.recordId
		});
	},

	/**
	 * Eventhandler for the delete button. It will remove the selected record from the grid.
	 *
	 * @param button
	 * @param event
	 * @private
	 */
	onDelete: function (button, event) {
		var rec = this.getSelectionModel().getSelected();
		if (!rec) {
			return false;
		}
		this.store.remove(rec);
	}
});

Ext.reg('filesplugin.seafile.filesshareusergrid', Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserGrid);

Ext.namespace('Zarafa.plugins.files.backend.Seafile.ui');

/**
 * @class Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserGridColumnModel
 * @extends Zarafa.common.ui.grid.ColumnModel
 *
 * The Column model for the share grid.
 */
Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserGridColumnModel = Ext.extend(Zarafa.common.ui.grid.ColumnModel, {

	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor: function (config) {
		config = config || {};

		this.defaultColumns = this.createDefaultColumns(config.fileType);

		Ext.applyIf(config, {
			columns : this.defaultColumns,
			defaults: {
				sortable: true
			}
		});
		Ext.apply(this, config);

		Zarafa.plugins.files.backend.Seafile.ui.FilesShareUserGridColumnModel.superclass.constructor.call(this, config);
	},

	/**
	 * Create an array of {@link Ext.grid.Column columns} which must be visible within
	 * the default view of this {@link Ext.grid.ColumnModel ColumnModel}.
	 * @param {Zarafa.plugins.files.data.FileTypes} fileType folder or file
	 * @return {Ext.grid.Column|Array} The array of columns
	 * @private
	 */
	createDefaultColumns: function (fileType) {
		var columns = [
      {
				header   : dgettext('plugin_filesbackendSeafile', 'Name'),
				dataIndex: 'shareWithDisplayname',
				flex     : 1,
				sortable : true,
				tooltip  : dgettext('plugin_filesbackendSeafile', 'Sort by: Name')
			}, {
				header   : dgettext('plugin_filesbackendSeafile', 'Type'),
				dataIndex: 'type',
				flex	   : 1,
				align	   : 'center',
				sortable : true,
				renderer : this.shareTypeRenderer,
				tooltip  : dgettext('plugin_filesbackendSeafile', 'Sort by: Type')
			}, {
				header   : dgettext('plugin_filesbackendSeafile', 'Share'),
				dataIndex: 'permissionShare',
				flex	   : 1,
				align	   : 'center',
				sortable : false,
				renderer : this.yesNoRenderer
			}, {
				header   : dgettext('plugin_filesbackendSeafile', 'Change'),
				dataIndex: 'permissionChange',
				flex 	   : 1,
				align    : 'center',
				sortable : false,
				renderer : this.yesNoRenderer
			}];
			if (fileType === Zarafa.plugins.files.data.FileTypes.FOLDER) {
				columns.push(
				{
					header   : dgettext('plugin_filesbackendSeafile', 'Create'),
					dataIndex: 'permissionCreate',
					flex     : 1,
					align    : 'center',
					sortable : false,
					renderer : this.yesNoRenderer
				}, {
					header   : dgettext('plugin_filesbackendSeafile', 'Delete'),
					dataIndex: 'permissionDelete',
					flex     : 1,
					align    : 'center',
					sortable : false,
					renderer : this.yesNoRenderer
				});
			}
		return columns;
	},

	/**
	 * This renderer will render the type column. It will set the css class either to group or user.
	 *
	 * @param value
	 * @param p
	 * @param record
	 * @return {string}
	 */
	shareTypeRenderer: function (value, p, record) {

		p.css = "shareicon_16_" + value;

		// add extra css class for empty cell
		p.css += ' zarafa-grid-empty-cell';

		return '';
	},

	/**
	 * This renderer will render the boolean columns.
	 * It will show nice icons for true and false.
	 *
	 * @param value
	 * @param p
	 * @param record
	 * @return {string}
	 */
	yesNoRenderer: function (value, p, record) {

		if (value) {
			p.css = "shareicon_16_yes";
		} else {
			p.css = "shareicon_16_no";
		}

		// add extra css class for empty cell
		p.css += ' zarafa-grid-empty-cell';

		return '';
	}
});

Ext.namespace('Zarafa.plugins.files.backend.Seafile.ui');

/**
 * @class Zarafa.plugins.files.backend.Seafile.ui.UserGroupPredictorField
 * @extends Ext.form.ComboBox
 * @xtype filesplugin.seafile.usergrouppredictorfield
 *
 * This ComboBox automatically searches for the correct user/group name.
 */
Zarafa.plugins.files.backend.Seafile.ui.UserGroupPredictorField = Ext.extend(Ext.form.ComboBox, {
	/**
	 * @constructor
	 * @param config
	 */
	constructor: function (config) {
		var recipientStore = new Ext.data.ArrayStore({
			proxy : new Ext.data.HttpProxy({
				method: 'GET',
				url: container.getBasePath() + 'index.php'
			}),
			method: 'GET',
			baseParams: {
				load: 'custom',
				name: 'files_get_recipients',
				id: config.recordId
			},
			id: 1,
			fields: [
				'display_name',
				'shareWith',
				'object_type'
			]
		});
		config = config || {};
		Ext.applyIf(config, {
			store: recipientStore,
			displayField: 'display_name',
			typeAhead: false,
			forceSelection: true,
			triggerAction: 'query',
			itemId: 'predictor',
			mode: 'remote',
			minChars: 2,
			emptyText: dgettext('plugin_filesbackendSeafile', 'Type to search'),
			loadingText: dgettext('plugin_filesbackendSeafile', 'Loading...'),
			listEmptyText: dgettext('plugin_filesbackendSeafile', 'No results'),
			itemSelector: 'div.ugpredic_search_item',
			tpl: new Ext.XTemplate(
				'<tpl for=".">',
				'<div class="ugpredic_search_item">',
				'<h3>',
				'<tpl if="object_type == Zarafa.plugins.files.backend.Seafile.data.RecipientTypes.USER"><span><div class="shareicon_16_user">&nbsp;</div></span></tpl>',
				'<tpl if="object_type == Zarafa.plugins.files.backend.Seafile.data.RecipientTypes.GROUP"><span><div class="shareicon_16_group">&nbsp;</div></span></tpl>',
				'{display_name:htmlEncode}',
				'</h3>',
				'</div>',
				'</tpl>',
				'</tpl>'
			),
			onSelect: this.onSuggestionSelect,
			listeners : {
				invalid : this.onInvalid,
				scope : this
			}
		});

		Zarafa.plugins.files.backend.Seafile.ui.UserGroupPredictorField.superclass.constructor.call(this, config);
	},

	/**
	 * OnSelect handler for the userGroupPredictor combo box
	 * @param record the selected record
	 */
	onSuggestionSelect: function(record) {
		this.setRawValue(record.get('display_name'));
		// also set the group field
		this.ownerCt['type'].setValue((record.get('object_type') == Zarafa.plugins.files.backend.Seafile.data.RecipientTypes.USER) ? 'user' : 'group');
		this.collapse();
	},

	/**
	 * Function which is fire after the field has been marked as invalid.
	 * It will collapse suggestions list if it's open.
	 */
	onInvalid: function ()
	{
		if (this.isExpanded()) {
			this.store.removeAll();
			this.collapse();
		}
	}
});

Ext.reg('filesplugin.seafile.usergrouppredictorfield', Zarafa.plugins.files.backend.Seafile.ui.UserGroupPredictorField);

Ext.namespace('Zarafa.plugins.files.backend.Seafile.data.singleton');

/**
 * @class Zarafa.plugins.files.backend.Seafile.data.singleton.ShareStore
 * @extends Object
 *
 * This singleton provides access to the {@link Zarafa.plugins.files.backend.Seafile.data.ShareGridStore ShareGridStore}.
 * It must be initialized once by calling the init method.
 */
Zarafa.plugins.files.backend.Seafile.data.singleton.ShareStore = Ext.extend(Object, {

	/**
	 * @property
	 * @type Zarafa.plugins.files.data.AccountStore
	 * @private
	 */
	store: undefined,

	/**
	 * Triggers a call to the backend to load version information.
	 * @param {Number} fileType folder or file
	 */
	init: function (fileType) {
		this.store = new Zarafa.plugins.files.backend.Seafile.data.ShareGridStore(fileType);
	},

	/**
	 * Loads userdata to the store.
	 *
	 * @param {Object} shareOpts object with the sharing options
	 * Possible values of shareOpts are:
	 * - id: the id oof the share
         * - shareWith: seafile internal user identifier
         * - shareWithDisplayname: the shareusers displayname
         * - permissions: bytecode presentation of the chare permissions
         * - shareType: type of the share, one of Zarafa.plugins.files.backend.Seafile.data.RecipientTypes
	 */
	addUser: function (shareOpts) {
		var permissionCreate = false;
		var permissionChange = false;
		var permissionDelete = false;
		var permissionShare = false;

		// parse the permission number
		if ((shareOpts.permissions - 16) >= 1) {
			permissionShare = true;
			shareOpts.permissions -= 16;
		}
		if ((shareOpts.permissions - 8) >= 1) {
			permissionDelete = true;
			shareOpts.permissions -= 8;
		}
		if ((shareOpts.permissions - 4) >= 1) {
			permissionCreate = true;
			shareOpts.permissions -= 4;
		}
		if ((shareOpts.permissions - 2) >= 1) {
			permissionChange = true;
		}

		var record = [shareOpts.id, shareOpts.shareWith, shareOpts.shareWithDisplayname, "user", permissionCreate, permissionChange, permissionDelete, permissionShare];

		this.store.loadData([record], true);
	},

	/**
	 * Loads groupdata to the store.
	 *
	 * @param {Object} shareOpts object with the sharing options
	 * Possible values of shareOpts are:
	 * - id: the id oof the share
         * - shareWith: seafile internal user identifier
         * - shareWithDisplayname: the shareusers displayname
         * - permissions: bytecode presentation of the chare permissions
         * - shareType: type of the share, one of Zarafa.plugins.files.backend.Seafile.data.RecipientTypes
	 */
	addGroup: function (shareOpts) {
		var permissionCreate = false;
		var permissionChange = false;
		var permissionDelete = false;
		var permissionShare = false;

		// parse the permission number
		if ((shareOpts.permissions - 16) >= 1) {
			permissionShare = true;
			shareOpts.permissions -= 16;
		}
		if ((shareOpts.permissions - 8) >= 1) {
			permissionDelete = true;
			shareOpts.permissions -= 8;
		}
		if ((shareOpts.permissions - 4) >= 1) {
			permissionCreate = true;
			shareOpts.permissions -= 4;
		}
		if ((shareOpts.permissions - 2) >= 1) {
			permissionChange = true;
		}

		var record = [shareOpts.id, shareOpts.shareWith, shareOpts.shareWithDisplayname, "group", permissionCreate, permissionChange, permissionDelete, permissionShare];

		this.store.loadData([record], true);
	},

	/**
	 * Get instance of the {@link Zarafa.plugins.files.data.AccountStore Accountstore}
	 * @return {Zarafa.plugins.files.data.AccountStore} the account store
	 */
	getStore: function () {
		return this.store;
	}
});

// Make it a Singleton
Zarafa.plugins.files.backend.Seafile.data.singleton.ShareStore = new Zarafa.plugins.files.backend.Seafile.data.singleton.ShareStore();
