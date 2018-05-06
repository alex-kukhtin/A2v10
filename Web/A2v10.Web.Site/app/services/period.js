// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180505-7175
// services/period.js

app.modules['std:period'] = function () {

	const utils = require('std:utils');
	const date = utils.date;

	function TPeriod() {
		this.From = date.zero();
		this.To = date.zero();
	}

	TPeriod.prototype.assign = function (v) {
		if (isPeriod(v)) {
			this.From = v.From;
			this.To = v.To;
		} else {
			this.From = date.tryParse(v.From);
			this.To = date.tryParse(v.To);
		}
		this.normalize();
		return this;
	}

	TPeriod.prototype.equal = function (p) {
		return this.From.getTime() === p.From.getTime() &&
			this.To.getTime() === p.To.getTime();
	}

	TPeriod.prototype.fromUrl = function (v) {
		let px = (v || '').split('-');
		let df = px[0];
		let dt = px.length > 1 ? px[1] : px[0];
		this.From = date.tryParse(df)
		this.To = date.tryParse(dt);
		return this;
	}

	TPeriod.prototype.format = function (dataType) {
		let from = this.From;
		let to = this.To;
		if (from.getTime() === to.getTime())
			return utils.format(from, dataType);
		if (dataType == "DateUrl")
			return utils.format(from, dataType) + '-' + utils.format(to, dataType);
		return utils.format(from, dataType) + ' - ' + (utils.format(to, dataType) || '???');
	}

	TPeriod.prototype.in = function (dt) {
		let t = dt.getTime();
		let noTo = this.To.getTime() === date.zero().getTime();
		return t >= this.From.getTime() && (t <= this.To.getTime() || noTo);
	}

	TPeriod.prototype.normalize = function () {
		if (this.From.getTime() > this.To.getTime())
			[this.From, this.To] = [this.To, this.From];
		return this;
	}

	TPeriod.prototype.set = function (from, to) {
		this.From = from;
		this.To = to;
		return this.normalize();
	}


	function isPeriod(value) { return value instanceof TPeriod; }

	return {
		isPeriod,
		zero: zeroPeriod,
		create: createPeriod 
	};

	function zeroPeriod() {
		return new TPeriod();
	}

	function createPeriod(key) {
		let today = date.today();
		let p = zeroPeriod();
		switch (key) {
			case 'today':
				p.set(today, today);
				break;
			case 'yesterday':
				let yesterday = date.add(today, -1, 'day');
				p.set(yesterday, yesterday);
				break;
			case 'last7':
				// -6 (include today!)
				let last7 = date.add(today, -6, 'day');
				p.set(last7, today);
				break;
			case 'last30':
				// -29 (include today!)
				let last30 = date.add(today, -29, 'day');
				p.set(last30, today);
				break;
			case 'startMonth':
				let d1 = date.create(today.getFullYear(), today.getMonth() + 1, 1);
				p.set(d1, today);
				break;
			case 'prevMonth': {
				let d1 = date.create(today.getFullYear(), today.getMonth(), 1);
				let d2 = date.create(today.getFullYear(), today.getMonth() + 1, 1);
				p.set(d1, date.add(d2, -1, 'day'));
			}
				break;
			case 'startQuart': {
				let q = Math.floor(today.getMonth() / 3);
				let m = q * 3;
				let d1 = date.create(today.getFullYear(), m + 1, 1);
				p.set(d1, today);
			}
				break;
			case 'prevQuart': {
				let year = today.getFullYear();
				let q = Math.floor(today.getMonth() / 3) - 1;
				if (q < 0) {
					year -= 1;
					q = 3;
				}
				let m1 = q * 3;
				let m2 = (q + 1) * 3;
				let d1 = date.create(year, m1 + 1, 1);
				let d2 = date.add(date.create(year, m2 + 1, 1), -1, 'day');
				p.set(d1, d2);
			}
				break;
			case 'startYear':
				let dy1 = date.create(today.getFullYear(), 1, 1);
				p.set(dy1, today);
				break;
			case 'allData':
				// zero period
				break;
			default:
				console.error('invalid menu key: ' + key);
		}
		return p;
	}
};
