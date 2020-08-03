
/*
 * server module function
*/

module.exports = function (prms) {

	let dm = this.loadModel({
		procedure: "a2demo.[Model.For.Server]",
		parameters: {
			UserId: prms.UserId,
			Mode: prms.StrVal
		}
	});

	/*
	try {
		let dm = this.loadModel({
			procedure: "a2demo.[Model.For.Server]",
			parameters: {
				UserId: prms.UserId,
				Mode: prms.StrVal
			}
		});
	} catch (err) {
		return { catch: true, error: err };
	}
	*/

	return dm;

	let rv = Object.assign(prms);
	rv.NumVal += 100;
	rv.Date = new Date(prms.DateVal);
	return rv;
};