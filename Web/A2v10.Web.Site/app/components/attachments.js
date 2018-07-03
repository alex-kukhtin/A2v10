// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180703-7238
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
	const tools = require('std:tools');

	const uploadAttachment = {
		template: `
<label :class="cssClass" @dragover.prevent="dragOver" @dragleave.prevent="dragLeave">
	<input v-if='canUpload' type="file" @change="uploadFile" v-bind:multiple="isMultiple" :accept="accept" ref="inputFile"/>
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
			source: Object,
			delegate: Function
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
			uploadFile(ev) {
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
					if (this.delegate)
						this.delegate.call(this.source, result);
					//this.source.$merge(result);
				}).catch(msg => {
					if (msg.indexOf('UI:') === 0)
						tools.alert(msg.substring(3).replace('\\n', '\n'));
					else
						alert(msg);
				});
			}
		}
	};

	/*
	<ul>
		<li><a @click.prevent="clickFile">filename</a></li>
	</ul>
	*/

	Vue.component('a2-attachments', {
		template: `
<div class="a2-attachments">
	<a2-upload-attachment v-if="isUploadVisible" :source="source" :delegate="delegate"
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
			accept: String,
			delegate: Function
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