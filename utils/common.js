//  utils/common.js
//  Created by LT on 2018/6/22.
//  Copyright © 2018年 LT. All rights reserved.
var cityBank = [];
var homeIndex = 0;
var bmap = require('bmap-wx.js');
function init(){
  // 首先查看是不是有数据
  try {
    var BMap = new bmap.BMapWX({
      ak: '2FAbr0aHgZETSvXUzXHCC6qyYVZqEGzk'
    });
    var fail = function(data) {
      console.log(data)
    };
    var value = wx.getStorageSync('citys')
    var index = wx.getStorageSync('index')
    if (value) {
      // Do something with return value
      console.log("有缓存");
      cityBank = value;
      // 返回上次关闭时的城市
      return cityBank[index].currentCity
    } else {
      console.log("没有缓存");
      // 调用应用实例的方法获取全局数据
      var location = "";
      var success = function(data) {
        var weatherData = data.currentWeather[0];
          weatherData.fullData = data.originalData.results[0];
          weatherData.location = weatherData.currentCity;
          cityBank.push(weatherData);
          homeIndex = 1;
          try {
            wx.getStorageSync('citys', cityBank);
            wx.getStorageSync('index', homeIndex);
            location = weatherData.currentCity;
            console.log("common.js" + location);
            // 返回手机定位得出的城市
            return weatherData.currentCity;
          } catch (e) {
          }
      }
      // 发起 weather 请求
      BMap.weather({
        fail: fail,
        success: success
      });
    }
  } catch (e) {
    // Do something when catch error
    console.log("缓存有误");
  }
}

// 获取今日日期
function getToday(){
  var myDate = new Date();
  var year = myDate.getFullYear();
  var month = myDate.getMonth() + 1;
  var day = myDate.getDate();
  return year+"年"+month+"月"+day+"日";
}

function windHelper(zhText){
  return zhText;
}

// pm2.5数值对应的空气级别
function pmText(index) {
  if (index <= 35){
    return "空气质量优";
  } else if (index > 35 && index <= 75) {
    return "空气质量良好";
  } else if (index > 75 && index <= 115) {
    return "空气轻度污染";
  } else if (index > 115 && index <= 150) {
    return "空气中度污染";
  } else if (index > 150 && index <= 250) {
    return "空气重度污染";
  } else if (index > 250) {
    return "空气污染严重！";
  }
}

function getHomeData() {
  return cityBank[homeIndex];
}

// 获取城市列表
function getCityList() {
  var citys = [];
  for (var i = 0; i < cityBank.length; i++) {
    var city = {};
    city.name = cityBank[i].currentCity;
    city.index = i;
    if (homeIndex == i) {
      // 0 当前位置图标，1 普通城市图标
      city.icon = 0; 
    } else {
      city.icon = 1;
    }
    citys.push(city);
  }
  return citys;
}

function getCity(){
  return cityBank;
}

// 刷新城市列表
function refreshCity(weatherData){
  homeIndex = wx.getStorageSync('index');
  var thatIndex = -1;
  for (var i = 0; i < cityBank.length; i++) {
    if (cityBank[i].currentCity == weatherData.currentCity) {
      cityBank[i] = weatherData;
      thatIndex = i;
    }
  }
  if (thatIndex == -1){
    cityBank.push(weatherData);
    homeIndex = cityBank.length - 1; 
  } else {
    homeIndex = thatIndex;
  }
  wx.setStorageSync('index', homeIndex);
}

// 添加城市
function addCity(weatherData) {
  var thatIndex = -1;
  for (var i = 0; i < cityBank.length; i++) {
    if (cityBank[i].currentCity == weatherData.currentCity) {
      thatIndex = i;
    }
  }
  if (thatIndex == -1) {
    cityBank.push(weatherData);
    wx.setStorageSync('citys', cityBank);
  }
}

// 直辖市、省会城市列表
function readXJCitys(){
  var xjCitys = ["北京市", "天津市", "上海市", "重庆市", "石家庄市", "郑州市", "武汉市", "长沙市", "南京市", "南昌市", "沈阳市", "长春市", "哈尔滨市", "西安市", "太原市", "济南市", "成都市", "西宁市", "合肥市", "海口市", "广州市", "贵阳市", "杭州市", "福州市", "兰州市", "昆明市", "拉萨市", "银川市", "南宁市", "乌鲁木齐市", "呼和浩特市", "香港市", "澳门市"]
  return xjCitys;
}

// 天气图标
function iconChanger(zhText) {
  var status = zhText;
  var statusData = {};
  statusData.status = status;
  var wallPaper = "day";
  var thisMoment = new Date().getHours();
  if (thisMoment > 18 || thisMoment < 6) {
    wallPaper = "night";
  } else {
    wallPaper = "day";
  }

  if (zhText.indexOf('沙')>=0){
    statusData.wall = "/images/sanddy";
  } else if (zhText.indexOf('雪') >= 0){
    statusData.wall = "/images/snow" + wallPaper;
  } else if (zhText.indexOf('雨') >= 0) {
    statusData.wall = "/images/rainy" + wallPaper;
  } else if (zhText.indexOf('云') >= 0) {
    statusData.wall = "/images/cloud" + wallPaper;
  } else {
    statusData.wall = "/images/clear" + wallPaper;
  }
  statusData.icon = zhText;
  return statusData;
}

// 将一些公共的代码抽离成为一个单独的 js 文件，作为一个模块，通过 module.exports 对外暴露接口
module.exports = {
  readXJCitys: readXJCitys,
  init: init,
  getHomeData: getHomeData,
  getCityList: getCityList,
  addCity: addCity,
  refreshCity: refreshCity,
  getToday: getToday,
  pmText: pmText,
  windHelper: windHelper,
  iconChanger: iconChanger,
  getCity: getCity
}