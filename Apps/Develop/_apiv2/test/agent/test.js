
module.exports = function (prms, args) {

	var url = this.config.appSettings('ProcS').url + '/api/process/start'
	return {
		url: url,
		args,
		prms
	};
};