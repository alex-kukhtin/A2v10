// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

// 20221201-7910

"use strict";

(function () {


	const token = '$(Token)';

	$(Utils)
	$(Locale)
	$(Mask)

	$(AvailableLocales)

	const maskTools = maskTool();

	const vm = new Vue({
		el: "#app",
		data: {
			password: '',
			confirm: '',
			processing: false,
			info: $(PageData),
			appLinks: $(AppLinks),
			appData: $(AppData),
			submitted: false,
			serverError: '',
			showConfirm: false,
			confirmRegisterText: '',
			passwordError: ''
		},
		computed: {
			hasLogo() {
				return this.appData && this.appData.appLogo;
			},
			logoSrc() {
				return this.appData.appLogo;
			},
			locale: function () {
				return window.$$locale;
			},
			maskedPhone: function () {
				return this.phone ?
					maskTools.getMasked(currentMask, this.phone) : this.phone;
			},
			valid: function () {
				if (!this.submitted) return true;
				return this.validPassword &&
					this.validConfirm;
			},
			validPassword: function () {
				if (!this.submitted) return true;
				if (!this.password) {
					this.passwordError = this.locale.$EnterPassword;
					return false;
				}
				else if (this.password.length < 6) {
					this.passwordError = this.locale.$PasswordLength;
					return false;
				}
				this.passwordError = '';
				return true;
			},
			validConfirm: function () {
				return this.submitted ? !!this.confirm && (this.password === this.confirm) : true;
			},
			refer: function () {
				let qs = parseQueryString(window.location.search.toLowerCase());
				return qs.ref || '';
			},
			localesArray() {
				if (!avaliableLocales)
					return [];
				return avaliableLocales.map(x => { return { id: x, name: this.locale.$AvailableLocales[x] } });
			},
			hasLocales() {
				return avaliableLocales && avaliableLocales.length;
			}
		},
		methods: {
			submitInitPassword: function () {
				if (this.processing)
					return;
				this.submitted = true;
				this.serverError = '';
				if (!this.valid)
					return;
				this.processing = true;
				let dataToSend = {
					Password: this.password
				};
				const that = this;
				post('/account/initpassword', dataToSend)
					.then(function (response) {
						that.processing = false;
						let result = response.Status;
						if (result === 'Success')
							that.navigate();
						else if (result === 'AntiForgery') {
							alert(that.locale.$ErrorAntiForgery);
							that.reload();
						}
						else {
							that.serverError = that.locale.$ResetPasswordError;
						}
					})
					.catch(function (error) {
						that.processing = false;
						alert(error);
					});
			},
			navigate: function (url) {
				url = url || '/'
				window.location.assign(url);
			},
			setError: function (key) {
				let err = this.locale[key];
				this.serverError = err || key;
			},
			failure: function (msg) {
				this.password = '';
				this.submitted = false;
				this.serverError = msg;
			},
			reload: function () {
				window.location.reload();
			},
			getReferUrl: function (url) {
				return getReferralUrl(url);
			},
			__keyUp(event) {
				if (event.which === 13) {
					this.submitRegister();
				}
			}
		},
		mounted: function () {
			document.addEventListener('keypress', this.__keyUp);
		}
	});
})();