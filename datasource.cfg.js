'use strict';
const Redis = require('ioredis');
const knex = require('knex');
const config = require("./util").config;
var Model = require('./lib/Model');
// const _kueJob = require('./lib/job/kueJob');
var obj = new Model();
obj.set("config",config);

if(process.env.NODE_ENV=="development") {
  var mysqlMaster = knex({
    "client": "mysql",
    "connection": config.mysql.master,
    pool: {min: 1, max: 10},
    acquireConnectionTimeout: 1000 * 60 * 5
  });
  var mysqlSalve = knex({
    "client": "mysql",
    "connection": config.mysql.salve,
    pool: {min: 1, max: 10},
    acquireConnectionTimeout: 1000 * 60 * 5
  });

  if (config.redis.enableProxy) {
    var redisMaster = new Redis({
      port: config.redis.proxy.master.port,
      host: config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 0
    });
    var redisSalve = Redis({
      port: config.redis.proxy.salve.port,
      host: config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 0
    });

    // 商品
    var redisShopProductMaster = new Redis({
      port: config.redis.proxy.master.port,
      host: config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 1
    });
    var redisShopProductSalve = new Redis({
      port: config.redis.proxy.salve.port,
      host: config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 1
    });

    // 钱包
    var redisWalletModelMaster = new Redis({
      port: config.redis.proxy.master.port,
      host: config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 2
    });
    var redisWalletModelSalve = new Redis({
      port: config.redis.proxy.salve.port,
      host: config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 2
    });

    // 订单
    var redisOrdersModelMaster = new Redis({
      port: config.redis.proxy.master.port,
      host: config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 3
    });
    var redisOrdersModelSalve = new Redis({
      port: config.redis.proxy.salve.port,
      host: config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 3
    });

    //经验值和签到
    var redisUserExpModelMaster = new Redis({
      port: config.redis.proxy.master.port,
      host: config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 4
    });
    var redisUserExpModelSalve = new Redis({
      port: config.redis.proxy.salve.port,
      host: config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 4
    });

    // 定时任务
    var redisScheduleModelMaster = new Redis({
      port: config.redis.proxy.master.port,
      host: config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 13
    });
    var redisScheduleModelSalve = new Redis({
      port: config.redis.proxy.salve.port,
      host: config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 13
    });

    // 消息队列
    // var kue = new _kueJob({
    //   debug: false, retry: 6, ttl: 1000 * 60 * 60, enableUI: true,
    //   redis_port: config.redis.master.port,
    //   redis_host: config.redis.master.host,
    //   redis_family: 4,
    //   redis_password: config.redis.master.password, redis_db: 14
    // });

    // 发布订阅
    // var redisPublish = new Redis({
    //   port:config.redis.proxy.master.port,
    //   host:config.redis.proxy.master.host,
    //   family: 4,
    //   password: config.redis.proxy.master.password,
    //   db: 15
    // });
    // var redisSubscribe = new Redis({
    //   port:config.redis.proxy.salve.port,
    //   host:config.redis.proxy.salve.host,
    //   family: 4,
    //   password: config.redis.proxy.salve.password,
    //   db: 15
    // });

    // obj.set("kue", kue);
    obj.set("config", config);
    obj.set("redisMaster", redisMaster);
    obj.set("redisSalve", redisSalve);
    obj.set("mysqlMaster", mysqlMaster);
    obj.set("mysqlSalve", mysqlSalve);

    obj.set("redisShopProductMaster", redisShopProductMaster);
    obj.set("redisShopProductSalve", redisShopProductSalve);

    obj.set("redisOrdersModelMaster", redisOrdersModelMaster);
    obj.set("redisOrdersModelSalve", redisOrdersModelSalve);

    obj.set("redisWalletModelMaster", redisWalletModelMaster);
    obj.set("redisWalletModelSalve", redisWalletModelSalve);

    obj.set("redisUserExpModelMaster", redisUserExpModelMaster);
    obj.set("redisUserExpModelSalve", redisUserExpModelSalve);

    // obj.set("redisPublish",redisPublish);
    // obj.set("redisSubscribe",redisSubscribe);

    obj.set("redisScheduleModelMaster", redisScheduleModelMaster);
    obj.set("redisScheduleModelSalve", redisScheduleModelSalve);
  } else {
    var redisMaster = new Redis({
      port: config.redis.master.port,          // Redis port
      host: config.redis.master.host,   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.master.password,
      db: 0
    });
    var redisSalve = new Redis({
      port: config.redis.salve.port,          // Redis port
      host: config.redis.salve.host,   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.salve.password,
      db: 0
    });

    // 商品
    var redisShopProductMaster = new Redis({
      port: config.redis.master.port,          // Redis port
      host: config.redis.master.host,   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.master.password,
      db: 1
    });
    var redisShopProductSalve = new Redis({
      port: config.redis.salve.port,          // Redis port
      host: config.redis.salve.host,   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.salve.password,
      db: 1
    });

    // 钱包
    var redisWalletModelMaster = new Redis({
      port: config.redis.master.port,          // Redis port
      host: config.redis.master.host,   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.master.password,
      db: 2
    });
    var redisWalletModelSalve = new Redis({
      port: config.redis.salve.port,          // Redis port
      host: config.redis.salve.host,   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.salve.password,
      db: 2
    });

    // 订单
    var redisOrdersModelMaster = new Redis({
      port: config.redis.master.port,          // Redis port
      host: config.redis.master.host,   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.master.password,
      db: 3
    });
    var redisOrdersModelSalve = new Redis({
      port: config.redis.salve.port,          // Redis port
      host: config.redis.salve.host,   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.salve.password,
      db: 3
    });

    //经验值和签到
    var redisUserExpModelMaster = new Redis({
      port: config.redis.master.port,          // Redis port
      host: config.redis.master.host,   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.master.password,
      db: 4
    });
    var redisUserExpModelSalve = new Redis({
      port: config.redis.salve.port,          // Redis port
      host: config.redis.salve.host,   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.salve.password,
      db: 4
    });

    // 定时任务
    var redisScheduleModelMaster = new Redis({
      port: config.redis.master.port,          // Redis port
      host: config.redis.master.host,   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.master.password,
      db: 13
    });
    var redisScheduleModelSalve = new Redis({
      port: config.redis.salve.port,          // Redis port
      host: config.redis.salve.host,   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.salve.password,
      db: 13
    });

    // 消息队列
    // var kue = new _kueJob({
    //   debug: false,
    //   retry: 6,
    //   ttl: 1000 * 60 * 60,
    //   enableUI: true,
    //   redis_port: config.redis.master.port,
    //   redis_host: config.redis.master.host,
    //   redis_family: 4,
    //   redis_password: config.redis.master.password,
    //   redis_db: 10
    // });

    // 发布订阅
    var redisPublish = new Redis({
      port: config.redis.master.port,          // Redis port
      host: config.redis.master.host,   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.master.password,
      db: 15
    });
    var redisSubscribe = new Redis({
      port: config.redis.salve.port,          // Redis port
      host: config.redis.salve.host,   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.salve.password,
      db: 15
    });

    obj.set("redisMaster", redisMaster);
    obj.set("redisSalve", redisSalve);
    obj.set("mysqlMaster", mysqlMaster);
    obj.set("mysqlSalve", mysqlSalve);

    obj.set("redisShopProductMaster", redisShopProductMaster);
    obj.set("redisShopProductSalve", redisShopProductSalve);

    obj.set("redisOrdersModelMaster", redisOrdersModelMaster);
    obj.set("redisOrdersModelSalve", redisOrdersModelSalve);

    obj.set("redisWalletModelMaster", redisWalletModelMaster);
    obj.set("redisWalletModelSalve", redisWalletModelSalve);

    obj.set("redisUserExpModelMaster", redisUserExpModelMaster);
    obj.set("redisUserExpModelSalve", redisUserExpModelSalve);

    obj.set("redisPublish", redisPublish);
    obj.set("redisSubscribe", redisSubscribe);

    // obj.set("kue", kue);

    obj.set("redisScheduleModelMaster", redisScheduleModelMaster);
    obj.set("redisScheduleModelSalve", redisScheduleModelSalve);
  }
}

