
app.components['std:appHeader'] = {

	extends: component('std:appHeaderBase'),

	template: `
<div class="navbar navbar-dark bg-dark navbar-expand-lg app-header">
<div class="container-fluid">
	<a class="navbar-brand" href="/" v-text=title></a>
	<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
		<span class="navbar-toggler-icon"></span>
	</button>
	<div class="collapse navbar-collapse" id="navbarNavAltMarkup">
		<ul class="navbar-nav me-auto">
			<li v-for="m in menu" class="nav-item"><a class="nav-link" :class="{active: isActive(m)}"
	v-text=m.Name href="" @click.stop.prevent=navigate(m)></a></li>
		</ul>
		<span class="navbar-text" v-text=personName></span>
	</div>
</div>
</div>`,

	props: {

	},
	methods: {

	},
	created: function() {
	}
};
