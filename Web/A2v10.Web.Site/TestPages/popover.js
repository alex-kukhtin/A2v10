
(function () {


	Vue.component('popover', {
		template: `
<div v-dropdown class="popover-wrapper">
	<span toggle class="popover-title"><i :class="iconClass"></i> <span v-text="title"></span></span>
	<div class="popup-body">
		<div class="arrow" />
		<div v-if="visible">
			<include :src="popoverUrl"/>
		</div>
		<slot />
	</div>	
</div>
`,
		/*
		можно добавить кнопку закрытия. Любой элемент с атрибутом close-dropdown
		<span class="close" close-dropdown style="float:right">x</span >
		*/

		data() {
			return {
				state: 'hidden',
				popoverUrl: ''
			};
		},
		props: {
			icon: String,
			url: String,
			title: String
		},
		computed: {
			iconClass() {
				return "ico po-ico" + this.icon ? ' ico-' + this.icon : '';
			},
			visible() {
				return this.url && this.state === 'shown';
			}
		},
		mounted() {
			this.$el._show = () => {
				this.state = 'shown';
				if (this.url)
					this.popoverUrl = '/_popup' + this.url;
			};
			this.$el._hide = () => {
				this.state = 'hidden';
				this.popoverUrl = '';
			};
			this.state = 'shown';
		}
	});

})();

