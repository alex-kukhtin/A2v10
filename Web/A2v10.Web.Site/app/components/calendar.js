// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180508-7178
// components/calendar.js

(function () {

	const utils = require('std:utils');
	const locale = window.$$locale;

	Vue.component('a2-calendar', {
		template: `
<div @click.stop.prevent="dummy">
	<table class="calendar-pane">
		<thead><tr>
				<th><a  v-if="hasPrev" @click.stop.prevent='prevMonth'><i class="ico ico-triangle-left"></i></a></th>
				<th colspan="5"  class="month-title"><span v-text="title"></span></th>
				<th><a v-if="hasNext" @click.stop.prevent='nextMonth'><i class="ico ico-triangle-right"></i></a></th>					
			</tr>
			<tr class="weekdays"><th v-for="d in 7" v-text="wdTitle(d)">Пн</th></tr>
		</thead>
		<tbody>
			<tr v-for="row in days">
				<td v-for="day in row" :class="dayClass(day)"><a @click.stop.prevent="selectDay(day)" 
					@mouseover="mouseOver(day)"
					v-text="day.getDate()" :title="dayTitle(day)"/></td>
			</tr>
		</tbody>
		<tfoot v-if="showToday" ><tr><td colspan="7" class="calendar-footer">
			<a class="today" @click.stop.prevent='today' v-text='todayText'></a></td></tr></tfoot>
	</table>
</div>
`,
		props: {
			showToday: { type: Boolean, default: true },
			pos: String,
			model: Date,
			setMonth: Function,
			setDay: Function,
			getDayClass: Function,
			hover: Function
		},
		computed: {
			days() {
				let dt = new Date(this.model);
				dt.setHours(0, -dt.getTimezoneOffset(), 0, 0);
				let d = dt.getDate();
				dt.setDate(1); // 1-st day of month
				let w = dt.getDay() - 1; // weekday
				if (w === -1) w = 6;
				else if (w === 0) w = 7;
				dt.setDate(-w + 1);
				let arr = [];
				for (let r = 0; r < 6; r++) {
					let row = [];
					for (let c = 0; c < 7; c++) {
						let xd = new Date(dt);
						xd.setHours(0, -xd.getTimezoneOffset(), 0, 0);
						row.push(new Date(xd));
						dt.setDate(dt.getDate() + 1);
					}
					arr.push(row);
				}
				return arr;
			},
			hasPrev() {
				return this.pos !== 'right';
			},
			hasNext() {
				return this.pos !== 'left';
			},
			title() {
				let mn = this.model.toLocaleString(locale.$Locale, { month: "long", year: 'numeric' });
				return mn.charAt(0).toUpperCase() + mn.slice(1);
			},
			todayText() {
				return locale.$Today;
			}
		},
		methods: {
			dummy() { },
			nextMonth() {
				let dt = new Date(this.model);
				dt.setMonth(dt.getMonth() + 1);
				this.setMonth(dt, this.pos);
			},
			prevMonth() {
				let dt = new Date(this.model);
				dt.setMonth(dt.getMonth() - 1);
				this.setMonth(dt, this.pos);
			},
			wdTitle(d) {
				let dt = this.days[0][d - 1];
				return dt.toLocaleString(locale.$Locale, { weekday: "short" });
			},
			today() {
				this.setDay(utils.date.today());
			},
			selectDay(d) {
				this.setDay(d, this.pos);
			},
			dayClass(day) {
				let cls = '';
				if (day.getMonth() !== this.model.getMonth())
					cls += " other";
				if (this.getDayClass) {
					cls += this.getDayClass(day);
					return cls;
				}
				let tls = utils.date;
				if (tls.equal(day, tls.today()))
					cls += ' today';
				if (tls.equal(day, this.model))
					cls += ' active';
				return cls;
			},
			dayTitle(day) {
				// todo: localize
				return day.toLocaleString(locale.$Locale, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
			},
			mouseOver(day) {
				if (this.hover)
					this.hover(day);
			}
		}
	});
})();