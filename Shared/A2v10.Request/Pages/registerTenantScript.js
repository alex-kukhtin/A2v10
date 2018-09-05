// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

(function () {


	const token = '$(Token)';

	$(Utils)
	$(Locale)
	$(Mask)

	const maskTools = maskTool();

	// TODO: from LOCALE or WEB.CONFIG
	const currentMask = '+38 (0##) ###-##-##';

	const vm = new Vue({
		el: "#app",
		data: {
			email: '',
			name: '',
			phone: '',
			password: '',
			confirm: '',
			processing: false,
			info: $(PageData),
			appLinks: $(AppLinks),
			submitted: false,
			serverError: '',
			emailError: '',
			showConfirm: false,
			confirmRegisterText: '',
			passwordError: ''
		},
		computed: {
			locale() {
				return window.$$locale;
			},
			maskedPhone() {
				return this.phone ?
					maskTools.getMasked(currentMask, this.phone) : this.phone;
			},
			valid() {
				if (!this.submitted) return true;
				return this.validName &&
					this.validPassword &&
					this.validEmail &&
					this.validPhone &&
					this.validConfirm;
			},
			validName() {
				return this.submitted ? !!this.name : true;
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
			},
			validPhone() {
				return this.submitted ? !!this.phone : true;
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
					Name: this.email, // !!!!
					PersonName: this.name,
					Email: this.email,
					Phone: this.phone,
					Password: this.password
				};
				const that = this;
				post('/account/register', dataToSend)
					.then(function (response) {
						that.processing = false;
						let result = response.Status;
						if (result === 'Success')
							that.navigate();
						else if (result === 'ConfirmSent')
							that.confirmSent();
						else if (result === 'AlreadyTaken')
							that.alreadyTaken();
						else if (result === 'PhoneNumberAlreadyTaken')
							that.phoneAlreadyTaken();
						else if (result === 'DDOS')
							that.ddos();
						else if (result === 'InvalidEmail')
							that.invalidEmail();
						else
							alert(result);
					})
					.catch(function (error) {
						that.processing = false;
						alert(error);
					});
			},
			navigate() {
				let qs = parseQueryString(window.location.search);
				let url = qs.ReturnUrl || '/';
				window.location.assign(url);
			},
			confirmSent() {
				this.confirmRegisterText = this.locale.$ConfirmRegister.replace('{0}', this.email);
				this.showConfirm = true;
			},
			alreadyTaken() {
				this.serverError = this.locale.$AlreadyTaken.replace('{0}', this.email);
			},
			phoneAlreadyTaken() {
				this.serverError = this.locale.$PhoneNumberAlreadyTaken.replace('{0}', this.maskedPhone);
			},
			ddos() {
				this.serverError = this.locale.$TryLater;
			},
			invalidEmail() {
				this.serverError = this.locale.$InvalidEMailError;
			},
			failure(msg) {
				this.password = '';
				this.submitted = false;
				this.serverError = msg;
			},
			reload() {
				window.location.reload();
			},
			onPhoneChange(value) {
				this.phone = maskTools.getUnmasked(currentMask, value);
				if (this.$refs.phoneInput.value !== this.maskedPhone) {
					this.$refs.phoneInput.value = this.maskedPhone;
					this.$emit('change', this.phone);
				}
			}
		},
		mounted() {
			maskTools.mountElement(this.$refs.phoneInput, currentMask);
		}
	});
})();