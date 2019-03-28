// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190328-7473
// components/list.js

/* TODO:
*/

(function () {

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');
	const locale = window.$$locale;

	Vue.component("a2-list", {
		template:

`
<ul class="a2-list" v-lazy="itemsSource">
	<template v-if="itemsSource">
		<li class="a2-list-item" tabindex="1" :class="cssClass(listItem)" v-for="(listItem, listItemIndex) in source" :key="listItemIndex" 
				@mousedown.prevent="select(listItem)" @keydown="keyDown" 
				ref="li">
			<span v-if="listItem.__group" v-text="listItem.__group"></span>
			<slot name="items" :item="listItem" v-if="!listItem.__group"/>
		</li>
		<div class="list-empty" v-if="$isEmpty">
			<slot name="empty" />
		</div>
	</template>
	<template v-else>
		<slot />
	</template>
</ul>
`,
		props: {
			itemsSource: Array,
			autoSelect: String,
			mark: String,
			markStyle: String,
			command: Function,
			selectable: {
				type: Boolean, default: true
			},
			hover: {
				type: Boolean, default: true
			},
			groupBy: String
		},
		computed: {
			selectedSource() {
				// method! not cached
				let src = this.itemsSource;
				if (!src) return null;
				if (src.$origin)
					src = src.$origin;
				return src.$selected;
			},
			source() {
				if (!this.groupBy)
					return this.itemsSource;
				let grmap = {};
				for (let itm of this.itemsSource) {
					let key = utils.eval(itm, this.groupBy);
					if (utils.isDate(key))
						key = utils.format(key, "Date");
					if (!utils.isDefined(key)) key = '';
					if (key === '') key = locale.$Unknown || "Unknown";
					if (!(key in grmap)) {
						grmap[key] = {
							group: key,
							items: []
						};
					}
					grmap[key].items.push(itm);
				}
				let rarr = [];
				for (let key in grmap) {
					let me = grmap[key];
					rarr.push(Object.assign({}, me, { __group: me.group, __count: me.items.length }));
					for (var e of me.items) {
						rarr.push(e);
					}
				}
				//console.dir(rarr);
				return rarr;
			},
			$isEmpty() {
				return this.itemsSource && this.itemsSource.length === 0;
			}
		},
		methods: {
			cssClass(item) {
				let getMark = el => {
					if (!this.mark) return '';
					let cls = utils.eval(el, this.mark);
					if (this.markStyle === 'row')
						cls += ' no-marker';
					else if (this.markStyle === 'marker')
						cls += ' no-background';
					return cls;
				};
				if (this.groupBy && item.__group)
					return 'group' + (this.mark ? ' mark' : '');
				return (item.$selected ? 'active ' : ' ') + getMark(item);
			},
			select(item) {
				if (!this.selectable) return;
				if (item.$select) item.$select();
			},
			selectStatic() {
				alert('yet not implemented');
				console.dir(this);
			},
			selectFirstItem() {
				if (!this.autoSelect) return;
				if (!this.selectable) return;
				let src = this.itemsSource;
				if (src.$selected) return; // already selected
				if (!src || !src.length)
					return;
				if (this.autoSelect === 'first-item') {
					// from source (not $origin!)
					let fe = src[0];
					this.select(fe);
					return;
				} else if (this.autoSelect === 'last-item') {
					// from source (not $origin!)
					let fe = src[src.length - 1];
					this.select(fe);
					return;
				} else if (this.autoSelect === 'item-id') {
					let rootId = this.$root.$modelInfo.Id;
					if (!utils.isDefined(rootId)) {
						console.error('Id not found in Root.modelInfo');
						return;
					}
					let fe = src.find(itm => itm.$id === rootId);
					if (!fe) {
						console.error(`Element with id=${rootId} not found`);
						fe = src[0];
					}
					if (fe)
						this.select(fe);
				}
			},
			keyDown(e) {
				const next = (delta) => {
					let index;
					index = this.itemsSource.indexOf(this.selectedSource);
					if (index === -1)
						return;
					index += delta;
					if (index === -1)
						return;
					if (index < this.itemsSource.length)
						this.select(this.itemsSource[index]);
				};
				switch (e.which) {
					case 38: // up
						next(-1);
						break;
					case 40: // down
						next(1);
						break;
					case 36: // home
						//this.selected = this.itemsSource[0];
						break;
					case 35: // end
						//this.selected = this.itemsSource[this.itemsSource.length - 1];
						break;
					case 33: // pgUp
						break;
					case 34: // pgDn
						break;
					case 13: // Enter
						if (utils.isFunction(this.command)) {
							// TODO:
							this.command();
						}
						break;
					default:
						return;
				}
				e.preventDefault();
				e.stopPropagation();
			}
		},
		created() {
			this.selectFirstItem();
		},
		updated() {
			if (!this.selectedSource && this.autoSelect) {
				this.selectFirstItem();
			}
			let src = this.itemsSource;
			if (!src) return;
			let li = this.$refs.li;
			if (!li) return;
			setTimeout(() => {
				let ix = li.findIndex(itm => itm.classList.contains('active'));
				if (ix !== -1 && li && ix < li.length)
					li[ix].scrollIntoViewCheck();
			}, 0);
		}
	});
})();
