<template>
    <div class="detail">
        <div class="detail-header">
            <img class="item-bg" src="../../assets/img/item-bg.png" alt="">
            <div class="item">
                <img  class="sprout" src="../../assets/img/icon-sprout.png" alt="">
                <div class="item-img">
                    <img :src="data.img" alt="">
                </div>
            </div>
        </div>
        <div class="detail-info">  
            <ul>
                <li>
                    <div class="item-info">
                        <span>种子名称：</span>
                        <p class="item-name">{{ data.name }}</p>
                    </div>
                    <div class="item-info">
                        <span>专柜价格：</span>
                        <p class="old-price">{{ '¥' + data.costPrice }}</p>
                    </div>
                </li>
                <li>
                    <div class="item-info">
                        <span>种子价格：</span>
                        <p class="info-price">{{ '¥' + data.presentPrice }}</p>
                    </div>
                    <div class="item-info">
                        <span>日<span style="visibility:hidden">日省</span>省：</span>
                        <p class="info-price">{{ '¥' + data.save }}</p>
                    </div>
                </li>
                <li>
                    <div class="item-info">
                        <span>培育周期：</span>
                        <p>{{ data.grow + '天' }}</p>
                    </div>
                </li>
            </ul>
        </div>
        <div class="detail-explain">
            <h3>游戏规则</h3>
            <p>1.关注公众号，预订商品种子，预订成功后下载职拼APP在职植 农场进行种植培育。</p>
            <p>2.每个种子的属性不同培育周期也不同，种子培育周期约为10-28天，种子种植成功后可收取果实，兑换实物商品。</p>
            <p>3.每个微信id限购3次，果实成熟采摘后可培养下一批次的商品种子。</p>
            <p>4.所有商品种子均为正品，全部支持专柜验货。</p>
            <p>5.职拼APP预计五月末上线内测，成功预订种子，获得内测资格，即可领取神秘大礼包。</p>
            <p>6.如有疑问，欢迎拨打职拼客服电话:<a href="tel:010-80699904">010-80699904</a></p>
        </div>
        <div class="pay-buy" @click="appointmentBuy()">
            <p>购买种子</p>
        </div>

        <div class="pop-box" v-show="showPop">
            <div class="sure-order" v-show="showSure">
                <p class="title">确认订单</p>
                <div class="order-info">
                    <p><span>种子名称：</span>{{ data.name }}</p>
                    <p><span>种子价格：</span>¥{{ data.presentPrice }}</p>
                    <p><span>实际支付价格：</span>¥ {{ data.presentPrice }}</p>
                </div>
                <div class="button">
                    <p class="canale" @click="canale($event)">取消支付</p>
                    <p class="sure-pay" @click="surePay($event)">立即支付</p>
                </div>
            </div>
            <div class="success" v-show="showSuccess">   
                <p class="title">支付成功</p>
                <div class="tips-info">
                    <img src="../../assets/img/icon-success.png" alt="">
                    <p>你的种子已入袋，请到职拼app中的职植农场 培育你的种子吧！</p>
                </div>
                <div class="button">   
                    <p @click="hidePop">确定</p>
                </div>
            </div>
        </div>

        <Loading v-show="showLoading"></Loading>
    </div>
