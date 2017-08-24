



const root = {
    Customers: [
        { Id: 5, Name: "First" },
        { Id: 6, Name: "Second" },
        {
            Id: 7, Name: "Third", Subs: [
                { X: 5 },
                { X: 6 },
                { X: 8 }
            ]
        },
        {
            Id: 8, Name: "Fourth", Subs: [
                { X: 11 },
                { X: 12 },
                { X: 13}
            ]
        }
    ],
    Element: {
        Tag: "Tag For Element"
    },
    Scalar: "I am the scalar"
};

function* enumData(root, path, name) {
    if (!path) {
        // scalar value in root
        yield { item: root, val: root[name]};
        return;
    }
    let sp = path.split('.');
    let currentData = root;
    for (let i = 0; i < sp.length; i++) {
        let last = i === sp.length - 1;
        let prop = sp[i];
        if (prop.endsWith('[]')) {
            // is array
            let pname = prop.substring(0, prop.length - 2);
            let objto = root[pname];
            if (!objto)
                continue;
            for (let j = 0; j < objto.length; j++) {
                let arrItem = objto[j];
                if (last)
                    yield { item: arrItem, val: arrItem[name]};
                else {
                    let newpath = sp.slice(1).join('.');
                    for (var y of enumData(arrItem, newpath, name))
                        yield { item: y.item, val: y.val};
                }
            }
        } else {
            // simple element
            let objto = root[prop];
            if (objto) {
                yield { item: root[prop], val: objto[name]};
            }
        }
    }
}

for (v of enumData(root, "Element", "Tag")) {
    console.warn(v);
}

for (v of enumData(root, "", "Scalar")) {
    console.warn(v);
}

for (v of enumData(root, "Customers[]", "Name")) {
    console.warn(v);

}

for (v of enumData(root, "Customers[].Subs[]", "X")) {
    console.warn(v);
}


