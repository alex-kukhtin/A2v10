// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180505-7175
// components/periodpicker.js


(function () {

	const popup = require('std:popup');

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');

	const baseControl = component('control');
	const locale = window.$$locale;

	Vue.component('a2-period-picker', {
		extends: baseControl,
		template: `
<div class="control-group period-picker" @click.stop.prevent="toggle($event)">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<span class="period-text" v-text="text"/>
		<span class="caret"/>
		<div class="calendar" v-if="isOpen" @click.stop.prevent="dummy">
			<a2-calendar :show-today="false" pos="left" class="d-left" :model="prevModelDate" :set-month="setMonth" :get-day-class="dayClass">
				<button class="btn btn-primary btn-apply">Применить</button>
			</a2-calendar>
			<a2-calendar :show-today="false" pos="right" class="d-right" :model="modelDate" :set-month="setMonth" :get-day-class="dayClass"/>
			<ul class="period-menu">
				<li><a href="">Сегодня</a></li>
				<li><a href="">Вчера</a></li>
				<li class="active"><a href="">Последние 7 дней</a></li>
				<li><a href="">Последние 30 дней</a></li>
				<li><a href="">C начала месяца</a></li>
				<li><a href="">C начала года</a></li>
				<li><a href="">За все время</a></li>
				<li><a href="">Произвольно</a></li>
			</ul>
		</div>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`,
		props: {
			item: Object,
			prop: String
		},
		data() {
			return {
				isOpen: true, //TODO: false
				modelDate: utils.date.today()
			};
		},
		computed: {
			text() {
				return this.period.format('Date');
			},
			period() {
				let period = this.item[this.prop];
				if (!utils.isPeriod(period))
					console.error('PeriodPicker. Value is not a Period');
				return period;
			},
			prevModelDate() {
				return utils.date.add(this.modelDate, -1, 'month')
			}
		},
		methods: {
			dummy() {
			},
			setMonth(d, pos) {
				if (pos === 'left')
					this.modelDate = utils.date.add(d, 1, 'month'); // prev month
				else
					this.modelDate = d;
			},
			dayClass(day) {
				let cls = '';
				let period = this.item[this.prop];
				if (period.in(day)) {
					console.dir(day);
					cls += ' active';
				}
				return cls;
			},
			toggle(ev) {
				/*
				let period = this.item[this.prop];
				console.dir(period);
				period.From = utils.date.create(2018, 5, 1);
				period.To = utils.date.create(2018, 5, 15);
				//alert(1);
				*/
				if (!this.isOpen) {
					// close other popups
					eventBus.$emit('closeAllPopups');
				}
				this.isOpen = !this.isOpen;
				console.dir(this.isOpen);
			},
			__clickOutside() {
				this.isOpen = false;
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

