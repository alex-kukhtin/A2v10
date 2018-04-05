// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180405-7149
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
	<a2-upload v-if="isUploadVisible" :style="uploadStyle" :item="itemForUpload" :base="base" :prop="prop" :new-item="newItem" :tip="tip" :read-only='readOnly'/>
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
			readOnly: Boolean
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
				let root = window.$rootUrl;
				let id = this.item[this.prop];
				if (!id) return undefined;
				return url.combine(root, '_image', this.base, this.prop, id);
			},
			tip() {
				if (this.readOnly) return '';
				return locale.$ClickToDownloadPicture;
			},
			cssStyle() {
				return { width: this.width, height: this.height };
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
				let root = window.$rootUrl;
				return url.combine(root, '_static_image', this.url.replace(/\./g, '-'));
			}
		}
	});
})();