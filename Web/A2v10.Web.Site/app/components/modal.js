// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180109-7087
// components/modal.js


(function () {

    const eventBus = require('std:eventBus');

/**
TODO:
    4. Large, Small
    5. Set width v-modal-width=""
*/

    const modalTemplate = `
<div class="modal-window">
    <include v-if="isInclude" class="modal-body" :src="dialog.url"></include>
    <div v-else class="modal-body">
        <div class="modal-header"><span v-text="title"></span><button class="btnclose" @click.prevent="modalClose(false)">&#x2715;</button></div>
        <div :class="bodyClass">
            <i v-if="hasIcon" :class="iconClass" />
            <div v-text="dialog.message" />
        </div>
        <div class="modal-footer">
            <button class="btn btn-default" v-for="(btn, index) in buttons"  :key="index" @click.prevent="modalClose(btn.result)" v-text="btn.text"></button>
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
			if (mw) {
                if (binding.value.width)
				    mw.style.width = binding.value.width;
                if (binding.value.cssClass)
                    mw.classList.add(binding.value.cssClass);
            }
			//alert(el.closest('.modal-window'));
		}
	};

	Vue.directive('modal-width', setWidthComponent);

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
            hasIcon() {
                return !!this.dialog.style;
            },
            title: function () {
                // todo localization
                let defTitle = this.dialog.style === 'confirm' ? "Подтверждение" : "Ошибка";
                return this.dialog.title || defTitle;
            }, 
            bodyClass() {
                return 'modal-body ' + (this.dialog.style || '');
            },
            iconClass() {
                return "ico ico-" + this.dialog.style;
            },
            buttons: function () {
                //console.warn(this.dialog.style);
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