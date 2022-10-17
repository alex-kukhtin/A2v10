
/*
 * server module function
*/

module.exports = function (prms, args) {

	let v = {};
	for (let p in prms)
		v[p] = prms[p];
	for (let a in args)
		v[a] = args[a];
	v.FROM_SCRIPT = `aa2\\2\"33\'444`;

	
	//return Object.assign(prms, args, {'5':[1, 2, 3, 4, ...Object.keys(prms)]});

	let r = this.fetch(this.config.appSettings('ProcS').url + '/api/process/start', {
		method: 'post',
		body: {
			processId: "bioprocs/donorpaid",
			parameters: {
				visitId: 107,
				donorId: 400.56
			}
		},
		query: {
			param1: 'I am the українська',
			param2: 234,
			param3: true
		},
		authorization: {
			type: "basic",
			name: 'user name here',
			password: 'password:here'
		}

	});
	//return r;

/*
	let dm = this.executeSql({
		procedure: "a2demo.[GetWeather.Load]",
		parameters: {
			UserId: prms.UserId
		}
	});
	*/
	//return dm;

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


	try {
		let url = dm.Weather.Url + '?q=London&appid=' + this.config.appSettings('openweathermap').appid;
		//return url;

		let resp = this.fetch(url, {
			method: 'GET',
			headers: {
				ContentType:'application/json',
			},
			body: {
				visitId: 500,
				donorId: 50
			}
		});

		if (!resp.ok)
			return JSON.stringify({ status: resp.status, statusText: resp.statusText, contentType: resp.contentType, ok: resp.ok, isJson: resp.isJson });
		else
			return resp.json();

	} catch (err) {
		return { catch: true, error: err };
	}
};