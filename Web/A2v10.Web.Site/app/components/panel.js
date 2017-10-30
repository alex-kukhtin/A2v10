// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171030-7061
// components/panel.js

Vue.component('a2-panel', {
    template:
`<div :class="cssClass">
    <div class="panel-header" @click.prevent="toggle" v-if="!noHeader">
        <slot name='header'></slot>
	    <a v-if="collapsible" class="ico panel-collapse-handle" @click.prevent="toggle"></a>
    </div>
    <slot v-if="expanded"></slot>
</div>
`,
    props: {
        initialCollapsed: Boolean,
        collapsible: Boolean,
        panelStyle: String,
        noHeader: Boolean
    },
    data() {
        return {
            collapsed: this.initialCollapsed
        };
    },
    computed: {
        cssClass() {
            let cls = "panel";
            if (this.collapsed) cls += ' collapsed'; else cls += ' expanded';
            if (this.panelStyle) {
                switch (this.panelStyle.toLowerCase()) {
                    case "red":
                    case "danger":
                    case "error":
                        cls += ' panel-red';
                        break;
                    case "info":
                    case "cyan":
                        cls += ' panel-cyan';
                        break;
                    case "green":
                    case "success":
                        cls += ' panel-green';
                        break;
                    case "warning":
                    case "yellow":
                        cls += ' panel-yellow';
                        break;
                }
            }
            return cls;
        },
        expanded() {
            return !this.collapsed;
        }
    },
    methods: {
        toggle() {
            if (!this.collapsible)
                return;
            this.collapsed = !this.collapsed;
        }
    }
});