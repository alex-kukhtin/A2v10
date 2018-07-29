// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

//20180729-7259
/*components/popover.js*/

Vue.component('popover', {
	template: `
<div v-dropdown class="popover-wrapper" :style="{top: top}">
	<span toggle class="popover-title"><i v-if="hasIcon" :class="iconClass"></i> <span :title="title" v-text="content"></span></span>
	<div class="popup-body" :style="{width: width}">
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
		content: String,
		title: String,
		width: String,
		top: String
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
