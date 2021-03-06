/*
 * 支付聚合
 * @Author: liangzc 
 * @Date: 2018-01-12
 * @Last Modified by: liangzc
 * @Last Modified time: 2018-01-15 16:12:23
 */
class UnionPay {
    constructor() {
    }

    /**
     * 唤起支付
     * @param {Object} options 支付参数
     * 
     * @returns {Promise}
     */
    pay(options) {
        return globalConfig.navigator.isWechat ? this.wechatPay(options) : globalConfig.navigator.isAlipay ? this.aliPay(options) : () => alert('请用微信或支付宝打开');
    }

    /**
     * 调起微信支付
     * @param {Object} options
     * @{options}  timestamp 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
     * @{options}  nonceStr 支付签名随机串，不长于 32 位
     * @{options}  package 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
     * @{options}  signType 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
     * @{options}  paySi gn 支付签名
     * 
     * @returns {Promise}
     */
    wechatPay(options) {
        return new Promise((resolve, reject) => {
            if (!options || Object.prototype.toString.call(options) !== ("[object Object]")) {
                reject('唤起微信支付参数错误，参数[options]：' + JSON.stringify(options));
                return;
            }
            _onBridgeReady().then(() => {
                WeixinJSBridge.invoke('getBrandWCPayRequest', options, res => {
                    if (res.err_msg == "get_brand_wcpay_request:ok") { //支付成功
                        resolve(res);
                    } else {
                        reject(res);
                    }
                });
            })
        })
    }

    /**
     * 调起支付宝支付
     * @param {Object} options 支付参数（tradeNO/orderStr）
     * @{options} tradeNO 交易号
     * @{options} orderStr 交易字符串
     * 
     * @returns {Promise}
     */
    aliPay(options) {
        return new Promise((resolve, reject) => {
            if (!options || Object.prototype.toString.call(options) !== ("[object Object]")) {
                reject('唤起支付宝参数错误，参数[options]：' + JSON.stringify(options));
                return;
            }
            _onBridgeReady().then(() => {
                AlipayJSBridge.call('tradePay', options, result => {
                    switch (result.resultCode) {
                        case '9000': //支付成功
                            resolve(result);
                            break;
                        case '8000': //后台获取支付结果超时，暂时未拿到支付结果
                        case '6004': //支付过程中网络出错， 暂时未拿到支付结果
                            result.resultMessage = '支付处理中，请稍后在您的订单中查看';
                            reject(result);
                            break;
                        case '6001': //用户中途取消
                        case '99': //用户点击忘记密码快捷界面退出(only iOS since 9.5)
                            break;
                        default:
                            result.resultMessage = '支付异常,请关闭页面后重试';
                            reject(result);
                            break;
                    }
                });
            });
        })
    }
}

/**
 * 桥接过渡函数
 * 
 * @returns {Promise}
 */
let _onBridgeReady = () => {
    return new Promise((resolve, reject) => {
        if (globalConfig.navigator.isWechat) {
            if (typeof WeixinJSBridge === "undefined") {
                if (document.addEventListener) {
                    document.addEventListener('WeixinJSBridgeReady', resolve, false);
                } else if (document.attachEvent) {
                    document.attachEvent('WeixinJSBridgeReady', resolve);
                    document.attachEvent('onWeixinJSBridgeReady', resolve);
                }
            } else {
                resolve();
            }
        } else if (globalConfig.navigator.isAlipay) {
            if (window.AlipayJSBridge) {
                resolve();
            } else {
                document.addEventListener('AlipayJSBridgeReady', resolve, false);
            }
        }
    })
};

module.exports = new UnionPay();