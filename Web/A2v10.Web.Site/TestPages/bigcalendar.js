(function () {


	/**TODO:
	 * locale:  Month, Week
	 * workingHours
	 */
	const locale = window.$$locale;
	const dateLocale = locale.$DateLocale || locale.$Locale;
	const monthLocale = locale.$Locale; // for text

	let utils = require('std:utils');
	let tu = utils.text;
	let du = utils.date;

	Vue.component('a2-big-calendar', {
		template: `
<div class="a2-big-calendar">
<div class="top-bar toolbar">
	<div>
		<button class="btn btn-tb btn-icon" @click="nextPart(-1)"><i class="ico ico-arrow-left"></i></button>
		<button class="btn btn-tb btn-icon" @click="nextPart(1)"><i class="ico ico-arrow-right"></i></button>
		<button class="btn btn-tb" @click="todayPart" v-text="locale.$Today"></button>
	</div>
	<div class="title">
		<span v-text=topTitle></span>
	</div>
	<div>
		<button class="btn btn-tb btn-icon" @click="setView('week')"><i class="ico ico-calendar"></i> Week</button>
		<button class="btn btn-tb btn-icon" @click="setView('month')"><i class="ico ico-calendar"></i> Month</button>
	</div>
	<div>
		<slot name="topbar"></slot>
	</div>
</div>
<div v-if="isView('month')" class="bc-month-conainer bc-container" ref="mc">
<table class="bc-month bc-table">
	<thead>
		<tr class="weekdays"><th v-for="d in 7" v-text="wdTitle(d)"></th></tr>
	</thead>
	<tbody>
		<tr v-for="row in days">
			<td v-for="day in row" class=bc-day :class="dayClass(day)" @click.stop.prevent="clickDay(day)">
				<div v-text="day.getDate()" class="day-date"></div>
				<div v-for="(ev, ix) in dayEvents(day)" :key=ix class="day-event"
					:style="{backgroundColor: ev.Color}" @click.stop.prevent="clickEvent(ev)">
					<slot name="monthev" v-bind:item="ev"></slot>
				</div>
			</td>
		</tr>
	</tbody>
</table>
</div>
<div v-if="isView('week')" class="bc-week-container bc-container" ref=wc>
	<table class="bc-week bc-table">
		<colgroup>
			<col style="width:2%"/>
			<col v-for="d in 7" style="width:14%">
		</colgroup>
		<thead>
			<tr class="weekdays">
				<th></th>
				<th v-for="d in 7" v-text="wdWeekTitle(d)">
				</th>
			</tr>
		</thead>
		<tbody>
			<template v-for="h in 24">
				<tr>
					<th rowspan=2>
						<span v-text="hoursText(h - 1)" class="h-title"></span>
					</th>
					<td v-for="d in 7" class="bc-h-top" @click.stop.prevent="clickHours(d, h, false)">
						<div class="h-event" v-for="(ev, ix) in hourEvents(d, h-1, false)" :key=ix
								:style="hourStyle(ev, false)" @click.stop.prevent="clickEvent(ev)">
							<slot name="weekev" v-bind:item="ev"></slot>
						</div>
					</td>
				</tr>
				<tr>
					<td v-for="d in 7" class="bc-h-bottom" @click.stop.prevent="clickHours(d, h, true)">
						<div class="h-event" v-for="(ev, ix) in hourEvents(d, h-1, true)" :key=ix
							:style="hourStyle(ev, true)" @click.stop.prevent="clickEvent(ev)">
							<slot name="weekev" v-bind:item="ev"></slot>
						</div>
					</td>
				</tr>
			</template>
		</tbody>
	</table>
	<div class="current-time" :style="currentTimeStyle()" :key=updateKey></div>
</div>
</div>
`,
		props: {
			item: Object,
			prop: String,
			viewItem: Object,
			viewProp: String,
			events: Array,
			delegates: Object
		},
		data() {
			return {
				updateKey: 1,
				timerId: 0
			}
		},
		computed: {
			locale() {
				return locale;
			},
			modelDate() {
				return this.item[this.prop];
			},
			modelView() {
				return this.viewItem[this.viewProp];
			},
			days() {
				let dt = new Date(this.modelDate);
				let d = dt.getDate();
				dt.setDate(1); // 1-st day of month
				let w = dt.getDay() - 1; // weekday
				if (w === -1) w = 6;
				//else if (w === 0) w = 7;
				dt.setDate(-w + 1);
				let arr = [];
				for (let r = 0; r < 6; r++) {
					let row = [];
					for (let c = 0; c < 7; c++) {
						row.push(new Date(dt));
						dt.setDate(dt.getDate() + 1);
					}
					arr.push(row);
				}
				return arr;
			},
			topTitle() {
				let m = this.modelDate.toLocaleDateString(monthLocale, { month: "long" });
				return `${tu.capitalize(m)} ${this.modelDate.getFullYear()}`;
			},
			firstMonday() {
				let wd = this.modelDate.getDay();
				if (wd == 1) return this.modelDate;
				if (!wd) wd = 7;
				return du.add(this.modelDate, -(wd - 1), 'day');
			}
		},
		methods: {			
			isView(view) {
				return this.viewItem[this.viewProp] === view;
			},
			wdTitle(d) {
				let dt = this.days[0][d - 1];
				return dt.toLocaleString(monthLocale, { weekday: "long" });
			},
			wdWeekTitle(d) {
				let fd = du.add(this.firstMonday, d - 1, 'day');
				let wd = fd.toLocaleString(monthLocale, { weekday: 'long' });
				let day = fd.toLocaleString(monthLocale, { month: "long", day: 'numeric' });
				return `${wd}, ${day}`;
			},
			dayClass(day) {
				let cls = '';
				if (du.equal(day, du.today()))
					cls += ' today';
				if (day.getMonth() !== this.modelDate.getMonth())
					cls += " other";
				return cls;
			},
			dayEvents(day) {
				return this.events.filter(e => du.equal(e.Date, day));
			},
			hoursText(h) {
				return `${h}:00`;
			},
			hourStyle(ev, h2) {
				let min = ev.Date.getMinutes();
				let s = {
					backgroundColor: ev.Color,
					height: `${ev.Duration}px`,
					top: `${h2 ? min - 30 : min}px`
				};
				return s;
			},
			hourEvents(dno, hour, h2) {
				let day = du.add(this.firstMonday, dno - 1, 'day');
				let inside = (ev) => {
					if (!du.equal(ev.Date, day)) return false;
					let h = ev.Date.getHours();
					let m = ev.Date.getMinutes();
					if (h2)
						return h >= hour && h < hour + 1 && m >= 30;
					else
						return h >= hour && h < hour + 1 && m < 30;
				}
				return this.events.filter(inside);
			},
			nextPart(d) {
				let dt = new Date(this.modelDate);
				if (this.isView('week'))
					dt = du.add(dt, 7 * d, 'day');
				else
					dt.setMonth(dt.getMonth() + d);
				this.item[this.prop] = dt;
			},
			todayPart() {
				let dt = new Date();
				this.item[this.prop] = dt;
			},
			setView(view) {
				this.viewItem[this.viewProp] = view;
			},
			clickEvent(ev) {
				if (this.delegates && this.delegates.ClickEvent)
					this.delegates.ClickEvent(ev);
			},
			clickDay(day) {
				if (!this.delegates || !this.delegates.ClickDay) return;
				let dt = new Date(day);
				dt.setHours(0);
				dt.setMinutes(0);
				this.delegates.ClickDay(day);
			},
			clickHours(d, h, h2) {
				if (!this.delegates || !this.delegates.ClickDay) return;
				let fmd = this.firstMonday;
				let dt = du.add(fmd, d - 1, 'day');
				dt.setMinutes(h2 ? 30 : 0);
				dt.setHours(h - 1);
				this.delegates.ClickDay(dt);
			},
			currentTimeStyle() {
				let dt = new Date();
				let x = dt.getHours() * 60 + dt.getMinutes() + 35 - 1 /*thead*/;
				return {
					top: `${x}px`,
					'--time': `"${dt.toLocaleTimeString(dateLocale, { hour: '2-digit', minute:'2-digit' })}"`
				};
			},
			__fitScroll() {
				if (this.isView('month')) {
					setTimeout(() => {
						this.$refs.mc.scrollTop = 0;
					}, 0);
				} else
					setTimeout(() => {
						let rows = this.$refs.wc.getElementsByTagName('tr');
						rows[8 * 2 + 1].scrollIntoView(true);
					}, 0);
			}
		},
		watch: {
			modelView() {
				this.__fitScroll();
			}
		},
		mounted() {
			this.__fitScroll();
			this.timerId = setInterval(() => {
				if (this.isView('week')) {
					this.updateKey++;
				}
			}, 10 * 1000);
		},
		destroyed() {
			if (this.timerId)
				clearInterval(this.timerId);
		}
	});
})();
