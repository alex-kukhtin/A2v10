
app.modules['std:log'] = function () {

	let _traceEnabled = false;

	return {
		info: info,
		warn: warning,
		error: error,
		time: countTime,
		traceEnabled() {
			return _traceEnabled;
		},
		enableTrace(val) {
			_traceEnabled = val;
			console.warn('tracing is ' + (_traceEnabled ? 'enabled' : 'disabled'));
		}
	};

	function info(msg) {
		if (!_traceEnabled) return;
		console.info(msg);
	}

	function warning(msg) {
		if (!_traceEnabled) return;
		console.warn(msg);
	}

	function error(msg) {
		console.error(msg); // always
	}

	function countTime(msg, start) {
		if (!_traceEnabled) return;
		console.warn(msg + ' ' + (performance.now() - start).toFixed(2) + ' ms');
	}
};
