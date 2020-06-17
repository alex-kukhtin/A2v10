// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200617-7674
// components/image.js

(function () {

    /**
     TODO:
    2. if/else - image/upload
    3. Photo, Base for list
    4. multiple for list
    5. css
    <span v-text="href"></span>
    <span>{{newElem}}</span>
     */

	var url = require('std:url');
	const locale = window.$$locale;

	Vue.component('a2-image', {
		template: `
<div class="a2-image">
	<img v-if="hasImage" :src="href" :style="cssStyle" @click.prevent="clickOnImage"/>
	<a class="remove-image" v-if="hasRemove" @click.prevent="removeImage">&#x2715;</a>
	<a2-upload v-if=isUploadVisible :style=uploadStyle accept="image/*"
		:item=itemForUpload :base=base :prop=prop :new-item=newItem :tip=tip :read-only=readOnly :limit=limit :icon=icon></a2-upload>
</div>
`,
		props: {
			base: String,
			item: Object,
			prop: String,
			newItem: Boolean,
			inArray: Boolean,
			source: Array,
			width: String,
			height: String,
			readOnly: Boolean,
			limit: Number,
			placeholder: String,
			icon: String
		},
		data() {
			return {
				newElem: {}
			};
		},
		computed: {
			href: function () {
				if (this.newItem)
					return undefined;
				let root = window.$$rootUrl;
				let id = this.item[this.prop];
				if (!id) return undefined;
				return url.combine(root, '_image', this.base, this.prop, id);
			},
			tip() {
				if (this.readOnly) return '';
				return this.placeholder ? this.placeholder : locale.$ClickToDownloadPicture;
			},
			cssStyle() {
				return { maxWidth: this.width, maxHeight: this.height };
			},
			uploadStyle() {
				let w = { width: this.width, height: this.height };
				if (!w.width) w.width = w.height;
				if (!w.height) w.height = w.width;
				return w;
			},
			hasImage() {
				return !!this.href;
			},
			hasRemove() {
				if (this.readOnly) return false;
				return this.hasImage;
			},
			isUploadVisible: function () {
				if (this.newItem) return true;
				if (this.readOnly) return false;
				return !this.inArray && !this.item[this.prop];
			},
			itemForUpload() {
				return this.newItem ? this.newElem : this.item;
			}
		},
		methods: {
			removeImage: function () {
				if (this.inArray)
					this.item.$remove();
				else
					this.item[this.prop] = undefined;
			},
			clickOnImage: function () {
				//alert('click on image');
			}
		},
		created() {
			if (this.newItem && this.source && this.source.$new) {
				this.newElem = this.source.$new();
			}
		}
	});

	Vue.component('a2-static-image', {
		template: '<img :src="href" :alt="alt"/>',
		props: {
			url: String,
			alt: String
		},
		computed: {
			href: function () {
				let root = window.$$rootUrl;
				return url.combine(root, '_static_image', this.url.replace(/\./g, '-'));
			}
		}
	});

	Vue.component('a2-file-image', {
		template: '<img :src="href" :style="cssStyle" />',
		props: {
			url: String,
			width: String,
			height: String,
			value: [String, Number]
		},
		computed: {
			href: function () {
				let root = window.$$rootUrl;
				return url.combine(root, '_file', this.url, this.value);
			},
			cssStyle() {
				let r = {};
				if (this.width)
					r.maxWidth = this.width;
				if (this.height)
					r.maxHeight = this.height;
				return r;
			}
		}
	});
})();