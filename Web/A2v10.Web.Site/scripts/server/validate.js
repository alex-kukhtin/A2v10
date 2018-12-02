
(function () {
	const serverData = $$server();

	// model from DB
	var dmDb = serverData.dataModelDb; 
	// model from Request
	var dbRq = serverData.dataModelRq;

	let result = dbRq.$forceValidate();

	if (!result || result.length === 0)
		return null;

	return JSON.stringify(result);
})();