if(process.env.NODE_ENV=="production"){
  var mysqlMaster=knex({"client":"mysql","connection":config.mysql.master,pool:{min:1,max:10},acquireConnectionTimeout: 1000*60*5});
  var mysqlSalve=knex({"client":"mysql","connection":config.mysql.salve,pool:{min:1,max:10},acquireConnectionTimeout: 1000*60*5});
  if(config.redis.enableProxy) {
    var redisMaster=new Redis({
      port:config.redis.proxy.master.port,
      host:config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 0
    });
    var redisSalve=Redis({
      port:config.redis.proxy.salve.port,
      host:config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 0
    });

    // 商品
    var redisShopProductMaster=new Redis({
      port:config.redis.proxy.master.port,
      host:config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 1
    });
    var redisShopProductSalve=new Redis({
      port:config.redis.proxy.salve.port,
      host:config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 1
    });

    // 钱包
    var redisWalletModelMaster=new Redis({
      port:config.redis.proxy.master.port,
      host:config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 2
    });
    var redisWalletModelSalve=new Redis({
      port:config.redis.proxy.salve.port,
      host:config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 2
    });

    // 订单
    var redisOrdersModelMaster=new Redis({
      port:config.redis.proxy.master.port,
      host:config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 3
    });
    var redisOrdersModelSalve=new Redis({
      port:config.redis.proxy.salve.port,
      host:config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 3
    });

    //经验值和签到
    var redisUserExpModelMaster = new Redis({
      port:config.redis.proxy.master.port,
      host:config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 4
    });
    var redisUserExpModelSalve=new Redis({
      port:config.redis.proxy.salve.port,
      host:config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 4
    });

    // 定时任务
    var redisScheduleModelMaster = new Redis({
      port:config.redis.proxy.master.port,
      host:config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 13
    });
    var redisScheduleModelSalve = new Redis({
      port:config.redis.proxy.salve.port,
      host:config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 13
    });

    // 消息队列
    // var kue = new _kueJob({debug:false,retry:6,ttl:1000 * 60 * 60,enableUI:true,
    //   redis_sentinels:config.redis.master.sentinels,
    //   redis_name:config.redis.master.name,
    //   redis_family:4,
    //   redis_password:config.redis.master.password,redis_db:14
    // });

    // 发布订阅
    // var redisPublish = new Redis({
    //   port:config.redis.proxy.master.port,
    //   host:config.redis.proxy.master.host,
    //   family: 4,
    //   password: config.redis.proxy.master.password,
    //   db: 15
    // });
    // var redisSubscribe = new Redis({
    //   port:config.redis.proxy.salve.port,
    //   host:config.redis.proxy.salve.host,
    //   family: 4,
    //   password: config.redis.proxy.salve.password,
    //   db: 15
    // });

    // obj.set("kue",kue);
    obj.set("config",config);
    obj.set("redisMaster",redisMaster);
    obj.set("redisSalve",redisSalve);
    obj.set("mysqlMaster",mysqlMaster);
    obj.set("mysqlSalve",mysqlSalve);

    obj.set("redisShopProductMaster",redisShopProductMaster);
    obj.set("redisShopProductSalve",redisShopProductSalve);

    obj.set("redisOrdersModelMaster",redisOrdersModelMaster);
    obj.set("redisOrdersModelSalve",redisOrdersModelSalve);

    obj.set("redisWalletModelMaster",redisWalletModelMaster);
    obj.set("redisWalletModelSalve",redisWalletModelSalve);

    obj.set("redisUserExpModelMaster",redisUserExpModelMaster);
    obj.set("redisUserExpModelSalve",redisUserExpModelSalve);

    // obj.set("redisPublish",redisPublish);
    // obj.set("redisSubscribe",redisSubscribe);

    obj.set("redisScheduleModelMaster",redisScheduleModelMaster);
    obj.set("redisScheduleModelSalve",redisScheduleModelSalve);
  }else {
    var redisMaster=new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,
      password: config.redis.master.password,
      db: 0
    });

    var redisSalve=new Redis({
      // port: config.redis.salve.port,          // Redis port
      // host: config.redis.salve.host,   // Redis host
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      role: 'slave',
      password: config.redis.salve.password,
      preferredSlaves: function (availableSlaves) {
        for (var i = 0; i < availableSlaves.length; i++) {
          const slave = availableSlaves[i];
          if(Ips.filter(ip=>{
              if(slave.ip === ip) return true;
              else  return false;
            }).length>0)
            return slave;
        }
        // if no preferred slaves are available a random one is used
        return false;
      },
      db: 0
    });

    // 商品
    var redisShopProductMaster=new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,
      password: config.redis.master.password,
      db: 1
    });
    var redisShopProductSalve=new Redis({
      // port: config.redis.salve.port,          // Redis port
      // host: config.redis.salve.host,   // Redis host
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      role: 'slave',
      password: config.redis.salve.password,
      preferredSlaves: function (availableSlaves) {
        for (var i = 0; i < availableSlaves.length; i++) {
          const slave = availableSlaves[i];
          if(Ips.filter(ip=>{
              if(slave.ip === ip) return true;
              else  return false;
            }).length>0)
            return slave;
        }
        // if no preferred slaves are available a random one is used
        return false;
      },
      db: 1
    });

    // 钱包
    var redisWalletModelMaster=new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.master.password,
      db: 2
    });
    var redisWalletModelSalve=new Redis({
      // port: config.redis.salve.port,          // Redis port
      // host: config.redis.salve.host,   // Redis host
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      role: 'slave',
      password: config.redis.salve.password,
      preferredSlaves: function (availableSlaves) {
        for (var i = 0; i < availableSlaves.length; i++) {
          const slave = availableSlaves[i];
          if(Ips.filter(ip=>{
              if(slave.ip === ip) return true;
              else  return false;
            }).length>0)
            return slave;
        }
        // if no preferred slaves are available a random one is used
        return false;
      },
      db: 2
    });

    // 订单
    var redisOrdersModelMaster=new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.master.password,
      db: 3
    });
    var redisOrdersModelSalve=new Redis({
      // port: config.redis.salve.port,          // Redis port
      // host: config.redis.salve.host,   // Redis host
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      role: 'slave',
      password: config.redis.salve.password,
      preferredSlaves: function (availableSlaves) {
        for (var i = 0; i < availableSlaves.length; i++) {
          const slave = availableSlaves[i];
          if(Ips.filter(ip=>{
              if(slave.ip === ip) return true;
              else  return false;
            }).length>0)
            return slave;
        }
        // if no preferred slaves are available a random one is used
        return false;
      },
      db: 3
    });

    //经验值和签到
    var redisUserExpModelMaster = new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.master.password,
      db: 4
    });
    var redisUserExpModelSalve=new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      role: 'slave',
      password: config.redis.salve.password,
      preferredSlaves: function (availableSlaves) {
        for (var i = 0; i < availableSlaves.length; i++) {
          const slave = availableSlaves[i];
          if(Ips.filter(ip=>{
              if(slave.ip === ip) return true;
              else  return false;
            }).length>0)
            return slave;
        }
        // if no preferred slaves are available a random one is used
        return false;
      },
      db: 4
    });

    // 定时任务
    var redisScheduleModelMaster = new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.master.password,
      db: 13
    });
    var redisScheduleModelSalve = new Redis({
      // port: config.redis.salve.port,          // Redis port
      // host: config.redis.salve.host,   // Redis host
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      role: 'slave',
      password: config.redis.salve.password,
      preferredSlaves: function (availableSlaves) {
        for (var i = 0; i < availableSlaves.length; i++) {
          const slave = availableSlaves[i];
          if(Ips.filter(ip=>{
              if(slave.ip === ip) return true;
              else  return false;
            }).length>0)
            return slave;
        }
        // if no preferred slaves are available a random one is used
        return false;
      },
      db: 13
    });

    // 消息队列
    // var kue = new _kueJob({debug:false,retry:6,ttl:1000 * 60 * 60,enableUI:true,
    //   redis_sentinels:config.redis.master.sentinels,
    //   redis_name:config.redis.master.name,
    //   redis_family:4,
    //   redis_password:config.redis.master.password,redis_db:14
    // });

    // 发布订阅
    var redisPublish = new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,
      password: config.redis.master.password,
      db: 15
    });
    var redisSubscribe = new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      role: 'slave',
      password: config.redis.salve.password,
      preferredSlaves: function (availableSlaves) {
        for (var i = 0; i < availableSlaves.length; i++) {
          const slave = availableSlaves[i];
          if(Ips.filter(ip=>{
              if(slave.ip === ip) return true;
              else   return false;
            }).length>0)
            return slave;
        }
        // if no preferred slaves are available a random one is used
        return false;
      },
      db: 15
    });

    // obj.set("kue",kue);
    obj.set("config",config);
    obj.set("redisMaster",redisMaster);
    obj.set("redisSalve",redisSalve);
    obj.set("mysqlMaster",mysqlMaster);
    obj.set("mysqlSalve",mysqlSalve);

    obj.set("redisShopProductMaster",redisShopProductMaster);
    obj.set("redisShopProductSalve",redisShopProductSalve);

    obj.set("redisOrdersModelMaster",redisOrdersModelMaster);
    obj.set("redisOrdersModelSalve",redisOrdersModelSalve);

    obj.set("redisWalletModelMaster",redisWalletModelMaster);
    obj.set("redisWalletModelSalve",redisWalletModelSalve);

    obj.set("redisUserExpModelMaster",redisUserExpModelMaster);
    obj.set("redisUserExpModelSalve",redisUserExpModelSalve);

    obj.set("redisPublish",redisPublish);
    obj.set("redisSubscribe",redisSubscribe);

    obj.set("redisScheduleModelMaster",redisScheduleModelMaster);
    obj.set("redisScheduleModelSalve",redisScheduleModelSalve);
  }
}

