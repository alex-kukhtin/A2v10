/* 
	5. Edit value
 */

(function () {

	let du = require('std:utils').date;

	function getProps(root) {
		const ff = (p) => {
			if (p.startsWith('_')) return false;
			let v = root[p];
			if (typeof v === 'function') return false;
			if (v?.constructor?.constructor?.name === 'GeneratorFunction') return false;
			return true;
		};
		const fm = (p) => {
			let v = root[p];
			let isDate = v instanceof Date;
			let tof = typeof v;
			return {
				name: p,
				value: v,
				isObject: !isDate && tof === 'object' && !Array.isArray(v),
				isArray: Array.isArray(v),
				isDate: isDate,
				isString: tof === 'string'
			};
		};
		return Object.keys(root).filter(ff).map(fm);
	}

	const jsonItemTemplate = `
		<li @click.stop.prevent="toggle">
			<span class="jb-label">
				<span v-text="chevron" class="jb-chevron"/>
				<span v-text="root.name" class="jbp-name"/>:
				<span class="jbp-value" :class="valueClass">
					<span v-text="valueText" />
					<span v-if="isScalar" class="ico ico-edit jbp-edit" @click.stop.prevent="editValue"/>
				</span>
			</span>
			<ul v-if="expanded">
				<a2-json-browser-item v-if="!root.isScalar" v-for="(itm, ix) in items" :key=ix :root="itm"></a2-json-browser-item>
			</ul>
		</li>
	`;

	const jsonTreeItem = {
		template: jsonItemTemplate,
		name: 'a2-json-browser-item',
		props: {
			root: Object
		},
		data() {
			return {
				expanded: false
			};
		},
		methods: {
			toggle() {
				if (this.root.isString) return;
				this.expanded = !this.expanded;
			},
			editValue() {
				let n = this.root.name;
				let parentVal = this.$parent.root.value;
				//parentVal[n] = null;
			}
		},
		computed: {
			isScalar() {
				return !this.root.isObject && !this.root.isArray;
			},
			chevron() {
				// \u2003 - em-space
				return (this.isScalar || this.root.isDate) ? '\u2003' : this.expanded ? '⏷' : '⏵';
			},
			valueText() {
				let r = this.root;
				if (r.isObject)
					return r.value.constructor.name; // "Object";
				else if (r.isArray) {
					let ename = '';
					if (r.value && r.value._elem_)
						ename = r.value._elem_.name;
					return `${ename}Array(${r.value.length})`;
				}
				else if (r.isString)
					return `"${r.value}"`;
				else if (r.isDate)
					return du.isZero(r.value) ? 'null' : JSON.stringify(r.value);
				return r.value;
			},
			valueClass() {
				let cls = '';
				if (this.root.isString)
					cls += ' jbp-string';
				else if (this.root.isObject || this.root.isArray)
					cls += ' jbp-object';
				return cls;
			},
			items() {
				return getProps(this.root.value);
			}
		}
	};


	const browserTemplate = `
	<ul class="a2-json-b">
		<a2-json-browser-item v-for="(itm, ix) in items" :key=ix :root="itm"></a2-json-browser-item>
	</ul>
	`;

	Vue.component('a2-json-browser', {
		template: browserTemplate,
		components: {
			'a2-json-browser-item': jsonTreeItem
		},
		props: {
			root: Object
		},
		computed: {
			items() {
				return getProps(this.root);
			}
		}
	});
})();



