// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

// 20230528-7936
// components/periodpicker.js


(function () {

	const popup = require('std:popup');

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');
	const uPeriod = require('std:period');
	const du = utils.date;

	const baseControl = component('control');
	const locale = window.$$locale;

	const DEFAULT_DEBOUNCE = 150;

	Vue.component('a2-period-picker', {
		extends: baseControl,
		template: `
<div class="control-group period-picker" @click.stop.prevent="toggle($event)" :class="{open: isOpen}">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/></label>
	<div class="input-group">
		<span class="period-text" v-text="text" :class="inputClass" :tabindex="tabIndex"/>
		<span class="caret"/>
		<div class="calendar period-pane" v-if="isOpen" @click.stop.prevent="dummy">
			<ul class="period-menu" style="grid-area: 1 / 1 / span 2 / auto">
				<li v-for='(mi, ix) in menu' :key="ix" :class="{active: isSelectedMenu(mi.key)}"><a v-text='mi.name' @click.stop.prevent="selectMenu(mi.key)"></a></li>
			</ul>
			<a2-calendar style="grid-area: 1 / 2" :show-today="false" pos="left" :model="prevModelDate" 
				:set-month="setMonth" :set-day="setDay" :get-day-class="dayClass" :hover="mouseHover"/>
			<a2-calendar style="grid-area: 1 / 3; margin-left:6px":show-today="false" pos="right" :model="modelDate" 
				:set-month="setMonth" :set-day="setDay" :get-day-class="dayClass" :hover="mouseHover"/>
			<div class="period-footer" style="grid-area: 2 / 2 / auto / span 2">
				<div v-if="customMode" class="custom-period">
					<div><input type=text v-model.lazy.trim="customStart" v-focus></div>
					<span> - </span>
					<div><input type=text v-model.lazy.trim="customEnd" v-focus></div>
				</div>
				<a v-else class="current-period" v-text="currentText" :class="{processing: selection}" href="" @click.stop.prevent=startCustom></a>
				<span class="aligner"></span>
				<button class="btn btn-primary" @click.stop.prevent="apply" v-text="locale.$Apply" :disabled="applyDisabled"/>
				<button class="btn btn-default" @click.stop.prevent="close" v-text="locale.$Cancel" />
			</div>
		</div>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`,
		props: {
			item: Object,
			prop: String,
			showAll: {
				type: Boolean,
				default: true
			},
			display: String,
			callback: Function
		},
		data() {
			return {
				isOpen: false,
				selection: '',
				modelDate: du.today(),
				currentPeriod: uPeriod.zero(),
				selectEnd: du.zero(),
				timerId: null,
				customMode: false
			};
		},
		computed: {
			locale() {
				return window.$$locale;
			},
			text() {
				if (this.display === 'name')
					return this.period.text();
				else if (this.display === 'namedate') {
					if (this.period.isAllData())
						return this.period.text(true);
					return `${this.period.text(true)} [${this.period.format('Date')}]`;
				}
				return this.period.format('Date');
			},
			period() {
				if (!this.item)
					return this.currentPeriod;
				let period = this.item[this.prop];
				if (!uPeriod.isPeriod(period))
					console.error('PeriodPicker. Value is not a Period');
				return period;
			},
			prevModelDate() {
				return du.add(this.modelDate, -1, 'month');
			},
			currentText() {
				return this.currentPeriod.format('Date');
			},
			applyDisabled() {
				return this.selection === 'start';
			},
			menu() {
				return uPeriod.predefined(this.showAll);
			},
			customStart: {
				get() {
					let dt = this.currentPeriod.From;
					if (du.equal(dt, du.minDate) || du.equal(dt, du.maxDate))
						return '';
					return du.format(dt);
				},
				set(val) {
					let dat = this.parseDate(val);
					this.currentPeriod.setFrom(dat);
					this.modelDate = this.currentPeriod.To;
				}
			},
			customEnd: {
				get() {
					let dt = this.currentPeriod.To;
					if (du.equal(dt, du.minDate) || du.equal(dt, du.maxDate))
						return '';
					return du.format(dt);
				},
				set(val) {
					let dat = this.parseDate(val);
					this.currentPeriod.setTo(dat);
					this.modelDate = this.currentPeriod.To;
				}
			}
		},
		methods: {
			dummy() {
			},
			setMonth(d, pos) {
				this.customMode = false;
				if (pos === 'left')
					this.modelDate = du.add(d, 1, 'month'); // prev month
				else
					this.modelDate = d;
			},
			setDay(d) {
				this.customMode = false;
				if (!this.selection) {
					this.selection = 'start';
					this.currentPeriod.From = d;
					this.currentPeriod.To = du.zero();
					this.selectEnd = du.zero();
				} else if (this.selection === 'start') {
					this.currentPeriod.To = d;
					this.currentPeriod.normalize();
					this.selection = '';
				}
			},
			dayClass(day) {
				let cls = '';
				let px = this.currentPeriod;
				if (this.selection)
					px = uPeriod.create('custom', this.currentPeriod.From, this.selectEnd);
				if (px.in(day))
					cls += ' active';
				if (px.From.getTime() === day.getTime())
					cls += ' period-start';
				if (px.To.getTime() === day.getTime())
					cls += ' period-end';
				return cls;
			},
			close() {
				this.isOpen = false;
				this.customMode = false;
			},
			apply() {
				// apply period here
				if (!this.period.equal(this.currentPeriod)) {
					this.period.assign(this.currentPeriod);
					this.fireEvent();
				}
				this.close();
			},
			fireEvent() {
				if (this.callback)
					this.callback(this.period);
				let root = this.item.$root;
				if (!root) return;
				let eventName = this.item._path_ + '.' + this.prop + '.change';
				root.$setDirty(true);
				root.$emit(eventName, this.item, this.period, null);
			},
			toggle(ev) {
				if (!this.isOpen) {
					// close other popups
					eventBus.$emit('closeAllPopups');
					this.modelDate = this.period.To; // TODO: calc start month
					if (this.modelDate.isZero() || this.modelDate.getTime() === du.maxDate.getTime())
						this.modelDate = du.today();
					this.currentPeriod.assign(this.period);
					this.selection = '';
					this.selectEnd = du.zero();
					this.customMode = false;
				}
				this.isOpen = !this.isOpen;
			},
			__clickOutside() {
				this.close();
			},
			isSelectedMenu(key) {
				let p = uPeriod.create(key);
				return p.equal(this.currentPeriod);
			},
			selectMenu(key) {
				let p = uPeriod.create(key);
				this.currentPeriod.assign(p);
				this.apply();
			},
			mouseHover(day) {
				if (!this.selection) return;
				if (this.selectEnd.getTime() === day.getTime()) return;
				clearTimeout(this.timerId);
				this.timerId = setTimeout(() => {
					this.selectEnd = day;
				}, DEFAULT_DEBOUNCE);
			},
			startCustom() {
				this.customMode = true;
			},
			parseDate(val) {
				let dat = du.parse(val);
				if (du.isZero(dat))
					dat = du.today();
				else if (dat.getTime() < du.minDate.getTime())
					dat = du.minDate;
				else if (dat.getTime() > du.maxDate.getTime())
					dat = du.maxDate;
				return dat;
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

