// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


/* 20180521-7192 */
/*components/wizard.js*/

/*
TODO:
3. disable buttons
4. WizardPage class
5. check validators for this page (and for tabs too)
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
			<a><span v-text="p.header"/><i class="ico ico-error-outline"/></a>
		</li>
	</ul>
	<div class="wizard-content">
		<slot />
	</div>
	<div class="modal-footer">
		<button class="btn a2-inline" @click.prevent="close" v-text="$locale.$Cancel" />
		<button class="btn a2-inline" v-text="$locale.$Back" :disabled="backDisabled" @click.stop="back"/>
		<button class="btn a2-inline" v-text="nextFinishText" @click.stop="nextFinish"/>
	</div>
</div>
`;

	Vue.component('a2-wizard-panel', {
		template: wizardPanelTemplate,
		props: {
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
			backDisabled() {
				return this.activePage === this.pages[0];
			}
		},
		methods: {
			selectPage(page) {
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
				alert('back');
			},
			nextFinish() {
				alert('next/finish');
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
			if (this.pages.length > 0)
				this.activePage = this.pages[0];
		},
		beforeDestroy() {

		}
	});

	Vue.component("a2-wizard-page", {
		template: wizardPageTemplate,
		props: {
			header: String
		},
		data() {
			return {
				controls: []
			};
		},
		computed: {
			isActive() {
				return this === this.$parent.activePage;
			}
		},
		methods: {
			$registerControl(control) {
				this.controls.push(control);
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