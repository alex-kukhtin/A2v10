/*20170921-7037*/
/* services/image.js */

(function () {

    /**
     TODO:
    2. if/else - image/upload
    3. Photo, Base for list
    4. multiple for list
    5. css
     */

    var url = require('std:url');

    Vue.component('a2-image', {
        template: `
<div>
    <span v-text="href"></span>
    <span>{{newElem}}</span>
    <img v-if="isImageVisible" :src="href" style="width:auto;height:auto;max-width:300px" @click.prevent="clickOnImage"/>
    <a @click.prevent="removeImage">x</a>
    <a2-upload v-if="isUploadVisible" :item="itemForUpload" :base="base" :prop="prop" :new-item="newItem"/>
</div>
`,
        props: {
            base: String,
            item: Object,
            prop: String,
            newItem: Boolean,
            inArray: Boolean,
            source: Array
        },
        data() {
            return {
                newElem: {}
            };
        },
        computed: {
            href: function () {
                if (this.newItem)
                    return undefined;
                let root = window.$rootUrl;
                let id = this.item[this.prop];
                return url.combine(root, '_image', this.base, this.prop, id);
            },
            isImageVisible() {
                return !this.newItem;
            },
            isUploadVisible: function () {
                if (this.newItem)
                    return true;
                return !this.inArray && !this.item[this.prop];
            },
            itemForUpload() {
                return this.newItem ? this.newElem : this.item;
            }
        },
        methods: {
            removeImage: function () {
                if (this.inArray)
                    this.item.$remove();
                else
                    this.item[this.prop] = undefined;
            },
            clickOnImage: function () {
                alert('click on image');
            }
        },
        created() {
            if (this.newItem && this.source && this.source.$new) {
                this.newElem = this.source.$new();
            }
        }
    });

})();