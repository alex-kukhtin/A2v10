// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200109-7704
// components/calendar.js

(function () {

	const utils = require('std:utils');
	const locale = window.$$locale;

	Vue.component('a2-calendar', {
		template: `
<div @click.stop.prevent="dummy">
	<table class="calendar-pane">
		<thead><tr>
				<th class="h-btn"><a v-if="hasPrev" @click.stop.prevent="prevMonth"><i class="ico ico-triangle-left"></i></a></th>
				<th :colspan="isDayView ? 5 : 7" class="month-title"><span v-text="title"></span></th>
				<th class="h-btn"><a v-if="hasNext" @click.stop.prevent='nextMonth'><i class="ico ico-triangle-right"></i></a></th>
			</tr>
			<tr class="weekdays" v-if="isDayView"><th v-for="d in 7" v-text="wdTitle(d)">Пн</th></tr>
			<tr class="weekdays" v-else><th colspan="9"></th></tr>
		</thead>
		<tbody v-if="isDayView">
			<tr v-for="row in days">
				<td v-for="day in row" :class="dayClass(day)"><a @click.stop.prevent="selectDay(day)" 
					@mouseover="mouseOver(day)"
					v-text="day.getDate()" :title="dayTitle(day)"/></td>
			</tr>
		</tbody>
		<tbody v-else>
			<tr v-for="qr in monthes">
				<td v-for="m in qr" class="mcell" :class="monthClass(m.date)" colspan="3"><a @click.stop.prevent="selectDay(m.date)" v-text="m.name"/></td>
			</tr>
		</tbody>
		<tfoot v-if="showFooter" ><tr><td colspan="7" class="calendar-footer">
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
			hover: Function,
			view: String
		},
		computed: {
			isDayView() {
				return (this.view || 'day') === 'day';
			},
			showFooter() {
				return this.showToday && this.isDayView;
			},
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
			monthes() {
				let ma = [];
				for (let q = 0; q < 4; q++) {
					let ia = [];
					for (let m = 0; m < 3; m++) {
						let mno = q * 3 + m;
						let dt = utils.date.create(this.model.getFullYear(), mno + 1, 1);
						let mname = utils.text.capitalize(dt.toLocaleDateString(locale.$Locale, { month: 'long' }));
						ia.push({ date:dt, month: mno + 1, name: mname });
					}
					ma.push(ia);
				}
				return ma;
			},
			hasPrev() {
				return this.pos !== 'right';
			},
			hasNext() {
				return this.pos !== 'left';
			},
			title() {
				let mn = this.model.toLocaleString(locale.$Locale, { month: "long", year: 'numeric' });
				return utils.text.capitalize(mn);
			},
			todayText() {
				return locale.$Today;
			},
			todayDate() {
				return utils.date.today();
			}
		},
		methods: {
			dummy() { },
			nextMonth() {
				let dt = new Date(this.model);
				if (this.isDayView)
					dt = utils.date.add(dt, 1, 'month');
				else
					dt.setFullYear(dt.getFullYear() + 1);
				this.setMonth(dt, this.pos);
			},
			prevMonth() {
				let dt = new Date(this.model);
				if (this.isDayView)
					dt = utils.date.add(dt, -1, 'month');
				else
					dt.setFullYear(dt.getFullYear() - 1);
				this.setMonth(dt, this.pos);
			},
			wdTitle(d) {
				let dt = this.days[0][d - 1];
				return dt.toLocaleString(locale.$Locale, { weekday: "short" });
			},
			today() {
				this.setDay(this.todayDate);
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
				if (tls.equal(day, this.todayDate))
					cls += ' today';
				if (tls.equal(day, this.model))
					cls += ' active';
				return cls;
			},
			monthClass(day) {
				let cls = '';
				if (day.getFullYear() === this.model.getFullYear() && day.getMonth() === this.model.getMonth())
					cls += ' active';
				return cls;
			},
			dayTitle(day) {
				return day.toLocaleString(locale.$Locale, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
			},
			mouseOver(day) {
				if (this.hover)
					this.hover(day);
			}
		}
	});
})();