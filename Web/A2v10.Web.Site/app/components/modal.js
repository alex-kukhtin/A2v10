// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180410-7153
// components/modal.js


/*
			<ul v-if="hasList">
				<li v-for="(li, lx) in dialog.list" :key="lx", v-text="li" />
			</ul>
 */

(function () {

	const eventBus = require('std:eventBus');
	const locale = window.$$locale;

	const modalTemplate = `
<div class="modal-window" @keydown.tab="tabPress">
	<include v-if="isInclude" class="modal-body" :src="dialog.url"></include>
	<div v-else class="modal-body">
		<div class="modal-header" v-drag-window><span v-text="title"></span><button class="btnclose" @click.prevent="modalClose(false)">&#x2715;</button></div>
		<div :class="bodyClass">
			<i v-if="hasIcon" :class="iconClass" />
			<div class="modal-body-content">
				<div v-text="dialog.message" />
				<ul v-if="hasList" class="modal-error-list">
					<li v-for="(itm, ix) in dialog.list" :key="ix" v-text="itm"/>
				</ul>
			</div>
		</div>
		<div class="modal-footer">
			<button class="btn btn-default" v-for="(btn, index) in buttons"  :key="index" @click.prevent="modalClose(btn.result)" v-text="btn.text"></button>
		</div>
	</div>
</div>
`;

	const setWidthComponent = {
		inserted(el, binding) {
			// TODO: width or cssClass???
			//alert('set width-created:' + binding.value);
			// alert(binding.value.cssClass);
			let mw = el.closest('.modal-window');
			if (mw) {
				if (binding.value.width)
					mw.style.width = binding.value.width;
				if (binding.value.cssClass)
					mw.classList.add(binding.value.cssClass);
			}
			//alert(el.closest('.modal-window'));
		}
	};

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
			};

			function onRelease(event) {
				opts.down = false;
				document.removeEventListener('mouseup', onRelease);
				document.removeEventListener('mousemove', onMouseMove);
			}

			function onMouseMove(event) {
				if (!opts.down)
					return;
				let dx = event.pageX - opts.offset.x;
				let dy = event.pageY - opts.offset.y;
				let mx = opts.init.x + dx;
				let my = opts.init.y + dy;
				// fit
				let maxX = window.innerWidth - opts.init.cx;
				let maxY = window.innerHeight - opts.init.cy;
				if (my < 0) my = 0;
				if (mx < 0) mx = 0;
				if (mx > maxX) mx = maxX;
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

	const modalComponent = {
		template: modalTemplate,
		props: {
			dialog: Object
		},
		data() {
			// always need a new instance of function (modal stack)
			return {
				keyUpHandler: function () {
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
			tabPress(event) {
				function createThisElems() {
					let qs = document.querySelectorAll('.modal-body [tabindex]');
					let ea = [];
					for (let i = 0; i < qs.length; i++) {
						//TODO: check visibilty!
						ea.push({ el: qs[i], ti: +qs[i].getAttribute('tabindex') });
					}
					ea = ea.sort((a, b) => a.ti > b.ti);
					//console.dir(ea);
					return ea;
				};


				if (this._tabElems === undefined) {
					this._tabElems = createThisElems();
				}
				if (!this._tabElems || !this._tabElems.length)
					return;
				let back = event.shiftKey;
				let lastItm = this._tabElems.length - 1;
				let maxIndex = this._tabElems[lastItm].ti;
				let aElem = document.activeElement;
				let ti = +aElem.getAttribute("tabindex");
				//console.warn(`ti: ${ti}, maxIndex: ${maxIndex}, back: ${back}`);
				if (ti == 0) {
					event.preventDefault();
					return;
				}
				if (back) {
					if (ti === 1) {
						event.preventDefault();
						this._tabElems[lastItm].el.focus();
					}
				} else {
					if (ti === maxIndex) {
						event.preventDefault();
						this._tabElems[0].el.focus();
					}
				}
			}
		},
		computed: {
			isInclude: function () {
				return !!this.dialog.url;
			},
			hasIcon() {
				return !!this.dialog.style;
			},
			title: function () {
				// todo localization
				let defTitle = this.dialog.style === 'confirm' ? locale.$Confirm : locale.$Error;
				return this.dialog.title || defTitle;
			},
			bodyClass() {
				return 'modal-body ' + (this.dialog.style || '');
			},
			iconClass() {
				return "ico ico-" + this.dialog.style;
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
					return [{ text: okText, result: false }];
				return [
					{ text: okText, result: true },
					{ text: cancelText, result: false }
				];
			}
		},
		created() {
			document.addEventListener('keyup', this.keyUpHandler);
		},
		mounted() {
		},
		destroyed() {
			document.removeEventListener('keyup', this.keyUpHandler);
		}
	};

	app.components['std:modal'] = modalComponent;
})();