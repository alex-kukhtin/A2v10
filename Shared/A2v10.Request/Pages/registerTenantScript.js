// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

// 20210609-7782

"use strict";

(function () {


	const token = '$(Token)';

	$(Utils)
	$(Locale)
	$(Mask)

	$(AvailableLocales)

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
			userLocale: window.$$locale.$Locale, /*current locale here */
			processing: false,
			info: $(PageData),
			appLinks: $(AppLinks),
			appData: $(AppData),
			submitted: false,
			serverError: '',
			emailError: '',
			showConfirm: false,
			confirmRegisterText: '',
			passwordError: '',
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
			maskedPhone: function() {
				return this.phone ?
					maskTools.getMasked(currentMask, this.phone) : this.phone;
			},
			valid: function() {
				if (!this.submitted) return true;
				return this.validName &&
					this.validPassword &&
					this.validEmail &&
					this.validConfirm;
			},
			validName: function() {
				return this.submitted ? !!this.name : true;
			},
			validPhone: function () {
				return this.submitted ? !!this.phone : true;
			},
			validEmail: function() {
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
			validPassword: function() {
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
			validConfirm: function() {
				return this.submitted ? !!this.confirm && (this.password === this.confirm) : true;
			},
			refer: function() {
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
			submitRegister: function() {
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
					Password: this.password,
					Locale: this.userLocale,
					Referral: this.refer
				};
				const that = this;
				post('/account/register', dataToSend)
					.then(function (response) {
						that.processing = false;
						let result = response.Status;
						if (result === 'Success')
							that.navigate();
						else if (result === 'ConfirmSent')
							that.navigate('/account/confirmcode');
						else if (result === 'AlreadyTaken')
							that.alreadyTaken();
						else if (result === 'PhoneNumberAlreadyTaken')
							that.phoneAlreadyTaken();
						else if (result === 'DDOS')
							that.setError('$TryLater');
						else if (result === 'InvalidEmail')
							that.setError('$InvalidEMailError');
						else if (result === 'AntiForgery') {
							alert(that.locale.$ErrorAntiForgery);
							that.reload();
						}
						else
							alert(result);
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
			confirmSent: function() {
				this.confirmRegisterText = this.locale.$ConfirmRegister.replace('{0}', this.email);
				this.showConfirm = true;
			},
			alreadyTaken: function() {
				this.serverError = this.locale.$AlreadyTaken.replace('{0}', this.email);
			},
			phoneAlreadyTaken: function() {
				this.serverError = this.locale.$PhoneNumberAlreadyTaken.replace('{0}', this.maskedPhone);
			},
			setError: function (key) {
				let err = this.locale[key];
				this.serverError = err || key;
			},
			failure: function(msg) {
				this.password = '';
				this.submitted = false;
				this.serverError = msg;
			},
			reload: function() {
				window.location.reload();
			},
			onPhoneChange: function(value) {
				this.phone = maskTools.getUnmasked(currentMask, value);
				if (this.$refs.phoneInput.value !== this.maskedPhone) {
					this.$refs.phoneInput.value = this.maskedPhone;
					this.$emit('change', this.phone);
				}
			},
			getReferUrl: function(url) {
				return getReferralUrl(url);
			},
			__keyUp(event) {
				if (event.which === 13) {
					this.submitRegister();
				}
			}
		},
		mounted: function() {
			maskTools.mountElement(this.$refs.phoneInput, currentMask);
			document.addEventListener('keypress', this.__keyUp);
		}
	});
})();