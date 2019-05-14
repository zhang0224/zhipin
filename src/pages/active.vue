<template>
    <div class="active">
        <div class="header">
            <img src="../assets/img/active-header.png" alt="">
        </div>
        <div class="active-content">
            <div class="rule">
                <h3>农场玩法</h3>
                <p><span>*</span>选择预订一颗“种子”进行培育</p>
                <p><span>*</span>培育过程中会遇到天气变化 </p>
                <p><span>*</span>种植成功后可结出相应的果实 </p>
                <p><span>*</span>果实可自已使用或与平台好友交易</p>
                <p><span>*</span>所得果实全部支持专柜验货</p>
                <p><span>*</span>职拼APP预计五月末上线内测，内测资格限时预订，预订成功即可 领取神秘大礼包</p>
            </div>
            <div class="shopItem">   
                <div class="item" v-for="(item,index) in listData" :key="index">   
                    <div class="titl-type">
                        <h3>{{ item.name }}种子</h3>
                    </div>
                    <ul>
                        <li v-for="(item,index) in item.seedThreeInfo" :key="index">
                            <div class="img-box"><img v-lazy="item.img" alt="" :key="item.img"></div>
                            <div class="static">
                                <div class="text">
                                    <p class="name">{{ item.name }}</p>
                                    <p class="price">¥{{ item.prePrice }}</p>
                                </div>
                                <div 
                                    class="appoint" 
                                    ref="ItemInfo" 
                                    v-bind:data-preprice="item.prePrice"
                                    v-bind:data-name="item.name"
                                    @click="appointmentBuy($event)"
                                    >立即预订</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="footer">
            <div class="wx-code">
                <img src="../assets/img/wx-code.png" alt="">
                <p>长按扫描二维码关注“嗨遇”公众号</p>
            </div>
            <div class="copyright-tips">
                <img src="../assets/img/active-footer.png" alt="">
                <p>最终解释权归易创吧（北京）科技发展有限公司所有</p>
            </div>
        </div>
        <div class="pop-box" v-if="showSuccess">
            <div class="success">   
                <p class="title">预订成功</p>
                <div class="tips-info">
                    <img src="../assets/img/icon-success.png" alt="">
                    <p>详情请关注“嗨遇”公众号了解</p>
                </div>
                <div class="button" @click="hidePop" >   
                    <p>确定</p>
                </div>
            </div>
        </div>
        <Loading v-show="showLoading"></Loading>
    </div>
