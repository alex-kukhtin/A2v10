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
			rememberMe: false,
			processing: false,
			info: $(PageData),
			appLinks: $(AppLinks),
			submitted: false,
			serverError: '',
			emailError: ''
		},
		computed: {
			valid() {
				if (!this.submitted) return true;
				return this.validEmail && this.validPassword;
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
			validPassword() {
				return this.submitted ? !!this.password : true;
			},
			locale() {
				return window.$$locale;
			}
		},
		methods: {
			submit() {
				//console.dir('submit called');
				this.submitted = true;
				this.serverError = '';
				this.email = this.email.trim();
				if (!this.valid)
					return;
				this.processing = true;
				let dataToSend = {
					Name: this.email,
					Password: this.password,
					RememberMe: this.rememberMe
				};
				const that = this;
				post('/account/login', dataToSend)
					.then(function (response) {
						that.processing = false;
						let result = response.Status;
						if (result === "Success")
							that.navigate();
						else if (result === 'Failure')
							that.failure(that.locale.$InvalidLoginError);
						else if (result === 'LockedOut')
							that.failure(that.locale.$UserLockuotError);
						else if (result === 'EmailNotConfirmed')
							that.failure(that.locale.$EmailNotConfirmed);
						else
							alert(result);
					})
					.catch(function (error) {
						that.processing = false;
						alert(error);
					});
			},
			onLoginEnter() {
				this.$refs.pwd.focus();
			},
			onPwdEnter(ev) {
				this.submit();
			},
			navigate() {
				let qs = parseQueryString(window.location.search);
				let url = qs.ReturnUrl || '/';
				window.location.assign(url);
			},
			failure(msg) {
				this.password = '';
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