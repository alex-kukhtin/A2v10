// Copyright © 2020-2021 Oleksandr Kukhtin. All rights reserved.

// 20211210-7812
// components/inlinedialog.js
(function () {
	const eventBus = require('std:eventBus');

	let __inlineStack = []; // for ESC support

	Vue.component('a2-inline-dialog', {
		template:
`<div class="inline-modal-wrapper modal-animation-frame" v-if="visible" :class="{show: open}" v-cloak>
	<div class="modal-window modal-animation-window" :class="{loaded: open}" :style="dlgStyle">
		<slot></slot>
	</div>
</div>
`,
		props: {
			dialogId: String,
			dialogTitle: String,
			width: String,
			noClose: Boolean
		},
		data() {
			return {
				visible: false,
				open: false //for animation
			};
		},
		computed: {
			dlgStyle() {
				if (this.width)
					return { width: this.width };
				return undefined;
			}
		},
		methods: {
			__keyUp(event) {
				if (this.noClose) return;
				if (event.which === 27) {
					event.stopPropagation();
					event.preventDefault();
					if (__inlineStack.length && __inlineStack[0] !== this.dialogId)
						return;
					setTimeout(() => {
						eventBus.$emit('inlineDialog', { cmd: 'close', id: this.dialogId });
					}, 1);
				}
			},
			__inlineEvent(opts) {
				if (!opts) return;
				if (opts.id !== this.dialogId) return;
				switch (opts.cmd) {
					case 'close':
						if (window.__requestsCount__ > 0) return;
						__inlineStack.shift();
						this.open = false;
						this.visible = false;
						document.removeEventListener('keyup', this.__keyUp);
						break;
					case 'open':
						this.visible = true;
						__inlineStack.unshift(this.dialogId);
						document.addEventListener('keyup', this.__keyUp);
						setTimeout(() => {
							this.open = true;
						}, 50); // same as shell
						break;
					case 'count':
						opts.count = __inlineStack.length;
						break;
					default:
						console.error(`invalid inline command '${opts.cmd}'`);
				}
			},
			__inlineCount(opts) {
				opts.count = __inlineStack.length;
			}
		},
		created() {
			eventBus.$on('inlineDialog', this.__inlineEvent);
			eventBus.$on('inlineDialogCount', this.__inlineCount);
		},
		beforeDestroy() {
			document.removeEventListener('keyup', this.__keyUp);
			eventBus.$off('inlineDialog', this.__inlineEvent);
			eventBus.$off('inlineDialogCount', this.__inlineCount);
		}
	});

})();