// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

//20250913-7983
/*components/popover.js*/

Vue.component('popover', {
	template: `
<div v-dropdown class="popover-wrapper" :style="{top: top}" :class="{show: isShowHover}" :title="title">
	<span toggle class="popover-title" :class=poClass :style=poStyle v-on:mouseover="mouseover"
		v-on:mouseout="mouseout" ><i v-if="hasIcon" :class="iconClass"></i> <span v-text="content"></span><slot name="badge"></slot></span>
	<div class="popup-body" :style="{width: width, left:offsetLeft}">
		<div class="arrow" :style="{left:offsetArrowLeft}"/>
		<div v-if="visible">
			<include :src="popoverUrl"/>
		</div>
		<slot />
	</div>
</div>
`,
	/*
	1. If you add tabindex = "- 1" for 'toggle', then you can close it by 'blur'
	
	2. You can add a close button. It can be any element with a 'close-dropdown' attribute.
		For expample: <span class="close" close-dropdown style="float:right">x</span >
	*/

	data() {
		return {
			state: 'hidden',
			hoverstate: false,
			popoverUrl: ''
		};
	},
	props: {
		icon: String,
		url: String,
		content: [String, Number],
		title: String,
		width: String,
		top: String,
		hover: Boolean,
		offsetX: String,
		arg: undefined,
		lineClamp: Number
	},
	computed: {
		hasIcon() {
			return !!this.icon;
		},
		offsetLeft() {
			return this.offsetX || undefined;
		},
		offsetArrowLeft() {
			if (this.offsetX && this.offsetX.indexOf('-') === 0)
				return `calc(${this.offsetX.substring(1)} + 6px)`;
			return undefined;
		},
		iconClass() {
			let cls = "ico po-ico";
			if (this.icon)
				cls += ' ico-' + this.icon;
			return cls;
		},
		poClass() {
			return this.lineClamp ? 'line-clamp' : undefined;
		},
		poStyle() {
			return this.lineClamp ? { '-webkit-line-clamp': '' + this.lineClamp } : undefined;
		},
		visible() {
			return this.url && this.state === 'shown';
		},
		isShowHover() {
			return this.hover && this.hoverstate ? 'show' : undefined;
		}
	},
	methods: {
		mouseover() {
			if (this.hover)
				this.hoverstate = true;
		},
		mouseout() {
			if (this.hover) {
				this.hoverstate = false;
				/*
				setTimeout(x => {
					this.hoverstate = false;
				}, 250);
				*/
			}
		}
	},
	mounted() {
		this.$el._show = () => {
			this.state = 'shown';
			if (this.url) {
				const urltools = require('std:url');
				let root = window.$$rootUrl;
				let arg = this.arg || '';
				if (typeof arg === 'object')
					arg = arg.Id;
				this.popoverUrl = urltools.combine(root, '/_popup', this.url, arg);
			}
		};
		this.$el._hide = () => {
			this.state = 'hidden';
			this.popoverUrl = '';
		};
	}
});
