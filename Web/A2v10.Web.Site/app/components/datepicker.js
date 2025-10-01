﻿// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

// 20251001-7985
// components/datepicker.js

(function () {

	const popup = require('std:popup');

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');

	const baseControl = component('control');
	const locale = window.$$locale;
	const dateLocale = locale.$DateLocale || locale.$Locale;
	const monthLocale = locale.$Locale; // for text

	Vue.component('a2-date-picker', {
		extends: baseControl,
		template: `
<div :class="cssClass2()" class="date-picker" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group"  @click="clickInput($event)">
		<input v-focus v-model.lazy="model" v-if="!isMonth" :class="inputClass" :readonly="inputDisabled"/>
		<div class="month-wrapper" v-if=isMonth v-text=model></div>
		<a href @click.stop.prevent="toggle($event)" tabindex="-1"><i class="ico ico-calendar"></i></a>
		<a href v-if="clearVisible" @click.stop.prevent="clear($event)" tabindex="-1">✕</a>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
		<div class="calendar" v-if="isOpen">		
			<a2-calendar :model="viewDate" :view="view" :current-model="modelDate"
				:set-month="setMonth" :set-day="selectDay" :get-day-class="dayClass"/>
		</div>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`,
		props: {
			item: Object,
			prop: String,
			itemToValidate: Object,
			propToValidate: String,
			// override control.align (default value)
			align: { type: String, default: 'center' },
			view: String,
			yearCutOff: String,
			hasClear: Boolean
		},
		data() {
			return {
				isOpen: false,
				viewDate: null
			};
		},
		watch: {
			modelDate() {
				this.viewDate = this.modelDate;
			}
		},
		methods: {
			toggle(ev) {
				if (this.disabled) return;
				if (!this.isOpen) {
					// close other popups
					eventBus.$emit('closeAllPopups');
					if (utils.date.isZero(this.modelDate))
						this.viewDate = utils.date.today();
				}
				this.isOpen = !this.isOpen;
			},
			clear(ev) {
				this.isOpen = false;
				this.updateModel(utils.date.zero());
			},
			updateModel(date) {
				this.item[this.prop] = date;
				this.viewDate = date;
			},
			fitDate(dt) {
				let du = utils.date;
				if (du.isZero(dt))
					return dt;
				if (dt < du.minDate)
					dt = du.minDate;
				else if (dt > du.maxDate)
					dt = du.maxDate;
				return dt;
			},
			clickInput(ev) {
				if (this.view === 'month') {
					this.toggle(ev);
					ev.stopPropagation();
					ev.preventDefault();
				}
			},
			setMonth(dt) {
				this.viewDate = dt;
			},
			selectDay(day) {
				var dt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
				this.setDate(dt);
				this.isOpen = false;
			},
			setDate(d) {
				// save time
				let md = this.modelDate || d;
				let nd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), md.getHours(), md.getMinutes(), 0, 0);
				nd = this.fitDate(nd);
				this.updateModel(nd);
			},
			dayClass(day) {
				let cls = '';
				let tls = utils.date;
				if (tls.equal(day, tls.today()))
					cls += ' today';
				if (tls.equal(day, this.modelDate))
					cls += ' active';
				if (day.getMonth() !== this.viewDate.getMonth())
					cls += " other";
				return cls;
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
			isMonth() {
				return this.view === 'month';
			},
			inputDisabled() {
				return this.disabled || this.view === 'month';
			},
			clearVisible() {
				return this.hasClear && !utils.date.isZero(this.modelDate);
			},
			model: {
				get() {
					if (utils.date.isZero(this.modelDate))
						return '\u00A0'; /* avoid baseline problem */
					if (this.view === 'month')
						return utils.text.capitalize(this.modelDate.toLocaleString(monthLocale, { year: 'numeric', month: 'long' }));
					else
						return this.modelDate.toLocaleString(dateLocale, { year: 'numeric', month: '2-digit', day: '2-digit' });
				},
				set(str) {
					let md = utils.date.parse(str, this.yearCutOff);
					md = this.fitDate(md);
					if (utils.date.isZero(md)) {
						this.updateModel(md);
						this.isOpen = false;
					} else {
						this.setDate(md);
					}
				}
			}
		},
		mounted() {
			this.viewDate = this.modelDate;
			popup.registerPopup(this.$el);
			this.$el._close = this.__clickOutside;
		},
		beforeDestroy() {
			popup.unregisterPopup(this.$el);
		}
	});
})();