</template>
<script>
import axios from 'axios' 
import Loading from '../components/loading.vue'
export default {
    data(){
        return{
            listData:[],
            showLoading:true,
            showSuccess:false,
            canBuy:true
        }
    },
    components: {
        Loading
    },
    created () {
        window.APPID = "wx154654ede25d7f0b";
        this.getCode();
    },
    mounted(){
        
    },
    methods:{
        getCode () { // 非静默授权，第一次有弹框
            const code = this.GetUrlParam("code") ; // 截取路径中的code，如果没有就去微信授权，如果已经获取到了就直接传code给后台获取openId
            console.log(code);
            const local = window.location.href;
            // const local = "http://ch.jwangkun.com/new/dist/#/active"
            if (!code) {
                window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + window.APPID + '&redirect_uri=' + encodeURIComponent(local) + '&response_type=code&scope=snsapi_base&state=1#wechat_redirect';
            } else {
                this.getOpenId(code) //把code传给后台获取用户信息
            };
        },
        getOpenId (code) { // 通过code获取 openId等用户信息，/api/user/wechat/login 为后台接口;
            let _this = this;
            if(sessionStorage.getItem("code") == code){
                _this.getAllSend();
                _this.chatOpenId();
                return;
            };
            axios.defaults.baseURL = '/api/'
            this.$http({
                method:'get',
                url:'/wx/getOpenid?code=' + code,   
            }).then(function(res){
                console.log(res);
                if(res.data.openid != null){
                    sessionStorage.setItem("openid",res.data.openid);
                    sessionStorage.setItem("code",code);
                }
                _this.getAllSend();
                _this.chatOpenId();
            }).catch(function(err){
                console.log(err)
            })
        },
        chatOpenId(){
            let _this = this;
            axios.defaults.baseURL = '/api/' 
            this.$http({
                method:'get',
                url:'/wxchat/chatOpenId?openId=' + sessionStorage.getItem("openid"),   
            }).then(function(res){
                console.log(res);
                if(res.data){
                    _this.canBuy = true;
                }else{
                    _this.canBuy = false;
                }
            }).catch(function(err){
                console.log(err)
            });
        },
        
        appointmentBuy(e){
            var _this = this;
            console.log(e.target.dataset);
            if(!_this.canBuy){
                let text = '亲，您已经预订过了哦~'
                this.$toast(text, {
                    durtaion: 2000,
                    location: 'center' // 默认在中间
                });
                return;
            }
            if(!sessionStorage.getItem("openid")){
                let text = '亲，网络出问题了请稍后再试～'
                this.$toast(text, {
                    durtaion: 2000,
                    location: 'center' // 默认在中间
                });
                return;
            }
            let totalfee = e.target.dataset.preprice;
            let name = e.target.dataset.name;
            _this.totalfee = totalfee;
            _this.name = name;
            axios.defaults.baseURL = '/pay/';
            this.$http({
                method:'post',
                url: '/payOrder/requestpay.dhtml?openid='+sessionStorage.getItem("openid")+"&totalfee=" + totalfee,  
            }).then(function(res){
                console.log(res);
                let userInfo = JSON.parse(res.data.desc);
                console.log(userInfo);
                // _this.sureOrder(); // 支付成功后在调用 本地测试可开启
                _this.payorder(userInfo);
            }).catch(function(err){ 
                console.log(err) 
            });
        },
        payorder(userInfo){
            if (typeof WeixinJSBridge == "undefined"){
                if( document.addEventListener ){
                    document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                }else if (document.attachEvent){
                    document.attachEvent('WeixinJSBridgeReady', onBridgeReady); 
                    document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                }
            }else{
                this.onBridgeReady(userInfo);
            }
        },
        onBridgeReady(userInfo){
            var _this = this;
            WeixinJSBridge.invoke(
                'getBrandWCPayRequest', {
                    "appId":"wx154654ede25d7f0b",     //公众号名称，由商户传入     
                    "timeStamp":userInfo.timeStamp,         //时间戳，自1970年以来的秒数     
                    "nonceStr":userInfo.nonceStr, //随机串     
                    "package":userInfo.package,     
                    "signType":"MD5",         //微信签名方式：     
                    "paySign":userInfo.sign //微信签名 
                },
                function(res){
                    console.log(res);
                    if(res.err_msg == "get_brand_wcpay_request:ok" ){
                        // 使用以上方式判断前端返回,微信团队郑重提示
                        _this.showLoading = true;
                        _this.sureOrder();
                    } else if(res.err_msg == "get_brand_wcpay_request:cancel"){
                        this.$toast("您取消了支付", {
                            durtaion: 1000,
                            location: 'center' // 默认在中间
                        });
                    }else if(res.err_msg == "get_brand_wcpay_request:fail"){
                        this.$toast("一会再试试吧,失败了呢～", {
                            durtaion: 1000,
                            location: 'center' // 默认在中间
                        });
                    }
                }
            ); 
        },
        sureOrder(){
            let _this = this;
            let totalfee = this.totalfee;
            let name = this.name;
            axios.defaults.baseURL = '/api/' 
            this.$http({
                method:'get',
                url:'/wxchat/insertWxchatOrder?seedPrice=' + totalfee + '&payPrice='+ totalfee +'&seedName=' + name +'&openId='+sessionStorage.getItem("openid"),
            }).then(function(res){
                console.log(res)
                let check = true;
                _this.chatOpenId(check);
                _this.showLoading = false;
                _this.showSuccess = true;
            }).catch(function(err){
                console.log(err)
            })
        },
        GetUrlParam(variable){
            var index = window.location.href.lastIndexOf("?");
            var obj = window.location.href;
            var query = obj.substring(index+1,obj.length);
            var vars = query.split("&");
            for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
                if(pair[0] == variable){return pair[1];}
            }
            return(false);
        },
        getInfo(){
            axios.defaults.baseURL = '/api/' 
            this.$http({ 
                method:'get', 
                url:'/post/getWxchatBanner', 
                data:{} 
            }).then(function(res){ 
                console.log(res) 
            }).catch(function(err){ 
                console.log(err) 
            }) 
        },
        getAllSend(){
            var _this = this;
            axios.defaults.baseURL = '/api/' 
            this.$http({
                method:'post',
                url:'/wxchat/getAllSend?page=1&size=28', 
            }).then(function(res){
                console.log(res);
                if(res.data.response.code == "0000"){
                    let listData  = [];
                    let data = res.data.result;
                    for(let i in data){
                        if(data[i].seedTwoInfo.length > 0 ){
                            for(let n in data[i].seedTwoInfo){
                               listData.push(data[i].seedTwoInfo[n]);
                            }
                        }
                    }
                    _this.listData = listData;
                    console.log(listData)
                }
            }).catch(function(err){ 
                console.log(err) 
            });
            this.showLoading = false;
        },
        hidePop(){
            this.showSuccess = false;
        }
    }
}
</script>
<style scoped>
.active{
    background: #1F1F1F;
}
.active .header{
    background: #B01E1F
}
.active .header img{
    width: 100%;
}
.active .active-content{
    border-top:1px dashed rgba(255,255,255,1)
}
.active .active-content .rule {
    padding:  26px 0 0 0;
    text-align: left;
}
.active .active-content .rule h3{
    font-size:15px;
    font-weight:bold;
    color:rgba(255,255,255,1);
    padding-left: 20px;
    margin-bottom: 13px;
}
.active .active-content .rule p{
    margin-left: 30px;
    margin-right: 15px;
    font-size:11px;
    font-weight:200;
    color:rgba(255,255,255,1);
    line-height:18px;
    display: flex;
    text-align: left
}
.active .active-content .rule p span{
    margin-right: 3px;
}
.active .active-content .rule p:last-child{
    padding-bottom: 22px;
    border-bottom: 1px dashed rgba(255,255,255,1)
}
.active .active-content .shopItem{
    padding-top: 4px;
}
.active .active-content .shopItem .item{
    margin-top: 23px;
    text-align: left;
    padding: 0 15px;
}
.active .active-content .shopItem .item .titl-type{
    overflow: hidden;
}
.active .active-content .shopItem .item .titl-type h3{
    font-size:18px;
    color:rgba(255,255,255,1);
    float: left;
    border-bottom: 5px solid #FF0000;
}
.active .active-content .shopItem .item ul{
    overflow: hidden;
    padding: 0 2px;
    padding-top: 17px;
}
.active .active-content .shopItem .item ul li{
    width: 158px;
    height: 170px;
    background:rgba(255,255,255,1);
    border:1px solid rgba(232, 232, 232, 0.44);
    border-radius:5px;
    margin-bottom: 13px;
}
.active .active-content .shopItem .item ul li:nth-of-type(odd){
    float: left
}
.active .active-content .shopItem .item ul li:nth-of-type(even){
    float: right;
}
.active .active-content .shopItem .item ul li .img-box{
    width: 100%;
    height: 115px;
    border-bottom:1px solid rgba(33,32,32,0.08);
    display: flex;
}
.active .active-content .shopItem .item ul li .img-box img{
    margin: auto;
    object-fit: contain;
    width: 100%;
    height: 100%;
}
.active .active-content .shopItem .item ul li .static{
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 5px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 4px;
}
.active .active-content .shopItem .item ul li .static .text{
    
}
.active .active-content .shopItem .item ul li .static .text .name{
    font-size:12px;
    color:rgba(40,39,39,1);
    overflow: hidden;
    width: 76px;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.active .active-content .shopItem .item ul li .static .text .price{
    font-size:14px;
    font-weight:bold;
    color:rgba(252,6,6,1);
}
.active .active-content .shopItem .item ul li .static .appoint{
    width:59px;
    height:25px;
    background:rgba(255,0,0,1);
    border-radius:3px;
    font-size:11px;
    font-weight:bold;
    color:rgba(255,255,255,1);
    display: flex;
    align-items: center;
    justify-content: center
}
.active .footer{
    margin-top: 50px;
}
.active .footer .wx-code img{
    width: 123px;
}
.active .footer .wx-code p{
    font-size:12px;
    color:rgba(254,254,254,1);
    margin-top: 20px;
    margin-bottom: 15px;
}
.active .footer  .copyright-tips{
    position: relative;
    width: 100%;
    height: 65px;
}
.active .footer  .copyright-tips p{
    position: absolute;
    font-size:11px;
    font-weight:bold;
    color:rgba(255,255,255,1);
    top: 32px;
    left: 62px;
}
.active .footer  .copyright-tips img{
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    bottom: 0;
}
.pop-box{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(1,1,1,0.22);
    z-index: 333;
    display: flex;
}
.pop-box .sure-order,.pop-box .success{
    margin: auto;
    width:333px;
    height:233px;
    background:rgba(255,255,255,1);
    border-radius:6px;
}
.pop-box .sure-order .title,.pop-box .success .title{
    height: 50px;
    margin:  0 1%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid rgba(16,16,16,0.11);
    color: #302F2F;
    font-size: 20px;
    font-weight:bold;
}
.pop-box .success .tips-info img{
    width: 45px;
    margin: 12px 0 18px 0;
}
.pop-box .success .tips-info p{
    margin: auto;
    font-size:18px;
    color:rgba(58,57,57,1);
}
.pop-box .success .button{
    margin:  0 18px;
    height:41px;
    line-height: 41px;
    background:rgba(255,0,0,1);
    border-radius:3px;
    margin-top: 30px;
}
.pop-box .success .button p{
    font-size:15px;
    font-weight:bold;
    color:rgba(255,255,255,1);
}

</style>


