// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


/* 20180526-7197 */
/*components/wizard.js*/

/*
TODO:
1. btn-primary
2. btn-width
 */

(function () {

	const eventBus = require('std:eventBus');
	const locale = window.$$locale;

	const wizardPageTemplate = `
<div class="wizard-page" v-if="isActive">
	<slot />
</div>
`;

	const wizardPanelTemplate = `
<div class="wizard-panel">
	<ul class="wizard-header">
		<li v-for="(p, px) in pages" :class="pageClass(p)" @click.prevent="selectPage(p)">
			<a><span class="wizard-header-title" v-text="p.header"/><span class="wizard-header-descr" v-text="p.descr"></span></a>
		</li>
	</ul>
	<div class="wizard-content">
		<slot />
	</div>
	<div class="modal-footer">
		<button class="btn a2-inline" @click.prevent="close" v-text="$locale.$Cancel" />
		<button class="btn a2-inline" :disabled="backDisabled" @click.stop="back"><i class="ico ico-chevron-left"/> <span v-text="$locale.$Back"/></button>
		<button class="btn a2-inline" @click.stop="nextFinish" :disabled="nextDisabled"><span v-text="nextFinishText"/> <i class="ico" :class="nextFinishIco""/></button>
	</div>
</div>
`;

	Vue.component('a2-wizard-panel', {
		template: wizardPanelTemplate,
		props: {
			finish: Function
		},
		data() {
			return {
				pages: [],
				activePage: null
			};
		},
		computed: {
			$locale() {
				return locale;
			},
			nextFinishText() {
				let pgs = this.pages;
				return this.activePage === pgs[pgs.length - 1] ? locale.$Finish : locale.$Next;
			},
			nextFinishIco() {
				let pgs = this.pages;
				return this.activePage === pgs[pgs.length - 1] ? 'ico-chevron-right-end' : 'ico-chevron-right';
			},
			backDisabled() {
				return this.activePage === this.pages[0];
			},
			nextDisabled() {
				if (!this.activePage) return false;
				if (this.activePage.$invalid) return true;
				return false;
			}
		},
		methods: {
			selectPage(page) {
				if (page.state === 'init') return;
				if (this.activePage.$invalid) return;
				this.activePage = page;
			},
			pageClass(page) {
				let cls = '';
				if (page === this.activePage)
					cls += ' active';
				return cls;
			},
			close() {
				eventBus.$emit('modalClose');
			},
			back() {
				let pgs = this.pages;
				let ix = pgs.indexOf(this.activePage);
				if (ix <= 0) return;
				this.activePage = pgs[ix - 1];
			},
			nextFinish() {
				if (this.nextDisabled) return;
				let pgs = this.pages;
				let ix = pgs.indexOf(this.activePage);
				this.activePage.state = 'complete';
				if (ix === pgs.length - 1) {
					if (this.finish)
						this.finish();
					else {
						console.error('The FinishCommand is not specified')
					}
				} else {
					this.activePage = pgs[ix + 1];
					this.activePage.state = 'edit';
				}
			},
			$addPage(page) {
				this.pages.push(page);
			},
			$removePage(page) {
				let ix = this.pages.indexOf(page);
				if (ix !== -1)
					this.pages.splice(ix, 1);
			}
		},
		mounted() {
			if (this.pages.length > 0) {
				this.activePage = this.pages[0];
				this.activePage.state = 'edit';
			}
		},
		beforeDestroy() {
		}
	});

	Vue.component("a2-wizard-page", {
		template: wizardPageTemplate,
		props: {
			header: String,
			descr: String
		},
		data() {
			return {
				controls: [],
				state: 'init'
			};
		},
		computed: {
			isActive() {
				return this === this.$parent.activePage;
			},
			$invalid() {
				for (let c of this.controls) {
					if (c.invalid())
						return true;
				}
				return false;
			}
		},
		methods: {
			$registerControl(control) {
				this.controls.push(control);
			},
			$unregisterControl(control) {
				let ix = this.controls.indexOf(control);
				if (ix !== -1)
					this.controls.splice(ix, 1);
			}
		},
		created() {
			this.$parent.$addPage(this);
		},
		beforeDestroy() {
			this.controls.splice(0, this.controls.length);
		},
		destroyed() {
			this.$parent.$removePage(this);
		}
	});

})();