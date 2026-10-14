// Copyright © 2026 Oleksandr Kukhtin. All rights reserved.

// components/blobpreview.js

(function () {

	const url = require('std:url');

	const locale = window.$$locale;

	Vue.component('a2-blob-preview', {
		template: `<div class="a2-file-preview">
	<img v-if="isImage" :src="href" :style="cssStyle"/>
	<object v-else-if="isPdf" type="application/pdf" :data="href"
		:width="pdfWidth" :height="height" :style="cssStyle"></object>
	<div v-else-if="hasBlob" class="no-preview">
		<span class="ico ico-file-preview"></span>
		<a :href="href" v-text="name"></a>
	</div>
	<div v-else class="no-preview">
		<span class="ico ico-file-preview"></span>
		<span v-text="unavailable"></span>
	</div>
</div>`,
		props: {
			value: Object,
			width: String,
			height: String
		},
		computed: {
			// RefId: an object; an empty reference has $id = 0
			hasBlob() {
				return !!(this.value && this.value.$id);
			},
			mime() {
				return this.hasBlob ? (this.value.Mime || '') : '';
			},
			name() {
				return this.hasBlob ? this.value.Name : '';
			},
			// svg too: <img> runs no script, and the server never serves it inline
			isImage() {
				return this.mime.startsWith('image/');
			},
			isPdf() {
				return this.mime === 'application/pdf';
			},
			href() {
				if (!this.hasBlob)
					return undefined;
				return url.blobUrl(this.value);
			},
			pdfWidth() {
				return this.width || '100%';
			},
			unavailable() {
				return locale.$PreviewIsUnavailable;
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

