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
