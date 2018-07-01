// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180701-7237
// components/attachments.js

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
	const http = require('std:http');
	const locale = window.$$locale;

	const uploadAttachment = {
		template: `
<label :class="cssClass" @dragover.prevent="dragOver" @dragleave.prevent="dragLeave">
	<input v-if='canUpload' type="file" @change="uploadImage" v-bind:multiple="isMultiple" :accept="accept" ref="inputFile"/>
	<i class="ico ico-upload"></i>
	<span class="upload-tip" v-text="tip" v-if="tip"></span>
</label>
		`,
		data() {
			return {
				hover: false
			};
		},
		props: {
			accept: String,
			tip: String,
			url: String,
			source: Object
		},
		computed: {
			cssClass() {
				return 'file-upload' + (this.hover ? ' hover' : '');
			},
			canUpload() {
				return true;
			},
			isMultiple() {
				return false;
			}
		},
		methods: {
			dragOver(ev) {
				this.hover = true;
			},
			dragLeave(ev) {
				this.hover = false;
			},
			uploadImage(ev) {
				let root = window.$$rootUrl;
				let id = 1; //%%%%this.item[this.prop];
				let uploadUrl = url.combine(root, '_upload', this.url, id);
				var fd = new FormData();
				for (let file of ev.target.files) {
					fd.append('file', file, file.name);
				}
				this.$refs.inputFile.value = '';
				http.upload(uploadUrl, fd).then((result) => {
					ev.target.value = ''; // clear current selected files
					this.source.$merge(result);
				});
			}
		}
	};


	Vue.component('a2-attachments', {
		template: `
<div class="a2-attachments">
	<ul>
		<li><a @click.prevent="clickFile">filename</a></li>
	</ul>
	<a2-upload-attachment v-if="isUploadVisible" :source="source"
		:url="url" :tip="tip" :read-only='readOnly' :accept="accept"/>
</div>
`,
		components: {
			'a2-upload-attachment': uploadAttachment
		},
		props: {
			url: String,
			source: Object,
			readOnly: Boolean,
			accept: String
		},
		computed: {
			tip() {
				if (this.readOnly) return '';
				return locale.$ClickToDownloadFile;
			},
			isUploadVisible: function () {
				return true;
			}
		},
		methods: {
			removeFile: function () {
				if (this.inArray)
					this.item.$remove();
				else
					this.item[this.prop] = undefined;
			},
			clickFile() {
				alert('click file here');
			}
		},
		created() {
		}
	});
})();