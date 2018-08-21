// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180821-7280
// components/list.js

/* TODO:
*/

(function () {

	const utils = require('std:utils');

	Vue.component("a2-list", {
		template:
			`<ul class="a2-list" v-lazy="itemsSource">
	<template v-if="itemsSource">
		<li class="a2-list-item" tabindex="1" :class="cssClass(listItem)" v-for="(listItem, listItemIndex) in itemsSource" :key="listItemIndex" 
				@click.prevent="select(listItem)" @keydown="keyDown" 
				ref="li">
			<slot name="items" :item="listItem" />
		</li>
	</template>
	<template v-else>
		<slot />
	</template>
</ul>`,
		props: {
			itemsSource: Array,
			autoSelect: String,
			mark: String,
			command: Function,
			selectable: {
				type: Boolean, default: true
			}
		},
		computed: {
			selectedSource() {
				// method! not cached
				let src = this.itemsSource;
				if (!src) return null;
				if (src.$origin)
					src = src.$origin;
				return src.$selected;
			}
		},
		methods: {
			cssClass(item) {
				let cls = item.$selected ? 'active' : '';
				if (this.mark) {
					let clsmrk = utils.eval(item, this.mark);
					if (clsmrk) cls += ' ' + clsmrk;
				}
				return cls;
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
			let ix = src.$selectedIndex;
			if (ix !== -1 && this.$refs.li)
				this.$refs.li[ix].scrollIntoViewCheck();
		}
	});
})();
