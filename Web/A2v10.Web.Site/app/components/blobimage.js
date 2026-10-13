// Copyright © 2026 Oleksandr Kukhtin. All rights reserved.

// components/blobimage.js

(function () {

	const url = require('std:url');
	const http = require('std:http');
	const tools = require('std:tools');

	const locale = window.$$locale;

	Vue.component('a2-blob-image', {
		template: `
<div class="a2-image">
	<img v-if="hasImage" :src="href" :style="cssStyle"/>
	<a class="remove-image" v-if="hasImage" @click.prevent="removeImage">&#x2715;</a>
	<label v-else :class="uploadClass" :style="uploadStyle"
			@dragover.prevent="hover = true" @dragleave.prevent="hover = false">
		<input type="file" accept="image/*" @change="uploadImage"/>
		<i class="ico ico-image"></i>
		<span class="upload-tip" v-text="tip"></span>
	</label>
</div>
`,
		props: {
			url: String,
			item: Object,
			prop: String,
			width: String,
			height: String
		},
		data() {
			return {
				hover: false
			};
		},
		computed: {
			blob() {
				// RefId: always an object; an empty reference has $id = 0
				return this.item[this.prop];
			},
			href() {
				let b = this.blob;
				if (!b || !b.$id)
					return undefined;
				return url.combine(window.$$rootUrl, '_blob', b.$id) + url.makeQueryString({ token: b[b._meta_.$token] });
			},
			hasImage() {
				return !!this.href;
			},
			tip() {
				return locale.$ClickToDownloadPicture;
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
			uploadClass() {
				return 'file-upload' + (this.hover ? ' hover' : '');
			}
		},
		methods: {
			removeImage() {
				this.blob.$empty();
			},
			uploadImage(ev) {
				this.hover = false;
				let file = ev.target.files[0];
				if (!file)
					return;
				let fd = new FormData();
				fd.append('file', file, file.name);
				// the door: endpoint from Url, key = prop
				let uploadUrl = url.combine(window.$$rootUrl, '_blob', this.url, this.prop);
				http.upload(uploadUrl, fd).then(result => {
					// result = { Id, Token, Name, Mime }
					ev.target.value = '';
					let b = this.blob;
					b[b._meta_.$id] = result.Id;
					b[b._meta_.$token] = result.Token;
					if ('Name' in b) b.Name = result.Name;
					if ('Mime' in b) b.Mime = result.Mime;
				}).catch(msg => {
					ev.target.value = '';
					if (msg.indexOf('UI:') === 0)
						tools.alert(msg.substring(3).replace('\\n', '\n'));
					else
						alert(msg);
				});
			}
		}
	});
})();


