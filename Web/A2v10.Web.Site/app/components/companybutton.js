// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20190816-7525*/
/*components/newbutton.js*/

(function () {


	const companyButtonTemplate =
		`<div class="a2-company-btn"><div class="dropdown dir-down separate" v-dropdown v-if="isVisible">
	<button class="btn" :class="btnClass" toggle aria-label="Company">
		<i class="ico ico-home"></i>
		<span class="company-name" v-text=companyName></span>
		<span class="caret"/>
	</button>
	<div class="dropdown-menu menu down-left">
		<a v-for="comp in source" @click.prevent="selectCompany(comp)" href="" tabindex="-1" class="dropdown-item">
			<i class="ico" :class="icoClass(comp)"/><span class="company-menu-name" v-text="comp.Name"/>
		</a>
		<div class="divider" v-if="hasLinks"/>
		<a v-for="link in links" @click.prevent="gotoLink(link)" href="" tabindex="-1">
			<i class="ico ico-none"/><span v-text="link.Name" />
		</a>
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
			hasLinks() {
				return this.links && this.links.length;
			},
			companyName() {
				let comp = this.source.find(x => x.Current);
				if (comp)
					return comp.Name;
				return "*** UNSELECTED ***";
			},
			isVisible() {
				return true;
			},
			btnClass() {
				return "btn-companyname"; //this.btnStyle ? 'btn-' + this.btnStyle : '';
			}
		},
		created() {
		},
		methods: {
			selectCompany(comp) {
				const http = require("std:http");
				const urlTools = require("std:url");
				const rootUrl = window.$$rootUrl;
				const data = JSON.stringify({ company: comp.Id });
				http.post(urlTools.combine(rootUrl, 'account/switchtocompany'), data)
					.then(x => {
						window.location.assign(rootUrl); // reload
					}).catch(err => {
						alert(err);
					});
			},
			icoClass(cmp) {
				return cmp.Current ? 'ico-check' : 'ico-none';
			}
		}
	});

})();