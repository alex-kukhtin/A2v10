(function () {

    const bus = require('eventBus');

    const modalComponent = {
        template: `
        <div class="modal-window">
            <div class="modal-header">
                <span>{{dialog.title}} {{dialog.url}}</span><button @click.stop='closeModal'>x</button>
            </div>
            <include class='dialog-include' :src="dialog.url"></include>
        </div>
        `,
        props: {
            dialog: Object
        },
        methods: {
            closeModal() {
                bus.$emit('modalClose');
            }
        }
    };

    app.components['modal'] = modalComponent;
})();