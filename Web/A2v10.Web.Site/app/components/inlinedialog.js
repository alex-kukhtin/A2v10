// Copyright © 2020 Alex Kukhtin. All rights reserved.

// 20200205-7625
// components/inlinedialog.js
(function () {
	const eventBus = require('std:eventBus');

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
			width: String
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
				if (event.which === 27) {
					eventBus.$emit('inlineDialog', { cmd: 'close', id: this.dialogId });
					event.stopPropagation();
					event.preventDefault();
				}
			},
			__inlineEvent(opts) {
				if (!opts) return;
				if (opts.id !== this.dialogId) return;
				switch (opts.cmd) {
					case 'close':
						this.open = false;
						this.visible = false;
						document.removeEventListener('keyup', this.__keyUp);
						break;
					case 'open':
						this.visible = true;
						document.addEventListener('keyup', this.__keyUp);
						setTimeout(() => {
							this.open = true;
						}, 50); // same as shell
						break;
					default:
						console.error(`invalid inline command '${opts.cmd}'`);
				}
			}
		},
		created() {
			eventBus.$on('inlineDialog', this.__inlineEvent);
		},
		beforeDestroy() {
			eventBus.$off('inlineDialog', this.__inlineEvent);
		}
	});

})();