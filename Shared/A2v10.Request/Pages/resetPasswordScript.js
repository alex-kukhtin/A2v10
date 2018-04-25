// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

(function () {


	const token = '$(Token)';

	$(Utils)
	$(Locale)

	const vm = new Vue({
		el: "#app",
		data: {
			email: '',
			password: '',
			confirm: '',
			processing: false,
			info: $(PageData),
			serverInfo: $(ServerInfo),
			submitted: false,
			serverError: '',
			emailError: '',
			showConfirm: false,
			passwordError: ''
		},
		computed: {
			locale() {
				return window.$$locale;
			},
			valid() {
				if (!this.submitted) return true;
				return this.validEmail &&
					this.validPassword &&
					this.validConfirm;
			},
			validEmail() {
				if (!this.submitted) return true;
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
			}
		},
		methods: {
			submit() {
				this.submitted = true;
				this.serverError = '';
				if (!this.valid)
					return;
				this.processing = true;
				let dataToSend = {
					Name: this.email, // !!!!
					Password: this.password,
					Confirm: this.confirm,
					Code: this.serverInfo.token
				};
				const that = this;
				post('/account/resetPassword', dataToSend)
					.then(function (response) {
						that.processing = false;
						let result = response.Status;
						if (result === 'Success')
							that.navigate();
						else if (result === 'Error') {
							that.serverError = that.locale.$ResetPasswordError;
						}
						else if (result === 'InvalidToken') {
							that.serverError = that.locale.$ResetPasswordError;
						}
						else
							alert(result);
					})
					.catch(function (error) {
						that.processing = false;
						alert(error);
					});
			},
			navigate() {
				this.showConfirm = true;
				//let url = '/';
				//window.location.assign(url);
			},
			failure(msg) {
				this.password = '';
				this.submitted = false;
				this.serverError = msg;
			},
			reload() {
				window.location.reload();
			}
		}
	});
})();