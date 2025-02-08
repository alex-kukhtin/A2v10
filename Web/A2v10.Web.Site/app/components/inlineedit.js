// Copyright © 2024-2025 Oleksandr Kukhtin. All rights reserved.

// 20240208-7999
// components/inlineedit.js
(function () {

	/* placeholder: https://codepen.io/flesler/pen/kdJmbw */
	const inlineTempl = `
	<div class="a2-edit-inline-wrapper" :class=wrapperClass>
		<div ref=edit class="a2-edit-inline" contenteditable="true" v-text="modelVal"
			@blur=emitChange @focus=onFocus @keypress=onKeyPress @keyup=onKeyUp :data-placeholder="placeholder"/>
		<span class="ico ico-edit" :title="editTip" @click=startEdit v-if="!focus" />
	</div>
	`;

	Vue.component('a2-edit-inline', {
		template: inlineTempl,
		props: {
			item: Object,
			prop: String,
			enterCommand: Function,
			editTip: String,
			placeholder: String
		},
		data() {
			return {
				focus: false
			};
		},
		computed: {
			wrapperClass() {
				return this.focus ? 'focus' : undefined;
			},
			modelVal() {
				return this.item[this.prop];
			}
		},
		methods: {
			onFocus() {
				this.focus = true;
			},
			startEdit() {
				this.$refs.edit.focus();
			},
			endEdit() {
				if (this.enterCommand)
					this.enterCommand();
				this.$refs.edit.blur();
			},
			cancelEdit() {
				this.$refs.edit.textContent = this.modelVal;
				this.focus = false; // lock change
				this.$refs.edit.blur();
			},
			onKeyUp(ev) {
				if (ev.keyCode === 27) { /*Esc*/
					ev.preventDefault();
					ev.stopImmediatePropagation();
					this.cancelEdit();
				}
			},
			onKeyPress(ev) {
				if (ev.keyCode === 13) { /*Enter*/
					ev.preventDefault();
					ev.stopImmediatePropagation();
					this.endEdit();
				}
			},
			emitChange(ev) {
				if (!this.focus) return;
				this.item[this.prop] = ev.target.textContent;
				this.focus = false;
			}
		}
	});
})();