</template>
<script>
import axios from 'axios'
import Loading from '../../components/loading.vue'
export default {
    name: 'Deatil',
    data(){
        return{
            id:"",
            data:{},
            showLoading:false,
            showPop:false,
            showSuccess:false,
            showSure:false,
            canBuy:true
        }
    },
    components: {
        Loading
    },
    created () {
        document.title="预约种子"
        window.APPID = "wx154654ede25d7f0b";
        this.showLoading = true;
        this.getCheckBuy();
    },
    mounted(){
        this.getId();
    },
    methods: {
        getId(){
            let _this = this;
            _this.id = _this.$route.query.id;
            this.getGoodsDetails();
        },
        //获取 订单信息 查看是否购买过
        getCheckBuy(){
            var _this = this;
            axios.defaults.baseURL = '/api/';
            this.$http({ 
                method:'post', 
                url:'/wxchat/getAllByOpenId?openId=' + sessionStorage.getItem("openid"), 
            }).then(function(res){
                console.log(res);
                if(res.data.response.code == '0000'){
                    if(res.data.result.length >= 3){
                        _this.canBuy = false;
                    }else{
                        _this.canBuy = true;
                    }
                }
            }).catch(function(err){ 
                console.log(err) 
            });
        },
        getGoodsDetails(){
            var _this = this;
            axios.defaults.baseURL = '/api/';
            this.$http({ 
                method:'post', 
                url:'/wxchat/goodsDetails?id=' + _this.id, 
            }).then(function(res){
                console.log(res);
                if(res.data.response.code == '0000'){
                    _this.data = res.data.result
                }
            }).catch(function(err){ 
                console.log(err) 
            });
            _this.showLoading = false
        },
        appointmentBuy(){
            let _this = this;
            if(!_this.canBuy){
                let text = '亲，每个人只能购买三个种子哦'
                this.$toast(text, {
                    durtaion: 2000,
                    location: 'center' // 默认在中间
                });
                return;
            }

            _this.showPop = true;
            _this.showSure = true;
        },
        canale(){
            let _this = this;
            _this.showPop = false;
            _this.showSure = false;
        },
        surePay(){
            let _this = this;
            let totalfee = _this.data.presentPrice
            axios.defaults.baseURL = '/pay/';
            this.$http({
                method:'post',
                url: '/payOrder/requestpay.dhtml?openid='+sessionStorage.getItem("openid")+"&totalfee=" + totalfee,  
            }).then(function(res){
                let userInfo = JSON.parse(res.data.desc);
                console.log(userInfo);
                _this.showPop = false;
                _this.showSure = false;
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
            let totalfee = _this.data.presentPrice;
            let name = _this.data.name;
            axios.defaults.baseURL = '/api/'
            let data = {
                seedPrice:totalfee,
                payPrice:totalfee,
                seedName:name,
                openId:sessionStorage.getItem("openid")
            } 
            this.$http({
                method:'get',
                url:'/wxchat/insertWxchatOrder',   
                params:data,
            }).then(function(res){
                console.log(res);
                _this.showLoading = false;
                _this.showPop = true;
                _this.showSuccess = true;
                _this.getCheckBuy();
            }).catch(function(err){
                console.log(err)
            })
        },
        hidePop(){
            let _this = this;
            _this.showPop = false;
            _this.showSure = false;
            _this.showSuccess = false;
            _this.$router.go(-1);
        }
    }
    
}
</script>
<style scoped>
.detail .detail-header{
    width: 100%;
    position: relative;
    display: flex;
    height: 285px;
}
.detail .detail-header img.item-bg{
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -2;
    
}
.detail .detail-header .item{
    margin: auto;
    position: relative;
    
}
.detail .detail-header .item img.sprout{
    width: 86px;
    height: 60px;
    position: absolute;
    top:0;
    left: 50%;
    margin-left: -43px;
    z-index: -1;
}
.detail .detail-header .item .item-img{
    width: 163px;
    height: 163px;
    border-radius: 100%;
    border: 3px solid #000000;
    margin: auto;
    margin-top: 35px;
    background: #ffffff;
}
.detail .detail-header .item .item-img img{
    width: 100%;
    height: 100%;
    border-radius: 100%;
    object-fit: contain
}
.detail-info{
    border-bottom: 5px solid #E1E1E1;
}
.detail-info ul{
    padding: 25px 18px;
}
.detail-info ul li{
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 15px;
    font-size:15px;
    color:rgba(110,110,110,1);
}
.detail-info ul li:last-child{
    margin-bottom: 0;
}
.detail-info ul li .item-info{
    width: 55%;
    display: flex;
    align-items: center;
    justify-content: flex-start
}
.detail-info ul li .item-info p.old-price{
    text-decoration: line-through;
}
.detail-info ul li .item-info:last-child{
    width: 45%;
}
.detail-info ul li .item-info span{
    display: block;
    display: flex;
    justify-content: space-between
}
.detail-info ul li .item-info p{
    font-size:15px;
    color:rgba(110,110,110,1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
}
.detail-info ul li .item-info p.item-name{
    width: 100px;
}
.detail-info ul li .item-info p.info-price{
    font-size:20px;
    font-weight:bold;
    color:rgba(255,108,46,1)
}
.detail-explain{
    padding: 20px 15px 70px 15px;
    text-align: left;
}
.detail-explain h3{
    font-size:18px;
    font-weight:bold;
    color:rgba(6,6,6,1);
}
.detail-explain p{
    font-size:12px;
    color:#1C1C1C;
    line-height:24px;
}
.detail-explain p a{
   color: #0223B1;
   font-size:12px;
   margin-left: 3px;
}
.pay-buy {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height:44px;
    background:rgba(255,108,46,1);
    display: flex;
}
.pay-buy p{
    margin: auto;
    font-size:15px;
    font-weight:bold;
    color:rgba(255,255,255,1);
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
    height: 40px;
    margin:  0 1%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid rgba(16,16,16,0.11);
    color: #302F2F;
    font-size: 14px;
    font-weight:bold;
}
.pop-box .sure-order .order-info{
   margin-top: 5px;
}
.pop-box .sure-order .order-info p{
    text-align: left;
    padding-left: 60px;
    height: 35px;
    line-height: 70px;
    font-size:13px;
    color: #101010;
    font-size:13px;
}
.pop-box .sure-order .button{
    margin-top: 35px;
    padding: 0 70px;
    display: flex;
    align-items: center;
    justify-content: space-between
}
.pop-box .sure-order .button p{
    width: 78px;
    height:26px;
    border-radius:13px;
    color: #FFFFFF;
    background:rgba(255,108,46,1);
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center
}
.pop-box .sure-order .button .canale{
    color: #101010;
    background: #FFFFFF;
    border:1px solid rgba(14,14,14,0.27);
}
.pop-box .success .tips-info img{
    width: 45px;
    margin: 12px 0 18px 0;
}
.pop-box .success .tips-info p{
    width: 200px;
    margin: auto;
    font-size:12px;
    color: #3A3939;
}
.pop-box .success .button{
    margin:  0 18px;
    height:41px;
    line-height: 41px;
    background:#FF6C2E;
    border-radius:3px;
    margin-top: 30px;
}
.pop-box .success .button p{
    font-size:15px;
    font-weight:bold;
    color:rgba(255,255,255,1);
}
</style>


