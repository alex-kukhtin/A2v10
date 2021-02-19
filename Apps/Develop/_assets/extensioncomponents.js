

Vue.component("textbox-with-mask", {
	extends: component('textbox'),
	props: {
		inputMask: String
	},
	mounted() {
		let im = new Inputmask(this.inputMask);
		im.mask(this.$refs.input);
	}
});

