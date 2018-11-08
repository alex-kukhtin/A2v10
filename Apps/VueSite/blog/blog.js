
var vm = new Vue({
	el: '#blog',
	data: {
		text: "vue-text"
	},
	methods: {
		clickButton() {
			alert('Thanks!');
		}
	},
	created() {
	},
	mounted() {
		console.dir('mounted:' + this.text);
	}
});

