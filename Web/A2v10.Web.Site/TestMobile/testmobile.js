

new Vue({
	el: '#app',
	data: {
		menuVisible:false
	},
	methods: {
		toggleMenu() {
			this.menuVisible = !this.menuVisible;
		},
		hideMenu() {
			this.menuVisible = false;
		}
	},
	mounted() {
	}
});