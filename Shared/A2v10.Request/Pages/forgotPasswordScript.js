// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.
// version 7372

'use strict';

(function () {


	const token = '$(Token)';


	$(Utils)
	$(Locale)

	const vm = new Vue({
		el: "#app",
		data: {
			email: '',
			processing: false,
			info: $(PageData),
			appLinks: $(AppLinks),
			submitted: false,
			serverError: '',
			emailError: '',
			showConfirm: false,
			confirmText: ''
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
			locale: function() {
				return window.$$locale;
			}
		},
		methods: {
			submit: function() {
				this.submitted = true;
				this.serverError = '';
				this.email = this.email.trim();
				if (!this.valid)
					return;
				this.processing = true;
				let dataToSend = {
					Name: this.email
				};
				const that = this;
				post('/account/forgotPassword', dataToSend)
					.then(function (response) {
						that.processing = false;
						let result = response.Status;
						if (result === 'Success') {
							that.confirmText = that.locale.$ConfirmReset.replace('{0}', that.email);
							that.showConfirm = true;
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