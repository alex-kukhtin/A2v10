/*20171031-7063*/
/*components/debug.js*/

(function () {

    /**
     * TODO
    1. Trace window
    2. Dock right/left
    6.
     */

    const specKeys = {
        '$vm': null,
        '$host': null,
        '$root': null,
        '$parent': null
    };

    function isSpecialKey(key) {
    }

    function toJsonDebug(data) {
        return JSON.stringify(data, function (key, value) {
            if (key[0] === '$')
                return !(key in specKeys) ? value : undefined;
            else if (key[0] === '_')
                return undefined;
            return value;
        }, 2);
    }

    Vue.component('a2-debug', {
        template: `
<div class="debug-panel" v-if="paneVisible">
    <div class="debug-pane-header">
        <span class="debug-pane-title" v-text="title"></span>
        <a class="btn btn-close" @click.prevent="close">&#x2715</a>
    </div>
    <div class="toolbar">
        <button class="btn btn-tb" @click.prevent="refresh"><i class="ico ico-reload"></i> Обновить</button>
    </div>
    <div class="debug-model debug-body" v-if="modelVisible">
        <pre class="a2-code" v-text="modelJson()"></pre>
    </div>
    <div class="debug-trace debug-body" v-if="traceVisible">
        pane for tracing
    </div>
</div>
`,
        props: {
            modelVisible: Boolean,
            traceVisible: Boolean,
            modelStack: Array,
            counter: Number,
            close: Function
        },
        computed: {
            refreshCount() {
                return this.counter;
            },
            paneVisible() {
                return this.modelVisible || this.traceVisible;
            },
            title() {
                return this.modelVisible ? 'Модель данных'
                    : this.traceVisible ? 'Трассировка'
                    : '';
            }
        },
        methods: {
            modelJson() {
                // method. not cached
                if (!this.modelVisible)
                    return;
                if (this.modelStack.length) {
                    return toJsonDebug(this.modelStack[0].$data);
                }
                return '';
            },
            refresh() {
                if (!this.modelVisible)
                    return;
                this.$forceUpdate();
            }
        },
        watch: {
            refreshCount() {
                this.refresh();
            }
        }
    });
})();
