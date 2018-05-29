// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


/* 20180528-7200 */
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
			<a><span class="wizard-header-title" v-text="p.header"/><span class="wizard-header-descr" v-text="p.descr"></span><i v-if="p.errorIcon" class="ico ico-error-outline"></i></a>
		</li>
	</ul>
	<div class="wizard-content">
		<slot />
	</div>
	<div class="modal-footer">
		<template v-if="helpLink">
			<a class="btn-help" :href="helpLink" @click.prevent="$showHelp()"><i class="ico ico-help"/><span v-text="$locale.$Help"/></a>
			<div class="aligner"/>
		</template>
		<button class="btn a2-inline" @click.prevent="close" v-text="$locale.$Cancel" />
		<button class="btn a2-inline" :disabled="backDisabled" @click.stop="back"><i class="ico ico-chevron-left"/> <span v-text="$locale.$Back"/></button>
		<button class="btn a2-inline" :class="nextFinishClass" @click.stop="nextFinish" :disabled="nextDisabled"><span v-text="nextFinishText"/> <i class="ico" :class="nextFinishIco""/></button>
	</div>
</div>
`;

	Vue.component('a2-wizard-panel', {
		template: wizardPanelTemplate,
		props: {
			finish: Function,
			helpLink: String
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
			},
			nextFinishClass() {
				let pgs = this.pages;
				return this.activePage === pgs[pgs.length - 1] ? 'btn-primary' : '';

			}
		},
		methods: {
			setActivePage(page) {
				if (this.activePage) this.activePage.visit = true;
				this.activePage = page;
				this.activePage.state = 'edit';
			},
			selectPage(page) {
				if (this.$nextPage(page) && !this.nextDisabled) {
					this.setActivePage(page);
					return;
				}
				if (!page.visit) return;
				this.setActivePage(page);
			},
			pageClass(page) {
				let cls = '';
				//if (page.state === 'init') {
				if (!page.visit) {
					if (this.$nextPage(page) && !this.nextDisabled)
						return cls;
					cls = 'disabled';
				}
				if (page === this.activePage)
					cls = 'active';
				else if (page.wasInvalid)
					cls = 'invalid';
				return cls;
			},
			close() {
				eventBus.$emit('modalClose');
			},
			back() {
				let pgs = this.pages;
				let ix = pgs.indexOf(this.activePage);
				if (ix <= 0) return;
				this.setActivePage(pgs[ix - 1]);
			},
			nextFinish() {
				if (this.nextDisabled) return;
				let pgs = this.pages;
				let ix = pgs.indexOf(this.activePage);
				if (ix === pgs.length - 1) {
					if (this.finish)
						this.finish();
					else {
						console.error('The FinishCommand is not specified');
					}
				} else {
					this.setActivePage(pgs[ix + 1]);
				}
			},
			$nextPage(page) {
				let ia = this.pages.indexOf(this.activePage);
				let ix = this.pages.indexOf(page);
				return ix === ia + 1;
			},
			$addPage(page) {
				this.pages.push(page);
			},
			$removePage(page) {
				let ix = this.pages.indexOf(page);
				if (ix !== -1)
					this.pages.splice(ix, 1);
			},
			$showHelp() {
				if (!this.helpLink) return;
				window.open(this.helpLink, "_blank");
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
				state: 'init',
				wasInvalid: false,
				visit: false
			};
		},
		computed: {
			isActive() {
				return this === this.$parent.activePage;
			},
			isNextPage() {
				return $parent.$nextPage(this);
			},
			$invalid() {
				if (!this.controls.length) return false;
				for (let c of this.controls) {
					if (c.invalid()) {
						this.wasInvalid = true;
						return true;
					}
				}
				this.wasInvalid = false;
				return false;
			},
			errorIcon() {
				if (!this.visit) return false;
				// ther are no controls here
				return this.wasInvalid;
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