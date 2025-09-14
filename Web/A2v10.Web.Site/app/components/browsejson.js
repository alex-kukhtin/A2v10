// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

// 20250914-7984
// components/browsejson.js*/

(function () {

	let utils = require('std:utils');
	let du = utils.date;

	const sppArray = "$valid,$invalid,$dirty,$lock,$selected,$selectedIndex,$checked,$hasSelected,$hasChecked,$isEmpty,$permissions,$RowCount,$expanded,$collapsed,$level,$loaded,$names,$ids"
		.split(',');
	const specProps = new Set(sppArray);

	function getProps(root, skipSpec) {
		if (!root) return [];
		const ff = (p) => {
			if (skipSpec && specProps.has(p)) return false;
			if (p.startsWith('_')) return false;
			let v = root[p];
			if (typeof v === 'function') return false;
			let c = v ? v.constructor : null;
			if (c) c = c.constructor;
			if (c && c.name === 'GeneratorFunction') return false;
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
				<span class="jbp-overlay">
					<span v-text="root.name" class="jbp-name"/>:
					<span class="jbp-value" :class="valueClass">
						<span v-text="valueText" />
						<span v-if="isScalar" class="ico ico-edit jbp-edit" @click.stop.prevent="editValue"/>
					</span>
				</span>
			</span>
			<ul v-if="expanded">
				<a2-json-browser-item v-if="!root.isScalar" v-for="(itm, ix) in items" :key=ix :root="itm" :use-spec="useSpec"/>
			</ul>
		</li>
	`;

	const jsonTreeItem = {
		template: jsonItemTemplate,
		name: 'a2-json-browser-item',
		props: {
			root: Object,
			useSpec: Boolean
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
			},
			expandAll(val) {
				if (this.root.isString) return;
				this.expanded = val;
				Vue.nextTick(() => {
					for (let c of this.$children)
						c.expandAll(val);
				});
			},
			clearExpanded() {
				this.expanded = false;
				for (let c of this.$children)
					c.clearExpanded();
			}
		},
		computed: {
			isScalar() {
				return !this.root.isObject && !this.root.isArray;
			},
			chevron() {
				// \u2003 - em-space
				let noExpand = this.isScalar || this.root.isDate;
				if (this.root.isObject && this.root.value === null)
					noExpand = true;
				return noExpand ? '\u2003' : this.expanded ? '⏷' : '⏵';
			},
			valueText() {
				let r = this.root;
				if (r.isObject) {
					if (!r.value) return "null";
					return r.value.constructor.name; // "Object";
				}
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
				return getProps(this.root.value, !this.useSpec);
			}
		}
	};


	const browserTemplate = `
	<ul class="a2-json-b">
		<a2-json-browser-item v-for="(itm, ix) in items" :key=ix :root="itm" :use-spec="useSpec"/>
	</ul>
	`;

	Vue.component('a2-json-browser', {
		template: browserTemplate,
		components: {
			'a2-json-browser-item': jsonTreeItem
		},
		props: {
			root: Object,
			useSpec: Boolean
		},
		data() {
			return {
				expandFlag: false
			};
		},
		computed: {
			items() {
				return getProps(this.root, !this.useSpec);
			}
		},
		methods: {
			expandAll() {
				this.expandFlag = !this.expandFlag;
				for (let c of this.$children)
					c.expandAll(this.expandFlag);
			},
			clearExpanded() {
				this.expandFlag = false;
				for (let c of this.$children)
					c.clearExpanded();
			}
		}
	});
})();
