//  pages/add/add.js
//  Created by LT on 2018/6/22.
//  Copyright © 2018年 LT. All rights reserved.
var common = require('../../utils/common.js');
var xjCitys = {};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chinaCitys:[],
    cityName: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    xjCitys = common.readXJCitys();
    this.setData({
      chinaCitys: xjCitys
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '城市列表',
      desc: '',
      path: '/pages/add/add'
    }
  },

  chinaTaped: function(e) {
    var itemId = e.target.id;
    var city = xjCitys[itemId];
    // 添加城市
    var cityData = {
      "currentCity": city
    }
    common.addCity(cityData)
    wx.redirectTo({
      url: '../index/index?name=' + city
    })
  },

  searchInput: function(e) {
    this.setData({
      cityName:e.detail.value
    })
  },

  searchCity: function(e){
    if (this.data.cityName == "") {
      return
    }
    wx.redirectTo({
      url: '../index/index?name=' + this.data.cityName
    })
  }
})