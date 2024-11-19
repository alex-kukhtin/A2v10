// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

// 20221002-7894
// components/modal.js


(function () {

	const eventBus = require('std:eventBus');
	const locale = window.$$locale;
	const utils = require('std:utils');

	const modalTemplate = `
<div class="modal-window modal-animation-window" @keydown.tab="tabPress" :class="mwClass" ref=dialog>
	<include v-if="isInclude" class="modal-body" :src="dialog.url" :done="loaded" :inside-dialog="true"></include>
	<div v-else class="modal-body">
		<div class="modal-header" v-drag-window><span v-text="title"></span><button ref='btnclose' class="btnclose" @click.prevent="modalClose(false)">&#x2715;</button></div>
		<div :class="bodyClass">
			<i v-if="hasIcon" :class="iconClass" />
			<div class="modal-body-content">
				<div v-html="messageText()" />
				<ul v-if="hasList" class="modal-error-list">
					<li v-for="(itm, ix) in dialog.list" :key="ix" v-text="itm"/>
				</ul>
			</div>
		</div>
		<div class="modal-footer">
			<button class="btn btn-default" v-for="(btn, index) in buttons"  :key="index" @click.prevent="modalClose(btn.result)" v-text="btn.text"/>
		</div>
	</div>
</div>
`;

	const setWidthComponent = {
		inserted(el, binding) {
			// TODO: width or cssClass???
			let mw = el.closest('.modal-window');
			if (mw) {
				if (binding.value.width)
					mw.style.width = binding.value.width;
				let cssClass = binding.value.cssClass;
				switch (cssClass) {
					case 'modal-large':
						mw.style.width = '800px'; // from less
						break;
					case 'modal-small':
						mw.style.width = '350px'; // from less
						break;
				}
				if (binding.value.minWidth)
					mw.style.minWidth = binding.value.minWidth;
			}
		}
	};

	const maximizeComponent = {
		inserted(el, binding) {
			let mw = el.closest('.modal-window');
			if (mw && binding.value)
				mw.setAttribute('maximize', 'true');
		}
	}

	const modalPlacementComponent = {
		inserted(el, binding) {
			if (!binding.value)
				return;
			let mw = el.closest('.modal-window');
			if (!mw || !mw.__vue__)
				return;
			if (mw.__vue__.$data)
				mw.__vue__.$data.placement = ' with-placement ' + binding.value;
			let mf = mw.closest('.modal-wrapper')
			if (mf)
				mf.setAttribute('data-placement', binding.value);
		}
	}

	const dragDialogDirective = {
		inserted(el, binding) {
			const mw = el.closest('.modal-window');
			if (!mw)
				return;
			const opts = {
				down: false,
				init: { x: 0, y: 0, cx: 0, cy: 0 },
				offset: { x: 0, y: 0 }
			};

			function onMouseDown(event) {
				opts.down = true;
				opts.offset.x = event.pageX;
				opts.offset.y = event.pageY;
				const cs = window.getComputedStyle(mw);
				opts.init.x = Number.parseFloat(cs.marginLeft);
				opts.init.y = Number.parseFloat(cs.marginTop);
				opts.init.cx = Number.parseFloat(cs.width);
				opts.init.cy = Number.parseFloat(cs.height);
				document.addEventListener('mouseup', onRelease, false);
				document.addEventListener('mousemove', onMouseMove, false);
			}

			function onRelease(event) {
				opts.down = false;
				document.removeEventListener('mouseup', onRelease);
				document.removeEventListener('mousemove', onMouseMove);
			}

			function onMouseMove(event) {
				if (!opts.down)
					return;
				// flex centered window
				let dx = (event.pageX - opts.offset.x);
				let dy = (event.pageY - opts.offset.y);
				let mx = opts.init.x + dx;
				let my = opts.init.y + dy;
				// fit
				let maxX = window.innerWidth - opts.init.cx;
				//let maxY = window.innerHeight - opts.init.cy - 24 /*footer height*/;
				//if (my < 0) my = 0;
				if (mx < 0) mx = 0;
				if (mx > maxX) mx = maxX;
				if (my < 0) my = 0;
				//if (my > maxY) my = maxY; // any value available
				//console.warn(`dx:${dx}, dy:${dy}, mx:${mx}, my:${my}, cx:${opts.init.cx}`);
				mw.style.marginLeft = mx + 'px';
				mw.style.marginTop = my + 'px';
			}

			el.addEventListener('mousedown', onMouseDown, false);
		}
	};

	Vue.directive('drag-window', dragDialogDirective);

	Vue.directive('modal-width', setWidthComponent);

	Vue.directive('maximize', maximizeComponent);

	Vue.directive("modal-placement", modalPlacementComponent)

	const modalComponent = {
		template: modalTemplate,
		props: {
			dialog: Object
		},
		data() {
			// always need a new instance of function (modal stack)
			return {
				modalCreated: false,
				placement: '',
				keyUpHandler: function (event) {
					// escape
					if (event.which === 27) {
						eventBus.$emit('modalClose', false);
						event.stopPropagation();
						event.preventDefault();
					}
				}
			};
		},
		methods: {
			modalClose(result) {
				eventBus.$emit('modalClose', result);
			},
			loaded() {
				// include loading is complete
			},
			messageText() {
				return utils.text.sanitize(this.dialog.message);
			},
			tabPress(event) {
				const dialog = this.$refs.dialog;
				const activeInput = document.activeElement;
				let elems = Array.from(dialog.querySelectorAll('input:enabled, button:enabled, textarea:enabled, select:enabled, a:not([disabled])'));
				elems = elems
					.filter(el => el && (el.offsetLeft || el.offsetTop || el.offsetWidth || el.offsetHeight))
					.map(el => { return { elem: el, ti: +el.getAttribute('tabindex') || 0, active: el == activeInput }; })
					.filter(el => el.ti !== -1)
					.sort((e1, e2) => e1.ti == e2.ti ? 0 : e1.ti < e2.ti ? -1 : 1);
				if (!elems.length) return;
				const d = event.shiftKey ? -1 : 1;
				let ai = elems.findIndex(x => x.active);
				let ni = ai + d;
				if (ni < 0)
					ni = elems.length - 1;
				else if (ni >= elems.length)
					ni = 0;
				elems[ni].elem.focus();
				event.preventDefault();
			},
			__modalRequery() {
				alert('requery yet not implemented');
			}
		},
		computed: {
			isInclude: function () {
				return !!this.dialog.url;
			},
			mwClass() {
				return this.placement + (this.modalCreated ? ' loaded' : '');
			},
			hasIcon() {
				return !!this.dialog.style;
			},
			title: function () {
				// todo localization
				if (this.dialog.title)
					return this.dialog.title;
				return this.dialog.style === 'confirm' ? locale.$Confirm :
					this.dialog.style === 'info' ? locale.$Message : locale.$Error;
			},
			bodyClass() {
				return 'modal-body ' + (this.dialog.style || '');
			},
			iconClass() {
				let ico = this.dialog.style;
				if (ico === 'info')
					ico = 'info-blue';
				return "ico ico-" + ico;
			},
			hasList() {
				return this.dialog.list && this.dialog.list.length;
			},
			buttons: function () {
				//console.warn(this.dialog.style);
				let okText = this.dialog.okText || locale.$Ok;
				let cancelText = this.dialog.cancelText || locale.$Cancel;
				if (this.dialog.buttons)
					return this.dialog.buttons;
				else if (this.dialog.style === 'alert')
					return [{ text: okText, result: true, tabindex: 1 }];
				else if (this.dialog.style === 'info')
					return [{ text: okText, result: true, tabindex:1 }];
				return [
					{ text: okText, result: true, tabindex:2 },
					{ text: cancelText, result: false, tabindex:1 }
				];
			}
		},
		created() {
			document.addEventListener('keyup', this.keyUpHandler);
			this.savedFocus = document.activeElement;
			if (this.savedFocus && this.savedFocus.blur) {
				this.savedFocus.blur();
			}
		},
		mounted() {
			setTimeout(() => {
				this.modalCreated = true;
			}, 50); // same as shell
		},
		destroyed() {
			if (this.savedFocus && this.savedFocus.focus)
				this.savedFocus.focus();
			document.removeEventListener('keyup', this.keyUpHandler);
		}
	};

	app.components['std:modal'] = modalComponent;
})();