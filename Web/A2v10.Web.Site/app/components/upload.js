// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180428-7171
// components/upload.js



(function () {

	const url = require('std:url');
	const http = require('std:http');

	Vue.component("a2-upload", {
        /* TODO:
         4. ControllerName (_image ???)
        */
		template: `
<label :class="cssClass" @dragover="dragOver" @dragleave="dragLeave">
	<input v-if='canUpload' type="file" @change="uploadImage" v-bind:multiple="isMultiple" :accept="accept" />
	<i class="ico" :class="icoClass"></i>
	<span class="upload-tip" v-text="tip" v-if="tip"></span>
</label>
		`,
		props: {
			item: Object,
			prop: String,
			base: String,
			newItem: Boolean,
			tip: String,
			readOnly: Boolean,
			accept: String
		},
		data: function () {
			return {
				hover: false
			};
		},
		computed: {
			cssClass() {
				return 'file-upload' + (this.hover ? ' hover' : '');
			},
			isMultiple() {
				return !!this.newItem;
			},
			canUpload() {
				return !this.readOnly;
			},
			icoClass() {
				return this.accept === 'image/*' ? 'ico-image' : 'ico-upload';
			}
		},
		methods: {
			dragOver(ev) {
				this.hover = true;
				ev.preventDefault();
			},
			dragLeave(ev) {
				this.hover = false;
				ev.preventDefault();
			},
			uploadImage(ev) {
				let root = window.$$rootUrl;
				let id = this.item[this.prop];
				let imgUrl = url.combine(root, '_image', this.base, this.prop, id);
				var fd = new FormData();
				for (let file of ev.target.files) {
					fd.append('file', file, file.name);
				}
				http.upload(imgUrl, fd).then((result) => {
					// result = {status: '', ids:[]}
					ev.target.value = ''; // clear current selection
					if (result.status === 'OK') {
						// TODO: // multiple
						if (this.newItem) {
							let p0 = this.item.$parent;
							for (let id of result.ids) {
								let ni = p0.$append();
								ni[this.prop] = id;
							}
						} else {
							this.item[this.prop] = result.ids[0];
						}
					}
				});
			}
		}
	});

})();
