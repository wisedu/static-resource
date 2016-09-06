interface IMetaControl{
  caption: string;
  dataSize: number;
  dataType: string;
  name: string;
  hidden: string;
  url?: string;
  get?:any;
}

interface IMetaModel {
  url: string;
  name: string;
  controls: Array<IMetaControl>;
}

interface IMetaMuiltRow { // 多条记录
  pageNum: number;
  pageSize: number;
  totalCount: number;
  rows: Array<any>;
}

interface IMeta {
  code: number;
  msg: string;
  datas?: any;
  models?: Array<IMetaModel>;
}

/// <reference path="fe_utils.ts" />

/**
 * 机器猫的数据口袋
 */
class DataLoader {
  private root: string;
  private store: IMeta;
  private url_model: string;
  private url: string;
  public total: number;
  constructor(in_pathname: string, metaData:IMeta) {
    //window.location.pathname : in_url = /emap/sys/ggglmk/*default/aaa/jzg_jbxx.do
    var sys_pos = in_pathname.indexOf("/sys/");
    var last_path = in_pathname.lastIndexOf("/");
    this.root = in_pathname.substring(0,sys_pos + 5);
    this.url_model = in_pathname.substring(0, last_path + 1);
    this.url = in_pathname;
    if(metaData)
      this.store = metaData;
  }
  init(in_root:string, in_modelid: string, in_pageid: string){
    if(in_root)this.root = in_root;
    if(in_modelid)this.url_model = this.root + in_modelid;
    if(in_pageid)this.url = this.root + in_modelid + in_pageid;
    
    var getData = Utils.syncAjax(this.url, {"*json":"1"});
    //var searchModel = Utils.syncAjax(this.url, {"*searchMeta":"1"});
    this.store = getData;
  }
  getRoot(){
    return this.root;
  }
  getContextPath(){
    var context = this.root.substr(0, this.root.length - 1);
    return context.substring(0, context.lastIndexOf("/"));
  }
  data(tableID: string, queryKey: any) {
    var model = this.store.models.filter(function(val){
        return val.name == tableID
    });
    if(this.url.substring(this.url.lastIndexOf("."), this.url.length) == ".html"){
      var sUrl = "../../../fe/datas/" + tableID + ".json";
      model[0].url = sUrl;
    }
    
    var getData:IMeta = Utils.syncAjax(this.url_model + model[0].url, queryKey);
    if(getData === undefined || getData == null){
      getData = {code: 0,msg: "没有数据",datas:{}};
      return undefined;
    }else{
      if(getData.result !== undefined && getData.result.datas !== undefined)
        getData = getData.result;
      this.total = getData.datas[tableID].totalSize;
      return getData.datas[tableID].rows;
    }
  }
  model(tableID: string, type: string){
    var getData = this.store.models.filter(function(val){
        return val.name == tableID
    });
    
    if(getData === undefined || getData == null){
      //getData = {code: 0,msg: "没有数据",models:[],datas:{}};
      return undefined;
    }else{
      var model:IMetaModel = getData[0];
      if(type === undefined)
        return model.controls;
      else{
        model.controls.map(function(item){
          item.get = function(field){
            if(item[type+"."+field] !== undefined)
                return item[type+"."+field];
            else
                return item[field];
          }
        })
        return model.controls;
      }
    }
  }
  search(tableID: string){
    if(this.url.substring(this.url.lastIndexOf("."), this.url.length) == ".do"){
      this.url = this.url.substr(0, this.url.length - ".do".length);
      this.url += "/" + tableID + ".do";
    }
    var searchModel = Utils.syncAjax(this.url, {"*searchMeta":"1"});
    if(searchModel === undefined || searchModel == null){
      return undefined;
    }else{
      return searchModel;
    }
  }
  static code(url:string, id:string, name:string, pid:string, searchValue:any){
    var params = {};
    if(id)params["id"] = id;
    if(id)params["name"] = id;
    if(id)params["pid"] = id;
    if(searchValue)params["searchValue"] = searchValue;
    var codeData = Utils.syncAjax(url, params);
    return codeData;
  }
}