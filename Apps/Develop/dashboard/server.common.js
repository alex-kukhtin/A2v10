
/*
 * server module common
*/

module.exports = function(p, a) {
	return {
		toCall: function() {
			return {
				fromServer: 'FROM common',
				prms:p,
				args:a
			};
		},
		prms: p,
		args: a
	};
};