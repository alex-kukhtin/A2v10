
app.modules['std:log'] = function () {
	return {
		info: info,
		time: countTime
	};

	function info(msg) {
		/*TODO: слишком долго, нужно режим debug/release*/
		//console.info(msg);
	}

	function countTime(msg, start) {
		console.warn(msg + (performance.now() - start).toFixed(2) + ' ms');
	}
};