if(process.env.NODE_ENV=="staging"){
  var mysqlMaster=knex({"client":"mysql","connection":config.mysql.master,pool:{min:1,max:10},acquireConnectionTimeout: 1000*60*5});
  var mysqlSalve=knex({"client":"mysql","connection":config.mysql.salve,pool:{min:1,max:10},acquireConnectionTimeout: 1000*60*5});
  if(config.redis.enableProxy) {
    var redisMaster=new Redis({
      port:config.redis.proxy.master.port,
      host:config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 0
    });
    var redisSalve=Redis({
      port:config.redis.proxy.salve.port,
      host:config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 0
    });

    // 商品
    var redisShopProductMaster=new Redis({
      port:config.redis.proxy.master.port,
      host:config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 1
    });
    var redisShopProductSalve=new Redis({
      port:config.redis.proxy.salve.port,
      host:config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 1
    });

    // 钱包
    var redisWalletModelMaster=new Redis({
      port:config.redis.proxy.master.port,
      host:config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 2
    });
    var redisWalletModelSalve=new Redis({
      port:config.redis.proxy.salve.port,
      host:config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 2
    });

    // 订单
    var redisOrdersModelMaster=new Redis({
      port:config.redis.proxy.master.port,
      host:config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 3
    });
    var redisOrdersModelSalve=new Redis({
      port:config.redis.proxy.salve.port,
      host:config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 3
    });

    //经验值和签到
    var redisUserExpModelMaster = new Redis({
      port:config.redis.proxy.master.port,
      host:config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 4
    });
    var redisUserExpModelSalve=new Redis({
      port:config.redis.proxy.salve.port,
      host:config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 4
    });

    // 定时任务
    var redisScheduleModelMaster = new Redis({
      port:config.redis.proxy.master.port,
      host:config.redis.proxy.master.host,
      family: 4,
      password: config.redis.proxy.master.password,
      db: 13
    });
    var redisScheduleModelSalve = new Redis({
      port:config.redis.proxy.salve.port,
      host:config.redis.proxy.salve.host,
      family: 4,
      password: config.redis.proxy.salve.password,
      db: 13
    });

    // 消息队列
    // var kue = new _kueJob({debug:false,retry:6,ttl:1000 * 60 * 60,enableUI:true,
    //   redis_sentinels:config.redis.master.sentinels,
    //   redis_name:config.redis.master.name,
    //   redis_family:4,
    //   redis_password:config.redis.master.password,redis_db:14
    // });

    // 发布订阅
    // var redisPublish = new Redis({
    //   port:config.redis.proxy.master.port,
    //   host:config.redis.proxy.master.host,
    //   family: 4,
    //   password: config.redis.proxy.master.password,
    //   db: 15
    // });
    // var redisSubscribe = new Redis({
    //   port:config.redis.proxy.salve.port,
    //   host:config.redis.proxy.salve.host,
    //   family: 4,
    //   password: config.redis.proxy.salve.password,
    //   db: 15
    // });

    // obj.set("kue",kue);
    obj.set("config",config);
    obj.set("redisMaster",redisMaster);
    obj.set("redisSalve",redisSalve);
    obj.set("mysqlMaster",mysqlMaster);
    obj.set("mysqlSalve",mysqlSalve);

    obj.set("redisShopProductMaster",redisShopProductMaster);
    obj.set("redisShopProductSalve",redisShopProductSalve);

    obj.set("redisOrdersModelMaster",redisOrdersModelMaster);
    obj.set("redisOrdersModelSalve",redisOrdersModelSalve);

    obj.set("redisWalletModelMaster",redisWalletModelMaster);
    obj.set("redisWalletModelSalve",redisWalletModelSalve);

    obj.set("redisUserExpModelMaster",redisUserExpModelMaster);
    obj.set("redisUserExpModelSalve",redisUserExpModelSalve);

    // obj.set("redisPublish",redisPublish);
    // obj.set("redisSubscribe",redisSubscribe);

    obj.set("redisScheduleModelMaster",redisScheduleModelMaster);
    obj.set("redisScheduleModelSalve",redisScheduleModelSalve);
  }else {
    var redisMaster=new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,
      password: config.redis.master.password,
      db: 0
    });

    var redisSalve=new Redis({
      // port: config.redis.salve.port,          // Redis port
      // host: config.redis.salve.host,   // Redis host
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      role: 'slave',
      password: config.redis.salve.password,
      preferredSlaves: function (availableSlaves) {
        for (var i = 0; i < availableSlaves.length; i++) {
          const slave = availableSlaves[i];
          if(Ips.filter(ip=>{
              if(slave.ip === ip) return true;
              else  return false;
            }).length>0)
            return slave;
        }
        // if no preferred slaves are available a random one is used
        return false;
      },
      db: 0
    });

    // 商品
    var redisShopProductMaster=new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,
      password: config.redis.master.password,
      db: 1
    });
    var redisShopProductSalve=new Redis({
      // port: config.redis.salve.port,          // Redis port
      // host: config.redis.salve.host,   // Redis host
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      role: 'slave',
      password: config.redis.salve.password,
      preferredSlaves: function (availableSlaves) {
        for (var i = 0; i < availableSlaves.length; i++) {
          const slave = availableSlaves[i];
          if(Ips.filter(ip=>{
              if(slave.ip === ip) return true;
              else  return false;
            }).length>0)
            return slave;
        }
        // if no preferred slaves are available a random one is used
        return false;
      },
      db: 1
    });

    // 钱包
    var redisWalletModelMaster=new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.master.password,
      db: 2
    });
    var redisWalletModelSalve=new Redis({
      // port: config.redis.salve.port,          // Redis port
      // host: config.redis.salve.host,   // Redis host
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      role: 'slave',
      password: config.redis.salve.password,
      preferredSlaves: function (availableSlaves) {
        for (var i = 0; i < availableSlaves.length; i++) {
          const slave = availableSlaves[i];
          if(Ips.filter(ip=>{
              if(slave.ip === ip) return true;
              else  return false;
            }).length>0)
            return slave;
        }
        // if no preferred slaves are available a random one is used
        return false;
      },
      db: 2
    });

    // 订单
    var redisOrdersModelMaster=new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.master.password,
      db: 3
    });
    var redisOrdersModelSalve=new Redis({
      // port: config.redis.salve.port,          // Redis port
      // host: config.redis.salve.host,   // Redis host
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      role: 'slave',
      password: config.redis.salve.password,
      preferredSlaves: function (availableSlaves) {
        for (var i = 0; i < availableSlaves.length; i++) {
          const slave = availableSlaves[i];
          if(Ips.filter(ip=>{
              if(slave.ip === ip) return true;
              else  return false;
            }).length>0)
            return slave;
        }
        // if no preferred slaves are available a random one is used
        return false;
      },
      db: 3
    });

    //经验值和签到
    var redisUserExpModelMaster = new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.master.password,
      db: 4
    });
    var redisUserExpModelSalve=new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      role: 'slave',
      password: config.redis.salve.password,
      preferredSlaves: function (availableSlaves) {
        for (var i = 0; i < availableSlaves.length; i++) {
          const slave = availableSlaves[i];
          if(Ips.filter(ip=>{
              if(slave.ip === ip) return true;
              else  return false;
            }).length>0)
            return slave;
        }
        // if no preferred slaves are available a random one is used
        return false;
      },
      db: 4
    });

    // 定时任务
    var redisScheduleModelMaster = new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      password: config.redis.master.password,
      db: 13
    });
    var redisScheduleModelSalve = new Redis({
      // port: config.redis.salve.port,          // Redis port
      // host: config.redis.salve.host,   // Redis host
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      role: 'slave',
      password: config.redis.salve.password,
      preferredSlaves: function (availableSlaves) {
        for (var i = 0; i < availableSlaves.length; i++) {
          const slave = availableSlaves[i];
          if(Ips.filter(ip=>{
              if(slave.ip === ip) return true;
              else  return false;
            }).length>0)
            return slave;
        }
        // if no preferred slaves are available a random one is used
        return false;
      },
      db: 13
    });

    // 消息队列
    // var kue = new _kueJob({debug:false,retry:6,ttl:1000 * 60 * 60,enableUI:true,
    //   redis_sentinels:config.redis.master.sentinels,
    //   redis_name:config.redis.master.name,
    //   redis_family:4,
    //   redis_password:config.redis.master.password,redis_db:14
    // });

    // 发布订阅
    var redisPublish = new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,
      password: config.redis.master.password,
      db: 15
    });
    var redisSubscribe = new Redis({
      sentinels:config.redis.master.sentinels,
      name:config.redis.master.name,
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      role: 'slave',
      password: config.redis.salve.password,
      preferredSlaves: function (availableSlaves) {
        for (var i = 0; i < availableSlaves.length; i++) {
          const slave = availableSlaves[i];
          if(Ips.filter(ip=>{
              if(slave.ip === ip) return true;
              else   return false;
            }).length>0)
            return slave;
        }
        // if no preferred slaves are available a random one is used
        return false;
      },
      db: 15
    });

    // obj.set("kue",kue);
    obj.set("config",config);
    obj.set("redisMaster",redisMaster);
    obj.set("redisSalve",redisSalve);
    obj.set("mysqlMaster",mysqlMaster);
    obj.set("mysqlSalve",mysqlSalve);

    obj.set("redisShopProductMaster",redisShopProductMaster);
    obj.set("redisShopProductSalve",redisShopProductSalve);

    obj.set("redisOrdersModelMaster",redisOrdersModelMaster);
    obj.set("redisOrdersModelSalve",redisOrdersModelSalve);

    obj.set("redisWalletModelMaster",redisWalletModelMaster);
    obj.set("redisWalletModelSalve",redisWalletModelSalve);

    obj.set("redisUserExpModelMaster",redisUserExpModelMaster);
    obj.set("redisUserExpModelSalve",redisUserExpModelSalve);

    obj.set("redisPublish",redisPublish);
    obj.set("redisSubscribe",redisSubscribe);

    obj.set("redisScheduleModelMaster",redisScheduleModelMaster);
    obj.set("redisScheduleModelSalve",redisScheduleModelSalve);
  }
}

module.exports=obj;
