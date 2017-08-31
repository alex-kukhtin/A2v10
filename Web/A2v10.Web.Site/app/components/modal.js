
/*20170828-7021*/
/* components/modal.js */

(function () {


/**
TODO: may be icon for confirm ????
*/

    const modalTemplate = `
<div class="modal-window">
    <include v-if="isInclude" class="modal-content" :src="dialog.url"></include>
    <div v-else class="modal-content">
        <div class="modal-header"><span v-text="title"></span><button @click.stop.prevent="modalClose(false)">x</button></div>
        <div class="modal-body">
            <p v-text="dialog.message"></p>            
        </div>
        <div class="modal-footer">
            <button class="btn" v-for="(btn, index) in buttons"  :key="index" @click="modalClose(btn.result)" v-text="btn.text"></button>
        </div>
    </div>
</div>        
`;
    const eventBus = require('std:eventBus');

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
                        eventBus.$emit('modalClose', false);
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            };
        },
        methods: {
            modalClose(result) {
				eventBus.$emit('modalClose', result);
            }
        },
        computed: {
            isInclude: function () {
                return !!this.dialog.url;
            },
            title: function () {
                return this.dialog.title || 'Error';
            }, 
            buttons: function () {
                console.warn(this.dialog.style);
                if (this.dialog.buttons)
                    return this.dialog.buttons;
                else if (this.dialog.style === 'alert')
                    return [{ text: 'OK', result: false }];
                return [
                    { text: 'OK', result: true },
                    { text: 'Cancel', result: false }
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

    app.components['std:modal'] = modalComponent;
})();