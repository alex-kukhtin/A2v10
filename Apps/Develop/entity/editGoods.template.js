/**
 * edit good
 */


const template = {
    events: {
        "Model.load": modelLoad
    },
    validators: {
        "Entity.Name": 'Введите наименование',
        "Entity.Article":
        { valid: duplicateArticle, async: true, msg: "Товар с таким артикулом уже существует" }
    }
};

function modelLoad(root) {
    const ent = root.Entity;
    if (ent.$isNew)
        entityCreate(ent);
}

function entityCreate(ent) {
    ent.Kind = 'Goods';
}

function duplicateArticle(entity, article) {
    var vm = entity.$vm;
    if (!entity.Article)
        return true;
    return vm.$asyncValid('duplicateArticle', { Article: entity.Article, Id: entity.Id });
}

module.exports = template;