/*customer index template*/


/*
const template = {
	properties: {
		"TDataArray.$CrossSpan"() {
			return this.$cross.Cross1.length * 2 + 1;
		},
		'TDataArray.$CrossTotal'() {
			return this.$cross.Cross1.reduce((prevArray, currKey, currIndex) => {
				prevArray.push({ Val: this.reduce((prevTotal, currElem) => prevTotal + currElem.Cross1[currIndex].Val, 0) });
				return prevArray;
			}, []);
		},
		'TDataArray.$GrandTotal'() {
			return this.$CrossTotal.reduce((p, c) => p + c.Val, 0);
		},
		"TData.$CrossTotal"() {
			return this.Cross1.reduce((p, c) => p + c.Val, 0);
		}
	},
	commands: {
	},
	events: {
		"Model.load":modelLoad
	}
};
*/

const template = {
	properties: {
		/* свойства для всего массива */

		/* объединяемые колонки */
		'TDataArray.$Cross1Span'() { return this.$cross.Cross1.length + 1; },
		/* итоговое значение по элементам */
		'TDataArray.$Cross1Total'() {
			/* массив с общими суммами по строкам */
			return this.$cross.Cross1.reduce((prevArray, currKey, currIndex) => {
				prevArray.push({ Val: this.reduce((prevTotal, currElem) => prevTotal + currElem.Cross1[currIndex].Val, 0) });
				return prevArray;
			}, []);
		},
		/* итоговое значение Cross1 по всем строкам */
		'TDataArray.$GrandTotal'() {
			return this.$Cross1Total.reduce((p, c) => p + c.Val, 0);
		},

		/* свойства для каждого элемента массива */
		/* итоговое значение Cross1 по строке */
		'TData.$Cross1Total'() { return this.Cross1.reduce((p, c) => p + c.Val, 0); },
		'TData.$Mark'() { return 'green'; }
	}
}



function modelLoad() {
	console.dir(this.RepData);
}

module.exports = template;

