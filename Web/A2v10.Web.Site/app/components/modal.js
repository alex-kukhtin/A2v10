
/*20170918-7034*/
/* components/modal.js */

(function () {


/**
TODO: may be icon for confirm ????
*/

    const modalTemplate = `
<div class="modal-window">
    <include v-if="isInclude" class="modal-body" :src="dialog.url"></include>
    <div v-else class="modal-body">
        <div class="modal-header"><span v-text="title"></span><button class="btnclose" @click.prevent="modalClose(false)">&#x2715;</button></div>
        <div class="modal-body">
            <p v-text="dialog.message"></p>            
        </div>
        <div class="modal-footer">
            <button class="btn" v-for="(btn, index) in buttons"  :key="index" @click.prevent="modalClose(btn.result)" v-text="btn.text"></button>
        </div>
    </div>
</div>        
`;

	const setWidthComponent = {
		inserted(el, binding) {
			// TODO: width or cssClass???
			//alert('set width-created:' + binding.value);
			// alert(binding.value.cssClass);
			let mw = el.closest('.modal-window');
			if (mw && binding.value.width)
				mw.style.width = binding.value.width;
			//alert(el.closest('.modal-window'));
		}
	};

	Vue.directive('modal-width', setWidthComponent);

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
                let okText = this.dialog.okText || 'OK';
                let cancelText = this.dialog.cancelText || 'Cancel';
                if (this.dialog.buttons)
                    return this.dialog.buttons;
                else if (this.dialog.style === 'alert')
                    return [{ text: okText, result: false }];
                return [
                    { text: okText, result: true },
                    { text: cancelText, result: false }
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