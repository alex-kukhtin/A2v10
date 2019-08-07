// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20190807-7516*/
/*components/newbutton.js*/

(function () {


	const companyButtonTemplate =
`<div class="a2-company-btn"><div class="dropdown dir-down" v-dropdown v-if="isVisible">
	<button class="btn" :class="btnClass" toggle aria-label="Company">
		<i class="ico" :class="iconClass"></i>
		<span class="company-name">Название компании с очень очень длинным текстом</span>
		<span class="caret"/>
	</button>
	<div class="dropdown-menu menu down-left separate">
	</div>
</div></div>
`;

	Vue.component('a2-company-button', {
		template: companyButtonTemplate,
		props: {
		},
		computed: {
			isVisible() {
				return true;
			},
			iconClass() {
				return 'ico-home'; // this.icon ? 'ico-' + this.icon : '';
			},
			btnClass() {
				return "btn-companyname"; //this.btnStyle ? 'btn-' + this.btnStyle : '';
			}
		},
		created() {
		},
		methods: {
		}
	});

})();