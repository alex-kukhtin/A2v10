// Copyright © 2015-2020 Oleksandr Kukhtin. All rights reserved.

// 20200108-7609
// components/fileupload.js

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
	const tools = require('std:tools');

	Vue.component('a2-file-upload', {
		template: `
<div class="a2-file-upload">
<label :class="cssClass" @dragover.prevent="dragOver" @dragleave.prevent="dragLeave">
	<input v-if='canUpload' type="file" @change="uploadFile" v-bind:multiple="isMultiple" :accept="accept" ref="inputFile"/>
	<i class="ico ico-upload"></i>
	<span class="upload-tip" v-text="tip" v-if="tip"></span>
</label>
</div>
`,
		data() {
			return {
				hover: false
			};
		},
		props: {
			accept: String,
			url: String,
			source: Object,
			delegate: Function,
			errorDelegate: Function,
			argument: [Object, String, Number],
			limit:Number
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
			},
			tip() {
				if (this.readOnly) return '';
				return locale.$ClickToDownloadFile;
			}
		},
		methods: {
			dragOver(ev) {
				this.hover = true;
			},
			dragLeave(ev) {
				this.hover = false;
			},
			checkLimit(file) {
				if (!this.limit) return false;
				let sizeKB = file.size / 1024;
				return sizeKB > this.limit;
			},
			uploadFile(ev) {
				let root = window.$$rootUrl;

				let id = 1;
				let uploadUrl = url.combine(root, '_file', this.url);
				let na = this.argument ? Object.assign({}, this.argument) : { Id: id };
				uploadUrl = url.createUrlForNavigate(uploadUrl, na);
				var fd = new FormData();
				for (let file of ev.target.files) {
					if (this.checkLimit(file)) {
						ev.target.value = ''; // clear current selection
						let msg = locale.$FileTooLarge.replace('{0}', this.limit);
						tools.alert(msg);
						return;
					}
					fd.append('file', file, file.name);
				}
				this.$refs.inputFile.value = '';
				http.upload(uploadUrl, fd).then((result) => {
					ev.target.value = ''; // clear current selected files
					if (this.delegate)
						this.delegate(result);
				}).catch(msg => {
					if (this.errorDelegate)
						this.errorDelegate(msg);
					else if (msg.indexOf('UI:') === 0)
						tools.alert(msg.substring(3).replace('\\n', '\n'));
					else
						alert(msg);
				});
			}
		}
	});
})();