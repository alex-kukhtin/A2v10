module.exports = function (prms, args) {

	let xm = this.loadModel({
		procedure: 'a2demo.TestApiSql',
		parameters: {
			Tenant: prms.Tenant,
			Name: prms.Name
		}
	});

	//this.sendSms(xm.Result.Phone, 'from script.js', '');

	return {
		model: xm,
		args,
		prms
	};
};