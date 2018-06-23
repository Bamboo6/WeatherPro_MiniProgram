//  pages/index/index.js
//  Created by LT on 2018/6/22.
//  Copyright © 2018年 LT. All rights reserved.
//获取应用实例
var app = getApp()
var bmap = require('../../utils/bmap-wx.js');
var common = require('../../utils/common.js');
var lastcity = '';

Page({
  data: {
    gogoleft: 0,
    gogoright: -50,
    gogostatus: false,
    pagesize: 100,
    pagetop: 0,
    userInfo: {},
    animationW: {},
    animationM: {},
    theWeather: {
      weatherIcon: "",
      date: 0,
      currentCity: "",
      weatherDesc: "~",
      pm25: 0,
      temperature: "  ~  ",
      wind: " 无风 "
    },
    cityMenus: [],
    today: "",
    daylight: true,
    wall: "/images/clearday"
  },

  onLoad: function (options) {
    var thisMoment = new Date().getHours();
    if (thisMoment > 18 || thisMoment < 6) {
      this.setData({
        daylight: false
      })
    } else {
      this.setData({
        daylight: true
      })
    }
    wx.showLoading();
    var cityname = common.init();
    console.log("index.js城市名: "+cityname)
    this.setData({
      'theWeather.currentCity': cityname,
      'today': common.getToday()
    })
    var BMap = new bmap.BMapWX({
      ak: '2FAbr0aHgZETSvXUzXHCC6qyYVZqEGzk'
    });
    var weatherData = {}
    if (options.name != null) {
      this.setData({
        'theWeather.currentCity': options.name
      })
    }
    BMap.weather({
      city: this.data.theWeather.currentCity,
      fail: this.fail,
      success: this.success
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '微信天气',
      desc: '',
      path: '/pages/index/index'
    }
  },
  
  del: function (e) {
    var itemId = e.target.id;
    if (itemId == "") {
      console.log("id 空着")
      return;
    }
    common.getCity().splice(itemId, 1)
    this.setData({
      // 'theWeather.currentCity': common.getCity()[0].currentCity,
      'theWeather.currentCity': this.data.theWeather.currentCity
    })
    wx.setStorageSync('citys', common.getCity());
    var BMap = new bmap.BMapWX({
      ak: '2FAbr0aHgZETSvXUzXHCC6qyYVZqEGzk'
    });
    BMap.weather({
      city: this.data.theWeather.currentCity,
      fail: this.fail,
      success: this.success
    });
  },

  setMenuNatural: function(normal){
    var animationW = wx.createAnimation({
      duration: 200
    });
    var animationM = wx.createAnimation({
      duration: 200
    });
    var menuStatus = false;
    if (this.data.gogostatus) {
      animationW.width("100%").height("100vh").top("0vh").left("0%").step();
      animationM.right("40%").step();
      menuStatus = false;
    } else {
      animationW.width("90%").height("90vh").top("5vh").left("-40%").step();
      animationM.right("0%").step();
      menuStatus = true;
    }
    this.setData({
      animationW: animationW.export(),
      animationM: animationM.export(),
      gogostatus: menuStatus,
      cityMenus: common.getCityList()
    })
  },

  setAdd: function() {
    wx.navigateTo({
      url: '../add/add'
    })
  },

  menuTap: function(e) {
    wx.showLoading();
    var itemId = e.target.id;
    var that = this;
    if(itemId == "") {
      console.log("id 空着")
      return;
    }
    var theCity = common.getCity()[itemId];
    console.log("index.js-menuTap：theCity");
    console.log(theCity);

    this.setData({
      'theWeather.currentCity': theCity.currentCity
    })

    var BMap = new bmap.BMapWX({
      ak: '2FAbr0aHgZETSvXUzXHCC6qyYVZqEGzk'
    });
    BMap.weather({
      city: theCity.currentCity,
      fail: this.fail,
      success: this.success
    });
  },

  fail: function (data) {
    wx.showModal({
      title: '城市天气搜索失败',
      content: '未找到' + this.data.theWeather.currentCity + '的天气预报信息',
      showCancel: false,
      confirmText: '返回',
      success: function (res) {
        var nowlocation = "";
        wx.getLocation({   // 利用微信选择位置 API ，获得经纬度信息  
          success: function (lb) {
            console.log("地理位置")
            console.log(lb)
            var addressData = lb
            wx.request({ // 利用百度地图API，将微信获得的经纬度传给百度
              url: 'https://api.map.baidu.com/geocoder/v2/?ak=2FAbr0aHgZETSvXUzXHCC6qyYVZqEGzk&location=' + lb.latitude + ',' + lb.longitude + '&output=json&coordtype=wgs84ll',
              data: {},
              header: {
                'Content-Type': 'application/json'
              },
              success: function (res) {
                console.log(res.data.result);
                nowlocation = res.data.result.addressComponent.city;
                wx.redirectTo({
                  url: '../index/index?name=' + nowlocation,
                })
              },
              fail: function () {
                // fail
              },
              complete: function () {
                // complete
              }
            })
          },
          cancel: function (lb) {
          },
          fail: function (lb) {
            console.log(lb)
          }
        })
        
      }
    })
    wx.hideLoading();
  },

  location: function () {
    wx.chooseLocation({   // ①.利用微信选择位置API，获得经纬度信息  
      success: function (lb) {
        console.log("地理位置")
        console.log(lb)
        that.data.addressData = lb
        wx.request({ // ②百度地图API，将微信获得的经纬度传给百度，获得城市等信息
          url: 'https://api.map.baidu.com/geocoder/v2/?ak=2FAbr0aHgZETSvXUzXHCC6qyYVZqEGzk&location=' + lb.latitude + ',' + lb.longitude + '&output=json&coordtype=wgs84ll',
          data: {},
          header: {
            'Content-Type': 'application/json'
          },
          success: function (res) {
            console.log(res.data.result);
            console.log(res.data.result.addressComponent.city + res.data.result.addressComponent.district);
            // that.setData({
            //   addressAll: res.data.result.addressComponent.city + res.data.result.addressComponent.district + "·" + lb.name //③.我们将微信得到的位置名称“故宫博物馆”与百度地图API得到的“北京市东城区”合并显示在页面上。
            // })
          },
          fail: function () {
            // fail
          },
          complete: function () {
            // complete
          }
        })
      },
      cancel: function (lb) {
      },
      fail: function (lb) {
        console.log(lb)
      }
    })
  },

  success: function(data) {
    wx.hideLoading();
    var weatherData = data.currentWeather[0];
    weatherData.fullData = data.originalData.results[0];

    var date = weatherData.date;
    date = date.substring(date.indexOf("：") + 1, date.indexOf("℃"));
    weatherData.date = date;
    var days = weatherData.fullData.weather_data;
    for (var i = 0; i < days.length; i++) {
      if (i == 0){
        var todayText = days[i].date;
        todayText = todayText.substring(todayText.indexOf("周"), todayText.indexOf("周") + 2);
        days[i].date = todayText;
      }
      days[i].weather = common.iconChanger(days[i].weather).icon;
    }
    weatherData.fullData.weather_data = days;
    var tudayStatus = common.iconChanger(weatherData.weatherDesc);
    weatherData.weatherIcon = tudayStatus.icon;
    weatherData.weatherDese = tudayStatus.status;
    weatherData.wind = common.windHelper(weatherData.wind);
    weatherData.pmpm = common.pmText(weatherData.pm25);

    common.refreshCity(weatherData);
    console.log(weatherData);
    this.setData({
      theWeather: weatherData,
      today: common.getToday,
      wall: tudayStatus.wall,
      gogostatus: true
    });
    this.setMenuNatural();
  }
})
