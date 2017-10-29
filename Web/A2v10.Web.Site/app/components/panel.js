
Vue.component('a2-panel', {
    template:
`<div :class="cssClass">
    <div class="panel-header">
        <slot name='header'></slot>
	    <a class="ico collapse-handle" @click.stop="toggle"></a>
    </div>
	<div v-if="expanded" class="panel-content">
		<slot name='body'></slot>
	</div>
</div>
`,
    props: {
        collapsed: Boolean
    },
    computed: {
        cssClass() {
            let cls = "panel";
            if (this.collapsed) cls += ' collapsed'; else cls += ' expanded';
            return cls;
        }
    },
    methods: {
        toggle() {
            this.collapsed = !this.collapsed;
        }
    }
});