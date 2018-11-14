// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

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
			valid() {
				if (!this.submitted) return true;
				return this.validEmail;
			},
			validEmail() {
				if (!this.submitted) return true;
				return this.validEmailInline;
			},
			validEmailInline() {
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
			locale() {
				return window.$$locale;
			}
		},
		methods: {
			submit() {
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
			failure(msg) {
				this.submitted = false;
				this.serverError = msg;
			},
			reload() {
				window.location.reload();
			},
			getReferUrl(url) {
				return getReferralUrl(url);
			}
		}
	});
})();