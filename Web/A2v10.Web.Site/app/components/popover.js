/*20170918-7034*/
/*components/popover.js*/

Vue.component('popover', {
	template: `
<div v-dropdown class="popover-wrapper">
	<span toggle class="popover-title"><i v-if="hasIcon" :class="iconClass"></i> <span v-text="title"></span></span>
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
	1. Если добавить tabindex="-1" для toggle, то можно сделать закрытие по blur
	2. можно добавить кнопку закрытия. Любой элемент с атрибутом close-dropdown
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
        hasIcon() {
            return !!this.icon;
        },
        iconClass() {
            let cls = "ico po-ico";
            if (this.icon)
                cls += ' ico-' + this.icon;
            return cls;
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
		//this.state = 'shown';
	}
});
