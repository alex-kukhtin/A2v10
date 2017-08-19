(function () {


/**
TODO: may be icon for confirm ????
*/

    const modalTemplate = `
<div class="modal-window">
    <include v-if="isInclude" class="modal-content" :src="dialog.url"></include>
    <div v-else class="modal-content">
        <div class="modal-header"><span v-text="title"></span><button @click.stop.prevent="closeModal(false)">x</button></div>
        <div class="modal-body">
            <p v-text="dialog.message"></p>            
        </div>
        <div class="modal-footer">
            <button v-for="(btn, index) in buttons"  :key="index" @click="closeModal(btn.result)" v-text="btn.text"></button>
        </div>
    </div>
</div>        
`;
    const store = require('store');

    const modalComponent = {
        template: modalTemplate,
        props: {
            dialog: Object
        },
        data() {
            // always need a new instance of function (modal stack)
            return {
                keyUpHandler: function () {
                    // escape
                    if (event.which === 27) {
                        store.$emit('modalClose', false);
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            };
        },
        methods: {
            closeModal(result) {
                store.$emit('modalClose', result);
            }
        },
        computed: {
            isInclude: function () {
                return !!this.dialog.url
            },
            title: function () {
                return this.dialog.title || 'error';
            }, 
            buttons: function () {
                if (this.dialog.buttons)
                    return this.dialog.buttons;
                return [
                    { text: "OK", result: true },
                    { text: "Cancel", result: false }
                ];
            }
        },
        created() {
            document.addEventListener('keyup', this.keyUpHandler);
        },
        destroyed() {
            document.removeEventListener('keyup', this.keyUpHandler);
        }
    };

    app.components['modal'] = modalComponent;
})();