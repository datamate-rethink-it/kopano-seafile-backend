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
