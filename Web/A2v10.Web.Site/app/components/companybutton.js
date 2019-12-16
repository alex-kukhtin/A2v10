// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20191216-7600*/
/*components/newbutton.js*/

(function () {


	const companyButtonTemplate =
`<div class="a2-company-btn"><div class="dropdown dir-down separate" v-dropdown v-if="isVisible">
	<button class="btn btn-companyname" toggle aria-label="Company">
		<i class="ico ico-home"></i>
		<span class="company-name" v-text=companyName></span>
		<span class="caret"/>
	</button>
	<div class="dropdown-menu menu down-left">
		<a v-for="comp in source" @click.prevent="selectCompany(comp)" href="" tabindex="-1" class="dropdown-item">
			<i class="ico" :class="icoClass(comp)"/><span class="company-menu-name" v-text="comp.Name"/>
		</a>
		<template v-if="hasLinks">
			<div class="divider"/>
			<a v-for="link in links" @click.prevent="gotoLink(link)" href="" tabindex="-1" class="dropdown-item">
				<i class="ico" :class="linkClass(link)"/><span v-text="link.Name" />
			</a>
		</template>
	</div>
</div></div>
`;

	Vue.component('a2-company-button', {
		template: companyButtonTemplate,
		props: {
			source: Array,
			links: Array
		},
		computed: {
			isVisible() {
				return this.source.length > 0;
			},
			hasLinks() {
				return this.links && this.links.length;
			},
			companyName() {
				if (this.source.length === 0)
					return '';
				let comp = this.source.find(x => x.Current);
				if (comp)
					return comp.Name;
				return "*** UNSELECTED ***";
			}
		},
		methods: {
			selectCompany(comp) {
				const http = require("std:http");
				const urlTools = require("std:url");
				const rootUrl = window.$$rootUrl;
				const data = JSON.stringify({ company: comp.Id });
				http.post(urlTools.combine(rootUrl, '_application/switchtocompany'), data)
					.then(x => {
						window.location.assign(urlTools.combine(rootUrl, '/') /*always root */);
					}).catch(err => {
						alert(err);
					});
			},
			gotoLink(link) {
				const store = component('std:store');
				if (store)
					store.commit('navigate', { url: link.Url});
			},
			icoClass(cmp) {
				return cmp.Current ? 'ico-check' : 'ico-none';
			},
			linkClass(link) {
				return `ico-${link.Icon || 'none'}`;
			}
		}
	});

})();