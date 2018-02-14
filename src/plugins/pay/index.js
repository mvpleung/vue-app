/*
 * @Author: liangzc 
 * @Date: 2018-02-09 
 * @Last Modified by: liangzc
 * @Last Modified time: 2018-02-13 15:35:15
 */
/**
 * @param {Vue} Vue Vue对象
 * @param {Object} options {useSdk: Boolean} 是否使用对应平台的 jssdk
 */
let install = function(Vue, options = {}) {
  if (install.installed) return;
  Vue.$uniquePay = Vue.prototype.$uniquePay = require(options.useSdk ?
    './UniquePay.sdk' :
    './UniquePay'); //添加vm实例验证属性
};
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(install);
}
module.exports = install;