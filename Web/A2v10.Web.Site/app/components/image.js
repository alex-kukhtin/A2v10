// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

// 20210704-7793
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

	const url = require('std:url');
	const utils = require('std:utils');

	const locale = window.$$locale;

	Vue.component('a2-image', {
		template: `
<div class="a2-image">
	<img v-if="hasImage" :src="href" :style="cssStyle" @click.prevent="clickOnImage"/>
	<a class="remove-image" v-if="hasRemove" @click.prevent="removeImage">&#x2715;</a>
	<a2-upload v-if="isUploadVisible" :style=uploadStyle accept="image/*"
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
				let elem = this.imageOjb;
				if (!elem || !elem.id)
					return undefined;
				return url.combine(root, '_image', this.base, this.prop, elem.id) + url.makeQueryString({ token: elem.token });
			},
			tip() {
				if (this.readOnly) return this.placeholder;
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
				if (this.readOnly)
					return !this.hasImage;
				return !this.inArray && !this.hasImage;
			},
			imageOjb() {
				let elem = this.item[this.prop];
				if (!elem)
					return undefined;
				if (utils.isObjectExact(elem))
					return { id: elem.$id, token: elem[elem._meta_.$token] };
				else
					return { id: elem, token: this.item[this.item._meta_.$token] };
			},
			itemForUpload() {
				return this.newItem ? this.newElem : this.item;
			}
		},
		methods: {
			removeImage: function () {
				if (this.inArray)
					this.item.$remove();
				else {
					let elem = this.item[this.prop];
					if (utils.isObjectExact(elem))
						elem.$empty();
					else
						this.item[this.prop] = undefined;
				}
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
			value: [String, Number, Object]
		},
		computed: {
			href: function () {
				let root = window.$$rootUrl;
				let id = this.value;
				let qry = {};
				if (utils.isObjectExact(this.value)) {
					id = utils.getStringId(this.value);
					if (this.value._meta_ && this.value._meta_.$token)
						qry.token = this.value[this.value._meta_.$token];
				}
				return url.combine(root, '_file', this.url, id) + url.makeQueryString(qry);
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