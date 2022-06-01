
/*
 * server module common
*/

module.exports = function (prms, args) {
	return {
		toCall: function () {
			return {
				fromServer: 'FROM common',
				prms,
				args
			};
		}
	};
};