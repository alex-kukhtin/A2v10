// Copyright © 2020-2021 Alex Kukhtin. All rights reserved.

/*20210409-7762*/
/* controllers/navbar.js */

(function () {

	const locale = window.$$locale;
	const menu = component('std:navmenu');
	const eventBus = require('std:eventBus');
	const period = require('std:period');
	const store = component('std:store');
	const urlTools = require('std:url');
	const http = require('std:http');

	// a2-nav-bar
	const a2NavBar = {
		template: `
<ul class="nav-bar">
	<li v-for="(item, index) in menu" :key="index" :class="{active : isActive(item)}">
		<a :href="itemHref(item)" tabindex="-1" v-text="item.Name" @click.prevent="navigate(item)"></a>
	</li>
	<li class="aligner"/>
	<div class="nav-global-period" v-if="hasPeriod">
		<a2-period-picker class="drop-bottom-right pp-hyperlink pp-navbar" 
			display="namedate" :callback="periodChanged" prop="period" :item="that"/>
	</div>
	<li v-if="hasHelp()" :title="locale.$Help"><a :href="helpHref()" class="btn-help" rel="help" aria-label="Help" @click.prevent="showHelp()"><i class="ico ico-help"></i></a></li>
</ul>
`,
		props: {
			menu: Array,
			period: period.constructor,
			isNavbarMenu: Boolean
		},
		computed: {
			seg0: () => store.getters.seg0,
			seg1: () => store.getters.seg1,
			locale() { return locale; },
			hasPeriod() { return !!this.period; },
			that() { return this; }
		},
		methods: {
			isActive(item) {
				return this.seg0 === item.Url;
			},
			isActive2(item) {
				return this.seg1 === item.Url;
			},
			itemHref: (item) => '/' + item.Url,
			navigate(item) {
				if (this.isActive(item))
					return;
				let storageKey = 'menu:' + urlTools.combine(window.$$rootUrl, item.Url);
				let savedUrl = localStorage.getItem(storageKey) || '';
				if (savedUrl && !menu.findMenu(item.Menu, (mi) => mi.Url === savedUrl)) {
					// saved segment not found in current menu
					savedUrl = '';
				}
				let opts = { title: null, seg2: savedUrl };
				let url = menu.makeMenuUrl(this.menu, item.Url, opts);
				this.$store.commit('navigate', { url: url, title: opts.title });
			},
			showHelp() {
				window.open(this.helpHref(), "_blank");
			},
			_findHelp() {
				if (!this.menu) return null;
				let am = this.menu.find(x => this.isActive(x));
				if (am && am.Menu) {
					let am2 = am.Menu.find(x => this.isActive2(x));
					if (am2 && am2.Help)
						return am2.Help;
				}
				return am ? am.Help : null;
			},
			helpHref() {
				let helpUrl = this._findHelp() || '';
				return urlTools.helpHref(helpUrl);
			},
			hasHelp() {
				return !!this._findHelp();
			},
			periodChanged(period) {
				// post to shell
				http.post('/_application/setperiod', period.toJson())
					.then(() => {
						eventBus.$emit('globalPeriodChanged', period);
					})
					.catch((err) => {
						alert(err);
					});
			}
		}
	};

	// a2-nav-bar-page
	const a2NavBarPage = {
		template: `
<div class="menu-navbar-overlay" @click.stop=closeNavMenu>
<div class="menu-navbar" :class="{show:visible}">
<div class="menu-navbar-top">
	<a href='' class=menu-navbar-back @click.stop.prevent=closeNavMenu><i class="ico ico-grid2"></i></a>
	<h2 v-text=title></h2>
</div>
<ul class=menu-navbar-list>
	<li v-for="(item, index) in menu" :key=index>
		<a class="menu-navbar-link" :href="itemHref(item)" @click.prevent="navigate(item)" :class="{active : isActive(item)}">
			<i class="ico" :class=icoClass(item)></i>
			<span v-text="item.Name"></span>
		</a>
	</li>
</ul>
<div class="aligner"/>
<a class=powered-by-a2v10 href="https://a2v10.com" rel=noopener target=_blank><i class="ico ico-a2logo"></i> Powered by A2v10</a>
</div></div>
`,
		props: {
			menu: Array,
			isNavbarMenu: Boolean,
			title:String
		},
		data() {
			return {
				visible: false
			};
		},
		computed: {
			seg0: () => store.getters.seg0,
			seg1: () => store.getters.seg1,
			locale() { return locale; },
			that() { return this; }
		},
		methods: {
			isActive(item) {
				return this.seg0 === item.Url;
			},
			isActive2(item) {
				return this.seg1 === item.Url;
			},
			itemHref: (item) => '/' + item.Url,
			icoClass(item) {
				return item.Icon ? 'ico-' + item.Icon : 'ico-empty';
			},
			navigate(item) {
				if (this.isActive(item))
					return;
				this.closeNavMenu();
				let storageKey = 'menu:' + urlTools.combine(window.$$rootUrl, item.Url);
				let savedUrl = localStorage.getItem(storageKey) || '';
				if (savedUrl && !menu.findMenu(item.Menu, (mi) => mi.Url === savedUrl)) {
					// saved segment not found in current menu
					savedUrl = '';
				}
				let opts = { title: null, seg2: savedUrl };
				let url = menu.makeMenuUrl(this.menu, item.Url, opts);
				this.$store.commit('navigate', { url: url, title: opts.title });
			},
			closeNavMenu() {
				this.visible = false;
				eventBus.$emit('clickNavMenu', false);
			}
		},
		mounted() {
			setTimeout(() => {
				this.visible = true;
			}, 5);
		}
	};

	app.components['std:navbar'] = {
		standardNavBar: a2NavBar,
		pageNavBar: a2NavBarPage
	};
})();	