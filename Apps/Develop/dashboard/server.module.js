
/*
 * server module function
*/

module.exports = function (prms) {

	let dm = this.loadModel({
		procedure: "a2demo.[GetWeather.Load]",
		parameters: {
			UserId: prms.UserId
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

	//return dm.Weather.Url;

	let rv = Object.assign(prms);
	rv.NumVal += 100;
	rv.Date = new Date(prms.DateVal);
	//rv.WarehouseName = dm.Warehouses[0].Name;


	let url = dm.Weather.Url + '?q=London&appid=' + this.config.appSettings('openweathermap').appid;
	//return url;

	let resp = this.fetch(url);

	return resp.coord;
};