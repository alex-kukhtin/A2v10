// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180411-7156
// components/toastr.js


(function () {

	const locale = window.$$locale;

	const toastrTemplate = `
<div class="toastr-stack" >
	<ul class="toast-list">
		<li class="toast success">
			<i class="ico ico-check"></i><span>i am the toast 1</span>
		</li>
		<li class="toast warning">
			<i class="ico ico-warning-outline"></i><span>i am the toast warning</span>
		</li>
		<li class="toast info">
			<i class="ico ico-info-outline"></i><span>Документ сохранен успешно и записан в базу данных!</span>
		</li>
		<li class="toast danger">
			<i class="ico ico-error-outline-nocolor"></i><span>Документ сохранен c ошибкой. Проверьте все, что можно</span>
		</li>
	</ul>
</div>
`;

	const toastrComponent = {
		template: toastrTemplate,
		props: {
		},
		data() {
			return {
			};
		},
		methods: {
		},
		computed: {
		},
		created() {
		},
		mounted() {
		},
		destroyed() {
		}
	};

	app.components['std:toastr'] = toastrComponent;
})();