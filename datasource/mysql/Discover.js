'use strict';

class discoverModel {
  constructor(wclient,rclient) {
    this.wclient=wclient;
    this.rclient=rclient;
    this.displayTable = 'discover_display';
  }
  save (discoverDisplay) {
    return this.wclient(this.displayTable).insert(discoverDisplay).then(result => {
      discoverDisplay.id = result[0];
      return discoverDisplay;
    });
  }
  delById (id) {
    return this.wclient(this.displayTable).where({id: id}).update({isdel: 1});
  }
  updateById (updateDiscover, id) {
    return this.wclient(this.displayTable).where({id}).update(updateDiscover);
  }
  findById (id) {
    return this.rclient(this.displayTable).select().where({id}).limit(1)
      .then(result => {
        if (result && result.length === 1) return result[0];
        else return null;
      });
  }
  listBySid (sid) {
    return this.find({where: {sid, isdel: 0}, order: 'score asc'});
  }
  find ({fields, where, order, limit, skip}) {
    let query = this.rclient(this.displayTable).select();
    if (fields) query = query.column(fields);
    if (where) query = query.where(where);
    if (order) query = query.orderByRaw(order);
    if (limit) query = query.limit(limit);
    if (skip) query = query.offset(skip);
    return query;
  }
}

module.exports = discoverModel;
