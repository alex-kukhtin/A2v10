// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.
// version 7372

'use strict';

(function () {


	const token = '$(Token)';

	$(Utils)
	$(Locale)

	// MODE: email -> confirm -> reset

	const vm = new Vue({
		el: "#app",
		data: {
			email: '',
			password: '',
			confirm: '',
			code: '',
			processing: false,
			info: $(PageData),
			appLinks: $(AppLinks),
			submitted: false,
			serverError: '',
			emailError: '',
			passwordError: '',
			mode: '',
			confirmText: '',
		},
		computed: {
			valid:function() {
				if (!this.submitted) return true;
				return this.validEmail;
			},
			validEmail: function() {
				if (!this.submitted) return true;
				return this.validEmailInline;
			},
			validEmailInline: function() {
				if (!this.email) {
					this.emailError = this.locale.$EnterEMail;
					return false;
				} else if (!validEmail(this.email)) {
					this.emailError = this.locale.$InvalidEMail;
					return false;
				}
				this.emailError = '';
				return true;
			},
			validPassword() {
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
			validConfirm() {
				return this.submitted ? !!this.confirm && (this.password === this.confirm) : true;
			},
			locale: function() {
				return window.$$locale;
			},
			passwordError() {
				return 'TODO:passwordError';
			},
			confirmCodeDisabled() {
				return !this.code;
			},
			emailVisible() { return this.mode === ''; },
			codeVisible() { return this.mode === 'code'; },
			passwordVisible() { return this.mode === 'password';}
		},
		methods: {
			submitCode() {
				this.submitted = true;
				this.serverError = '';
				this.code = this.code.trim();
				if (!this.code)
					return;
				this.processing = true;
				let dataToSend = {
					Email: this.email,
					Code: this.code
				};
				const that = this;
				post('/account/forgotpasswordcode', dataToSend)
					.then(function (response) {
						that.processing = false;
						switch (response.Status) {
							case 'Success':
								that.mode = 'password';
								that.confirmText = that.locale.$ConfirmReset.replace('{0}', that.email);
								break;
							case "InvalidCode":
								that.serverError = that.locale.$InvalidConfirmCode;
								break;
							default:
								alert(result);
								break;
						}
					})
					.catch(function (error) {
						that.processing = false;
						alert(error);
					});
			},
			submitReset() {
				this.submitted = true;
				this.serverError = '';
				if (!this.valid)
					return;
				this.processing = true;
				let dataToSend = {
					email: this.email,
					Password: this.password,
					Confirm: this.confirm,
					Code: this.code
				};
				const that = this;
				post('/account/resetpassword', dataToSend)
					.then(function (response) {
						that.processing = false;
						switch (response.Status) {
							case 'Success':
								window.location.assign('/');
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
			submitForgot: function() {
				this.submitted = true;
				this.serverError = '';
				this.email = this.email.trim();
				if (!this.valid)
					return;
				this.processing = true;
				let dataToSend = {
					Email: this.email
				};
				const that = this;
				post('/account/forgotpassword', dataToSend)
					.then(function (response) {
						that.processing = false;
						let result = response.Status;
						if (result === 'Success') {
							that.confirmText = that.locale.$ConfirmReset.replace('{0}', that.email);
							that.mode = 'code';
						} else if (result === 'NotFound') {
							that.serverError = that.locale.$InvalidEMailError;
						} else if (result === 'NotAllowed') {
							that.serverError = that.locale.$ResetPasswordNotAllowed;
						}
						else
							alert(result);
					})
					.catch(function (error) {
						that.processing = false;
						alert(error);
					});
			},
			failure: function(msg) {
				this.submitted = false;
				this.serverError = msg;
			},
			reload: function() {
				window.location.reload();
			},
			getReferUrl: function(url) {
				return getReferralUrl(url);
			}
		}
	});
})();