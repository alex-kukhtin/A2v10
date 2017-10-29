/*20171029-7060*/
/* services/log.js */

app.modules['std:log'] = function () {

    let _traceEnabled = false;
    let _sessionLoaded = false;
    const traceEnabledKey = 'traceEnabled';

	return {
		info: info,
		warn: warning,
		error: error,
		time: countTime,
        traceEnabled() {
            if (!_sessionLoaded)
                loadSession();
			return _traceEnabled;
		},
		enableTrace(val) {
			_traceEnabled = val;
            console.warn('tracing is ' + (_traceEnabled ? 'enabled' : 'disabled'));
            window.sessionStorage.setItem(traceEnabledKey, val);
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

	function countTime(msg, start, enable) {
		if (!_traceEnabled && !enable) return;
		console.warn(msg + ' ' + (performance.now() - start).toFixed(2) + ' ms');
    }

    function loadSession() {
        let te = window.sessionStorage.getItem(traceEnabledKey);
        if (te !== null) {
            _traceEnabled = te === 'true';
            if (_traceEnabled)
                console.warn('tracing is enabled');
        }
        _sessionLoaded = true;
    }
};
