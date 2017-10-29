function template(vm, host) {

	init();

	return {
        properties: {
			"TEntity.Price": getEntityPrice,
			"TEntity.$HasPrices": function () {
			    return this.Prices && this.Prices.length > 0;
			}
		},
        events: {
            "Model.load": modelLoad,
		    "Entities.load": onload,
		    "Entities[].Qty.change": qtyChange
	    }
        //commands: {
        //	"addSelected": addSelected,
        //}
    };

    function modelLoad(root, caller) {
        console.dir(caller);
    }

	function onload() {
		//alert(vm.$caller.Document.Contract.PriceKind.Id);
		vm.$currentPriceKindId = vm.$caller.Document.Contract.PriceKind.Id;
	}

	function qtyChange(ent) {
	    var i, row;
	    var pos = -1;
	    var trg = vm.$caller.Document.Rows;
	    // находим объект учёта в документе
	    for (i = 0; i < trg.length; i++) {
	        if (trg[i].Entity.Id == ent.Id) {
	            pos = i;
	            break;
	        }
	    }
	    if (ent.Qty > 0) {
            // добавляем в документ
	        if (pos >= 0) {
	            // Такой объект учёта уже есть в документе
	            row = trg[pos];
	        } else {
	            // Такого объекта учёта нет - добавляем
	            row = trg.$append();
	            row.Entity = ent;
	            row.FUnits = ent.FUnits;
	            rowsAdded(trg, row);
            }
	        row.BasePrice = ent.Price;
	        row.Qty = ent.Qty;
	        if (!ent.Warehouse.$isEmpty) {
	            row.Warehouse = ent.Warehouse;
	        }
	    } else {
	        // удаляем из документа
	        if (pos >= 0) {
	            row = trg[pos];
	            vm.$remove(row);
	        }
	    }
	}

	function rowsAdded(array, row) {
	    var ix = array.indexOf(row);
	    if (ix === 0)
	        return;
	    /* наследуем значения из предыдущей строки */
	    var prevRow = array[ix - 1];
	    row.DeliveryOn = prevRow.DeliveryOn;
	    if (row.Warehouse.$isEmpty && !prevRow.Warehouse.$isEmpty)
	        row.Warehouse = prevRow.Warehouse;
	}

	function init() {
		//vm.$canAddSelected = function () {
		//	return vm.Entities.some(function (ent) {
		//		return ent.Qty ? true : false;
		//	});
		//};
		vm.$query.InStockOnly = false;    //по умолчанию показываем все товары, а не только имеющиеся на остатке
	}

	//function addSelected() {
	//	/* сначала выберем все с ненулевым количеством */
	//	var trg = vm.$caller.Document.Rows;
	//	vm.Entities.filter(function (ent) {
	//		return !!ent.Qty;
	//	}).forEach(function (ent) {
	//		row = trg.$append();
	//		row.BasePrice = ent.Price;
	//		row.Qty = ent.Qty;
	//		row.Entity = ent;
	//		row.FUnits = ent.FUnits;
	//		row.Warehouse = ent.Warehouse;
	//		ent.Qty = 0; /*сбросим выбранное кол-во*/
	//	});
	//}

	function getEntityPrice() {
	    var ent = this;
		if (!ent.Prices.length)
			return undefined;
		if (!ent.Prices.$selected) {
			var currPrice = null;
			ent.Prices.forEach(function (val) {
				if (val.PriceKind.Id === vm.$currentPriceKindId)
					currPrice = val;
			});
			vm.$select(currPrice ? currPrice : ent.Prices[0]);
		}
		return ent.Prices.$selected.Price;
	}
}
