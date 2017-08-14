(function () {

    const bus = require('eventBus');

    const modalComponent = {
        template: `
        <div class="modal-window">
            <div class="modal-header">
                <span>{{dialog.title}} {{dialog.url}}</span><button @click.stop='closeModal(false)'>x</button>
            </div>
            <include class='dialog-include' :src="dialog.url"></include>
        </div>
        `,
        props: {
            dialog: Object
        },
        data() {
            // always need a new instance of function (modal stack)
            return {
                keyUpHandler: function () {
                    // escape
                    if (event.which === 27) {
                        bus.$emit('modalClose', false);
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            };
        },
        methods: {
            closeModal(result) {
                bus.$emit('modalClose', result);
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