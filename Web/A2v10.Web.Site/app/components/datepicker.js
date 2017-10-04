(function () {

	const popup = require('std:popup');

	const utils = require('utils');
	const eventBus = require('std:eventBus');

	const baseControl = component('control');

	Vue.component('a2-date-picker', {
		extends: baseControl,
		template: `
<div  :class="cssClass">
	<label v-if="hasLabel" v-text="label" />
    <div class="input-group">
        <input v-focus v-model.lazy="model" :class="inputClass" />
        <a href @click.stop.prevent="toggle($event)"><i class="ico ico-calendar"></i></a>
		<validator :invalid="invalid" :errors="errors"></validator>
		<div class="calendar" v-if="isOpen" @click.stop.prevent="dummy">
			<table>
				<thead><tr>
						<th><a @click.stop.prevent='prevMonth'><i class="ico ico-triangle-left"></i></a></th>
						<th colspan="5"><span v-text="title"></span></th>
						<th><a @click.stop.prevent='nextMonth'><i class="ico ico-triangle-right"></i></a></th>					
					</tr>
					<tr class="weekdays"><th v-for="d in 7" v-text="wdTitle(d)">Пн</th></tr>
				</thead>
				<tbody>
					<tr v-for="row in days">
						<td v-for="day in row" :class="dayClass(day)"><a @click.stop.prevent="selectDay(day)" v-text="day.getDate()" :title="dayTitle(day)"/></td>
					</tr>
				</tbody>
				<tfoot><tr><td colspan="7"><a @click.stop.prevent='today'>cьогодні</a></td></tr></tfoot>
			</table>
		</div>
    </div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`,
		props: {
			item: Object,
			prop: String,
			// override control.align (default value)
			align: { type: String, default: 'center' }
		},
		data() {
			return {
				isOpen: false
			};
		},
		methods: {
			dummy() {
			},
			toggle(ev) {
				if (!this.isOpen) {
					// close other popups
					eventBus.$emit('closeAllPopups');
					if (utils.date.isZero(this.modelDate))
						this.modelDate = utils.date.today();
				}
				this.isOpen = !this.isOpen;
			},
			today() {
				this.selectDay(utils.date.today());
			},
			prevMonth() {
				let dt = new Date(this.modelDate);
				dt.setMonth(dt.getMonth() - 1);
				this.item[this.prop] = dt;
			},
			nextMonth() {
				let dt = new Date(this.modelDate);
				dt.setMonth(dt.getMonth() + 1);
				this.item[this.prop] = dt;
			},
			selectDay(day) {
				this.item[this.prop] = day;
				this.isOpen = false;
			},
			wdTitle(d) {
				let dt = this.days[0][d - 1];
				return dt.toLocaleString("uk-UA", { weekday: "short" });
			},
			dayClass(day) {
				let cls = '';
				let tls = utils.date;
				if (tls.equal(day, tls.today()))
					cls += ' today';
				if (tls.equal(day, this.modelDate))
					cls += ' active';
				if (day.getMonth() !== this.modelDate.getMonth())
					cls += " other";
				return cls;
			},
			dayTitle(day) {
				return day.toLocaleString("uk-UA", { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
			},
			__clickOutside() {
				this.isOpen = false;
			}
		},
		computed: {
			modelDate() {
				return this.item[this.prop];
			},
			model: {
				get() {
					if (utils.date.isZero(this.modelDate))
						return '';
					return this.modelDate.toLocaleString("uk-UA", { year: 'numeric', month: '2-digit', day: '2-digit' });
				},
				set(str) {
					let md = utils.date.parse(str);
					this.item[this.prop] = md;
					if (utils.date.isZero(md))
						this.isOpen = false;
				}
			},
			title() {
				let mn = this.modelDate.toLocaleString("uk-UA", { month: "long", year: 'numeric' });
				return mn.charAt(0).toUpperCase() + mn.slice(1);
			},
			days() {
				let dt = new Date(this.modelDate);
				dt.setHours(0, -dt.getTimezoneOffset(), 0, 0);
				let d = dt.getDate();
				dt.setDate(1); // 1-st day of month
				let w = dt.getDay() - 1; // weekday
				if (w === -1) w = 6;
				else if (w == 0) w = 7;
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
