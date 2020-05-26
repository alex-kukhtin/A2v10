// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20191017-7568
// components/datepicker.js


(function () {

	const popup = require('std:popup');

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');

	const baseControl = component('control');
	const locale = window.$$locale;

	const timesheet = {
		props: {
			model: Date,
			setHour: Function,
			setMinute: Function,
			getHourClass: Function,
			getMinuteClass: Function
		},
		template: `
<div @click.stop.prevent="dummy" class="time-picker-pane calendar-pane">
<table class="table-hours">
<thead><tr><th colspan="6" v-text="locale.$Hours">Години</th></tr></thead>
<tbody>
	<tr v-for="row in hours">
		<td v-for="h in row" :class="getHourClass(h)"><a @click.stop.prevent="clickHours(h)" v-text="h"/></td>
	</tr>	
</tbody></table>
<div class="divider"/>
<table class="table-minutes">
<thead><tr><th colspan="3" v-text="locale.$Minutes">Хвилини</th></tr></thead>
<tbody>
	<tr v-for="row in minutes">
		<td v-for="m in row" :class="getMinuteClass(m)"><a @click.stop.prevent="clickMinutes(m)" v-text="m"/></td>
	</tr>	
</tbody></table>
</div>
`,
		methods: {
			clickHours(h) {
				if (this.setHour)
					this.setHour(+h);
			},
			clickMinutes(m) {
				if (this.setMinute)
					this.setMinute(m);
			},
			dummy() {

			}
		},
		computed: {
			locale() { console.dir(locale); return locale; },
			hours() {
				let a = [];
				for (let y = 0; y < 4; y++) {
					let r = [];
					a.push(r);
					for (let x = 0; x < 6; x++) {
						var v = y * 6 + x;
						if (v < 10)
							v = '0' + v;
						r.push(v);
					}
				}
				return a;
			},
			minutes() {
				let a = [];
				for (let y = 0; y < 4; y++) {
					let r = [];
					a.push(r);
					for (let x = 0; x < 3; x++) {
						var v = (y * 3 + x) * 5;
						if (v < 10)
							v = '0' + v;
						r.push(v);
					}
				}
				return a;
			}
		}
	};

	/*
			<a2-calendar :model="modelDate"
				:set-month="setMonth" :set-day="selectDay" :get-day-class="dayClass"/>
	 */
	Vue.component('a2-time-picker', {
		extends: baseControl,
		template: `
<div :class="cssClass2()" class="date-picker">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group">
		<input v-focus v-model.lazy="model" :class="inputClass" :disabled="inputDisabled"/>
		<a href @click.stop.prevent="toggle($event)"><i class="ico ico-waiting-outline"></i></a>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
		<div class="calendar" v-if="isOpen">
			<a2-time-sheet :model="modelDate" :set-hour="setHour" :set-minute="setMinute" :get-hour-class="hourClass" :get-minute-class="minuteClass"/>
		</div>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`,
		components: {
			'a2-time-sheet': timesheet
		},
		props: {
			item: Object,
			prop: String,
			itemToValidate: Object,
			propToValidate: String,
			// override control.align (default value)
			align: { type: String, default: 'center' }
		},
		data() {
			return {
				isOpen: false
			};
		},
		methods: {
			toggle(ev) {
				if (this.disabled) return;
				if (!this.isOpen) {
					// close other popups
					eventBus.$emit('closeAllPopups');
					if (utils.date.isZero(this.modelDate))
						this.item[this.prop] = utils.date.today();
				}
				this.isOpen = !this.isOpen;
			},
			setHour(h) {
				let nd = new Date(this.modelDate);
				nd.setUTCHours(h);
				this.item[this.prop] = nd;
			},
			setMinute(m) {
				let md = new Date(this.modelDate);
				md.setMinutes(m);
				this.item[this.prop] = md;
				this.isOpen = false;
			},
			hourClass(h) {
				let cls = '';
				if (this.modelDate.getUTCHours() === +h)
					cls += ' active';
				return cls;
			},
			minuteClass(m) {
				return this.modelDate.getUTCMinutes() === +m ? 'active' : undefined;
			},
			cssClass2() {
				let cx = this.cssClass();
				if (this.isOpen)
					cx += ' open';
				return cx;
			},
			__clickOutside() {
				this.isOpen = false;
			}
		},
		computed: {
			modelDate() {
				return this.item[this.prop];
			},
			inputDisabled() {
				return this.disabled;
			},
			model: {
				get() {
					let md = this.modelDate;
					if (utils.date.isZero(md))
						return '';
					return md.toLocaleTimeString(locale.$Locale, { timeZone: 'UTC', hour: '2-digit', minute:"2-digit"});
				},
				set(str) {
					let md = new Date(this.modelDate);
					if (str) {
						let time = utils.date.parseTime(str);
						md.setUTCHours(time.getHours(), time.getMinutes());
					} else {
						md.setUTCHours(0, 0);
					}
					this.item[this.prop] = md;
					this.isOpen = false;
				}
			}
		},
		mounted() {
			popup.registerPopup(this.$el);
			this.$el._close = this.__clickOutside;
		},
		beforeDestroy() {
			popup.unregisterPopup(this.$el);
		}
	});
})();
