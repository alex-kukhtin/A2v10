// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

// 20210619-7785

"use strict";

(function () {


	const token = '$(Token)';

	$(Utils)
	$(Locale)

	// TODO: from LOCALE or WEB.CONFIG
	const currentMask = '+38 (0##) ###-##-##';

	const vm = new Vue({
		el: "#app",
		data: {
			email: '$(UserEmail)',
			userLocale: window.$$locale.$Locale, /*current locale here */
			processing: false,
			info: $(PageData),
			appLinks: $(AppLinks),
			appData: $(AppData),
			submitted: false,
			serverError: '',
			passwordError: '',
			confirmCode: '',
			loginVisible: false,
			againVisible: true
		},
		computed: {
			hasLogo() {
				return this.appData && this.appData.appLogo;
			},
			logoSrc() {
				return this.appData.appLogo;
			},
			locale: function() {
				return window.$$locale;
			},
			confirmRegisterText() {
				return this.locale.$ConfirmRegister.replace('{0}', this.email);
			},
			valid: function() {
				if (!this.submitted) return true;
				return !!this.confirmCode;
			},
			confirmEmailDisabled() {
				return !this.confirmCode;
			}
		},
		methods: {
			submitConfirm: function () {
				this.processing = true;
				let dataToSend = {
					Code: this.confirmCode,
					Email: this.email
				};
				const that = this;
				post('/account/confirmcode', dataToSend)
					.then(function (response) {
						//console.dir(response);
						that.processing = false;
						let result = response.Status;
						switch (result) {
							case 'Success':
								that.navigate();
								break;
							case 'EMailAlreadyConfirmed':
								that.setError('$EMailAlreadyConfirmed');
								that.loginVisible = true;
								that.againVisible = false;
								break;
							case 'InvalidConfirmCode':
								that.setError('$InvalidConfirmCode');
								break;
							case 'LoggedIn':
								that.navigate();
								break;
							case 'DelayedConfirm':
								window.location.assign('/account/confirmemailsuccess');
								break;
							case 'AntiForgery':
								alert(that.locale.$ErrorAntiForgery);
								that.reload();
								break;
							default:
								alert(result);
						}
					})
					.catch(function (error) {
						that.processing = false;
						alert(error);
					});
			},
			sendCodeAgain() {
				this.processing = true;
				let dataToSend = {
					Email: this.email
				};
				const that = this;
				post('/account/sendcodeagain', dataToSend)
					.then(function (response) {
						that.processing = false;
						let result = response.Status;
						switch (result) {
							case 'Success':
								break;
							default:
								alert(result);
						}
					})
					.catch(function (error) {
						that.processing = false;
						alert(error);
					});
			},
			navigate: function() {
				let qs = parseQueryString(window.location.search);
				let url = qs.ReturnUrl || '/';
				window.location.assign(url);
			},
			reload: function () {
				window.location.reload();
			},
			setError: function (key) {
				let err = this.locale[key];
				this.serverError = err || key;
			},
			getReferUrl: function (url) {
				return getReferralUrl(url);
			},
			__keyUp(event) {
				if (event.which === 13) {
					this.submitConfirm();
				}
			}
		},
		mounted: function() {
			document.addEventListener('keypress', this.__keyUp);
		}
	});
})();