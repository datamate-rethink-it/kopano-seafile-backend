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
