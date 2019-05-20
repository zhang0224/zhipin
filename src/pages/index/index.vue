<template>
    <div class="swiper-box" id="swiper">   
        <swiper :options="swiperBannerOption" ref="mySwiper" id="swiperHeader">
            <!-- slides -->
            <swiper-slide>
               <img :src="banner.banner" alt="">
            </swiper-slide>
            <!-- Optional controls -->
            <div class="swiper-pagination"  slot="pagination"></div>
        </swiper>
        <div class="status" id="statusType">   
            <div class="item status-no" v-if="status">
                <img :src="banner.statusNo" alt="">
                <p>～你还没有预约种子哦～</p>
            </div>
            <div class="item status-yes" v-if="!status">   
                <img :src="banner.statusYes" alt="">
                <p>～你的种子已入袋快去植职农场种植吧～</p>
            </div>
            <router-link to="explain">
            <p class="explain">
                <img src="../../assets/img/icon-explain.png" alt="">
                <span>游戏说明</span>
            </p>
            </router-link>
        </div>
        <div class="content" id="contentSwiper">
            <!-- 一级分类 -->
            <div class="type-item" id="typeItem">
                <div class="tabs-warp">
                    <div ref="tabsContent" class="tabs-content mescroll-touch-x">
                        <div style="display: inline-block"> <!--PC端运行,加上这个div可修复tab-bar错位的问题 -->
                            <ul class="tabs" ref="tabs">
                                <li class="tab" v-for="(tab,i) in tabs" :class="{active: i===curIndex}" :style="{width: tabWidth+'px'}" :key="i" @click="changeTab(i)">{{tab.name}}</li>
                            </ul>
                            <div class="tab-bar" :style="{width: barWidth+'px', left: barLeft}"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 一级分类对应轮播 -->
            <swiper ref="mySwiper" :options="swiperOption" v-if="tabs.length > 0">
                <swiper-slide class="swiper-no-swiping" v-for="(item,index) in tabs" :key="index">
                    <div class="type-list">
                        <ul v-if=" tabs[index].subTabs && tabs[index].subTabs.length > 1">
                            <template>
                                <li 
                                    v-for="(item,index1) in tabs[index].subTabs" :key="index1" 
                                    :class="{'active': index1 == subCurIndex[index] }" 
                                    @click="subSelected(index1,index)"
                                >
                                    {{ item.name }}
                                </li>
                            </template>
                        </ul>
                    </div>
                    <!-- <mescroll-vue ref="mescroll{{index}}" :down="getMescrollDown(index)" :up="getMescrollUp(index)" @init="mescrollInit(index,arguments)"> -->
                    <!-- <mescroll-vue ref="mescroll{{index}}"> -->
                    <div class="mescroll">
                        <ul :id="dataList(index)" class="itemList">
                            <li class="data-li" v-for="pd in tabs[index].list" :key="pd.id">
                                <div class="pd-img-box" @click="goDetail($event,pd.id)">
                                    <img class="item-bg" src="../../assets/img/item-bg.png"/>
                                    <img class="item-pd" src="../../assets/img/item-pd.png"/>
                                    <div class="pd-item-img">   
                                        <img class="pd-img" v-lazy="pd.img" alt="" :key="pd.img"/>
                                    </div>
                                </div>
                                <div class="static item-box">
                                    <div class="static text-box">
                                        <div class="static">
                                            <div class="pd-name">{{pd.name}}</div>
                                            <div class="static price-box">
                                                <p class="pd-price">¥{{pd.presentPrice}}</p>
                                                <p class="pd-old-price">{{pd.costPrice}}</p>
                                            </div>
                                        </div>
                                        <p 
                                            class="pd-buy"
                                            v-bind:data-presentPrice="pd.presentPrice"
                                            v-bind:data-name="pd.name"
                                            @click="appointmentBuy($event)">
                                            购买种子</p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <!-- </mescroll-vue> -->
                </swiper-slide>
            </swiper>
        </div>
        <div class="pop-box" v-show="showPop">
            <div class="sure-order" v-show="showSure">
                <p class="title">确认订单</p>
                <div class="order-info">
                    <p><span>种子名称：</span>{{ name }}</p>
                    <p><span>种子价格：</span>¥{{ totalfee }}</p>
                    <p><span>实际支付价格：</span>¥ {{ totalfee }}</p>
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

import 'swiper/dist/css/swiper.css'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
// 引入mescroll的vue组件
import MescrollVue from 'mescroll.js/mescroll.vue'
// 模拟数据
import mockData from '../../mock/pdlist'
import axios from 'axios'
import Loading from '../../components/loading.vue'
import { fail } from 'assert';

export default {
    name: 'Index',
    data(){
        return{
            showLoading:false,
            banner:{},
            status:false,
            swiperBannerOption: {},
            tabs:[],
            subTabs:[],
            subCurIndex:[],
            allData:[],
            tabWidth: 65, // 每个tab的宽度
            barWidth: 40, // tab底部红色线的宽度
            curIndex: 0, // 当前tab的下标
            tabScrollLeft: 0, // 菜单滚动条的位置
            swiperOption: { // 轮播配置
                on: {
                    transitionEnd: () => {
                        this.changeTab(this.swiper.activeIndex);
                    }
                },
                noSwiping : true
            },
            showPop:false,
            showSuccess:false,
            showSure:false,
            name:"",
            totalfee:"",
            canBuy:true
        }
    },
    components: {
        swiper,
        swiperSlide,
        MescrollVue, // Mescroll组件
        Loading
    },
    computed: {
        swiper () { // 轮播对象
            return this.$refs.mySwiper.swiper;
        },
        barLeft () { // 红线的位置
            return (this.tabWidth * this.curIndex + (this.tabWidth - this.barWidth) / 2) + 'px';
        }
    },
    created () {
        document.title="预约种子"
        window.APPID = "wx154654ede25d7f0b";
        this.getCode();

        //本地可打开
        // this.getCheckBuy();
    },
    mounted(){
        this.getBnaner();
        this.getAllSendTotal();
        // this.initSticky();
    },
    methods: {
        getCode () { // 非静默授权，第一次有弹框
            const code = this.GetUrlParam("code") ; // 截取路径中的code，如果没有就去微信授权，如果已经获取到了就直接传code给后台获取openId
            console.log(code);
            const local = window.location.href;
            if (!code) {
                window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + window.APPID + '&redirect_uri=' + encodeURIComponent(local) + '&response_type=code&scope=snsapi_base&state=1#wechat_redirect';
            } else {
                this.getOpenId(code) //把code传给后台获取用户信息
            };
        },
        getOpenId (code) { // 通过code获取 openId等用户信息，/api/user/wechat/login 为后台接口;
            if(sessionStorage.getItem("code") == code){
                _this.getCheckBuy();
                return;
            }
            let _this = this;
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
                _this.getCheckBuy();
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
                    
                    if(res.data.result.length > 0){
                        _this.status = false;
                    }
                }
            }).catch(function(err){ 
                console.log(err) 
            });
        },
        appointmentBuy(e){
            var _this = this;
            if(!_this.canBuy){
                let text = '亲，每个人只能购买三个种子哦'
                this.$toast(text, {
                    durtaion: 2000,
                    location: 'center' // 默认在中间
                });
                return;
            }
            console.log(e.target.dataset);
            let totalfee = e.target.dataset.presentprice;
            let name = e.target.dataset.name;
            _this.totalfee = totalfee;
            _this.name = name;
            _this.showPop=true;
            _this.showSure=true;
        },
        canale(){
            let _this = this;
            _this.showPop = false;
            _this.showSure = false;
        },
        surePay(){
            let _this = this;
            let totalfee =  _this.totalfee;
            let name = _this.name;
            axios.defaults.baseURL = '/pay/';
            this.$http({
                method:'post',
                url: '/payOrder/requestpay.dhtml?openid='+sessionStorage.getItem("openid")+"&totalfee=" + totalfee,  
            }).then(function(res){
                console.log(res);
                let userInfo = JSON.parse(res.data.desc);
                console.log(userInfo);
                // _this.sureOrder(); // 支付成功后在调用 本地测试可开启
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
            let totalfee = this.totalfee;
            let name = this.name;
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
                _this.showLoading = false;
                _this.showSure = false;
                _this.showPop = true;
                _this.showSuccess = true;
                _this.status = false;
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
        },
        //二级分类选中效果
        subSelected(index1,index){
            console.log(index1,index);
            var _this = this;
            this.$set(_this.subCurIndex, index, index1);
            //当index1 为0时 默认为全部  index区分当前属于那个模块
            if( index1 == 0 ){
                _this.tabs[index].list = _this.allData[index].total;
            }else{
                let subIndex = index1 - 1;
                _this.tabs[index].list =  _this.allData[index].subItem[subIndex].seedThreeInfo;
            }

            console.log(_this.tabs[index].list);
        },
        goDetail(e,id){
            console.log(id);
            this.$router.push({ path: '/detail', query: { id: id }});
        },
        dataList(index){
            return "dataList" + index;
        },
        //获取轮播图 以及种子状态图片的接口 
        getBnaner(){
            var _this = this;
            axios.defaults.baseURL = '/api/';
            this.$http({ 
                method:'get', 
                url:'/post/getWxchatBanner', 
            }).then(function(res){ 
                console.log(res);
                if(res.data.response.code == "0000"){
                    _this.banner = {
                        banner:res.data.result[0].img,
                        statusNo:res.data.result[1].img,
                        statusYes:res.data.result[2].img
                    };
                }
            }).catch(function(err){ 
                console.log(err) 
            }) 
        },
        getAllSend(){
            var _this = this;
            axios.defaults.baseURL = '/api/' 
            this.$http({
                method:'post',
                url:'/wxchat/getAllSend?page=1&size=100', 
            }).then(function(res){
                console.log(res);
                if(res.data.response.code == "0000"){
                    let recommend = [{id:0,name:"推荐",seedTwoInfo:[]}];
                    let result = recommend.concat(res.data.result);
                    let subTabs = [];
                    
                    for(let i in result){
                        var all = {
                            id:0,
                            name:"全部"
                        }
                        _this.subCurIndex.push(0);
                        _this.$set(_this.tabs[i],"subTabs",[])
                        _this.tabs[i].subTabs.push(all);
                        _this.$set(_this.tabs[i],"subTabs",_this.tabs[i].subTabs.concat(result[i].seedTwoInfo))
                        _this.allData[i].subItem = result[i].seedTwoInfo;
                    };
                    console.log(_this.allData);
                    console.log(_this.tabs);
                }
            }).catch(function(err){ 
                console.log(err)
            });
            this.showLoading = false;
        },
        //获取 一级分类的接口
        getAllSendTotal(){
            var _this = this;
            axios.defaults.baseURL = '/api/' 
            this.showLoading = true;
            this.$http({
                method:'post',
                url:'/wxchat/getAllSendTotal?page=1&size=100', 
            }).then(function(res){
                console.log(res);
                if(res.data.response.code == "0000"){
                    let result = res.data.result;
                    let tabs = [];
                    let recommend = [];

                    let obj = {};
                    obj.name = "推荐";
                    obj.list = [];
                    //截取一级标题推荐数据  推荐数据暂无二级分类 且为全部所有数据 
                    for(let i in result){
                        obj.list = obj.list.concat(result[i].seedThreeinfo);
                    };
                    obj.seedThreeinfo = obj.list;
                    recommend[0] = obj;
                    result = recommend.concat(res.data.result)

                    console.log(result)

                    for(let i in result){
                        let obj = {};
                        result[i].isListInit = false;
                        if(!result[i].list){
                            result[i].list = [];
                            result[i].list = result[i].seedThreeinfo;
                        }
                        
                        tabs.push(result[i]);
                        obj.total = result[i].seedThreeinfo;
                        _this.allData.push(obj)
                    };
                    
                    _this.tabs = tabs;
                    _this.getAllSend();
                }
            }).catch(function(err){ 
                console.log(err) 
            }) 
        },

        // 多mescroll的配置,需通过方法获取,保证每个配置是单例
        getMescrollDown (tabIndex) {
            let isAuto = tabIndex === 0; // 第一个mescroll传入true,列表自动加载
            return {
                auto: isAuto,
                callback: this.downCallback
            }
        },

        // mescroll上拉加载的配置
        getMescrollUp (tabIndex) {
            let emptyWarpId = 'dataList' + tabIndex;
            return {
                auto: false,
                callback: this.upCallback, // 上拉回调,此处可简写; 相当于 callback: function (page) { upCallback(page); }
                noMoreSize: 4, // 如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
                empty: {
                    warpId: emptyWarpId, // 父布局的id;
                    icon: 'http://www.mescroll.com/img/mescroll-empty.png', // 图标,默认null
                    tip: '暂无相关数据~', // 提示
                    // btntext: '去逛逛 >', // 按钮,默认""
                    // btnClick: function () { // 点击按钮的回调,默认null
                    //     alert('点击了按钮,具体逻辑自行实现')
                    // }
                },
                toTop: { // 配置回到顶部按钮
                    src: 'http://www.mescroll.com/img/mescroll-totop.png' // 图片路径,默认null (建议写成网络图,不必考虑相对路径)
                }
            }
        },

        // mescroll初始化的回调
        mescrollInit (tabIndex, arg) {
            this.tabs[tabIndex].mescroll = arg[0]; // 传入mescroll对象
            this.tabs[tabIndex].mescroll.tabIndex = tabIndex; // 加入标记,便于在回调中取到对应的list
        },
        //吸顶设置
        initSticky(){
            let height = document.getElementById("swiperHeader").offsetHeight + document.getElementById("statusType").offsetHeight;
            let swiperContainer = document.getElementById("contentSwiper").getElementsByClassName("swiper-container")[0];
            let typeItem = document.getElementById("typeItem");
            let flag = false;
            window.onscroll = function(){
                var t = document.documentElement.scrollTop || document.body.scrollTop;
                if(t >= height ){
                    typeItem.classList.add("fixed");
                    swiperContainer.classList.add("sticky");
                }
            };
            let mescroll = document.getElementById("contentSwiper").getElementsByClassName("mescroll")[0];
            mescroll.onscroll = function(){
                var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                var t = mescroll.scrollTop;
                if(t <= 0){
                    typeItem.classList.remove("fixed")
                    swiperContainer.classList.remove("sticky");
                }
            };
        },
        // 切换菜单
        changeTab (tabIndex) {
            let _this = this;
            let mescroll = document.getElementsByClassName("mescroll");
            for(let i = 0;i<mescroll.length;i++){
                mescroll[i].style.display = "none"
            }
            mescroll[tabIndex].style.display = "block";

            if (this.curIndex === tabIndex) return; // 避免重复调用
            let curTab = this.tabs[this.curIndex];// 当前列表
            let newTab = this.tabs[tabIndex];// 新转换的列表
            curTab.mescroll && curTab.mescroll.hideTopBtn(); // 隐藏当前列表的回到顶部按钮
            this.curIndex = tabIndex; // 切换菜单
            this.swiper.slideTo(tabIndex);
            // 菜单项居中动画
            if (curTab.mescroll) {
                let tabsContent = this.$refs.tabsContent;
                let tabDom = tabsContent.getElementsByClassName('tab')[tabIndex];
                let star = tabsContent.scrollLeft;// 当前位置
                let end = tabDom.offsetLeft + tabDom.clientWidth / 2 - document.body.clientWidth / 2; // 居中
                this.tabScrollLeft = end;
                curTab.mescroll.getStep(star, end, function (step) {
                    tabsContent.scrollLeft = step; // 从当前位置逐渐移动到中间位置,默认时长300ms
                });
            };

            // _this.timer = setInterval(function(){
            //     var scrollTop=document.documentElement.scrollTop||document.body.scrollTop;
            //     var ispeed = Math.floor(-scrollTop/6);
            //     if(scrollTop <= 0){
            //         clearInterval(_this.timer);
            //     }
            //     document.documentElement.scrollTop = document.body.scrollTop=scrollTop+ispeed;
            // },30);

            if (newTab.mescroll) {
                if (!newTab.isListInit) {
                    // 加载列表
                    newTab.mescroll.triggerDownScroll();
                } else {
                // 检查新转换的列表是否需要显示回到到顶按钮
                    setTimeout(() => {
                        let curScrollTop = newTab.mescroll.getScrollTop();
                        if (curScrollTop >= newTab.mescroll.optUp.toTop.offset) {
                            newTab.mescroll.showTopBtn();
                        } else {
                            newTab.mescroll.hideTopBtn();
                        }
                    }, 30)
                }
            }
        },
        /* 下拉刷新的回调 */
        downCallback (mescroll) {
            // 这里加载你想下拉刷新的数据, 比如刷新tab1的轮播数据
            if (mescroll.tabIndex === 0) {
                // loadSwiper();
            } else if (mescroll.tabIndex === 1) {
                // ....
            } else if (mescroll.tabIndex === 2) {
                // ....
            }
            //暂时处理为每次下啦的时候 初始化  后续在设置数据
            mescroll.resetUpScroll();// 触发下拉刷新的回调,加载第一页的数据
            mescroll.lockDownScroll(true);

        },
        /* 上拉加载的回调 page = {num:1, size:10}; num:当前页 从1开始, size:每页数据条数 */
        upCallback (page, mescroll) {
            // if (mescroll.tabType === 0) {
            //   // 可以单独处理每个tab的请求
            // }else if (mescroll.tabType === 1) {
            //   // 可以单独处理每个tab的请求
            // }
            var _this = this;
            this.tabs[mescroll.tabIndex].isListInit = true;// 标记列表已初始化,保证列表只初始化一次
            this.getListDataFromNet(mescroll.tabIndex, page.num, page.size, (curPageData) => {
                mescroll.endSuccess(curPageData.length,false);// 联网成功的回调,隐藏下拉刷新和上拉加载的状态;
                if (page.num === 1) _this.tabs[mescroll.tabIndex].list = []; // 如果是第一页需手动制空列表
                _this.tabs[mescroll.tabIndex].list = _this.tabs[mescroll.tabIndex].list.concat(curPageData); // 追加新数据
            }, () => {
                if (page.num === 1) this.tabs[mescroll.tabIndex].isListInit = false;
                mescroll.endErr();// 联网失败的回调,隐藏下拉刷新的状态
            })
        },
        
        getListDataFromNet (tabIndex, pageNum, pageSize, successCallback, errorCallback) {

            var _this = this;
            var listData = []
            axios.defaults.baseURL = '/api/' 
            this.$http({
                method:'post',
                url:'/wxchat/getAllSendTotal?page=1&size=100', 
            }).then(function(res){
                console.log(res);
                if(res.data.response.code == "0000"){
                    let tabs = [];
                    let result = res.data.result;
                    
                    let obj = {};
                    obj.name = "推荐";
                    obj.list = [];
                    for(let i in result){
                        obj.list = obj.list.concat(result[i].seedThreeinfo);
                    };
                    obj.seedThreeinfo = obj.list;
                    tabs[0] = obj;

                    for(let i in result){
                        result[i].isListInit = false;
                        result[i].list = result[i].seedThreeinfo;
                        tabs.push(result[i]);
                    }

                    listData = tabs[tabIndex].list;

                    successCallback && successCallback(listData);

                }
            }).catch(function(err){ 
                console.log(err);
                errorCallback && errorCallback();
            });
        }
    },
    //进入路由
    beforeRouteEnter (to, from, next) { // 如果没有配置回到顶部按钮或isBounce,则beforeRouteEnter不用写
        next(vm => {
            let curMescroll = vm.$refs['mescroll' + vm.curIndex]; // 找到当前mescroll的ref,调用子组件mescroll-vue的beforeRouteEnter方法
            curMescroll && curMescroll.beforeRouteEnter() // 进入路由时,滚动到原来的列表位置,恢复回到顶部按钮和isBounce的配置
            // 恢复水平菜单的滚动条位置
            if (vm.$refs.tabsContent) vm.$refs.tabsContent.scrollLeft = vm.tabScrollLeft;
        })
    },
    //离开路由
    beforeRouteLeave (to, from, next) { // 如果没有配置回到顶部按钮或isBounce,则beforeRouteLeave不用写
        let curMescroll = this.$refs['mescroll' + this.curIndex]; // 找到当前mescroll的ref,调用子组件mescroll-vue的beforeRouteEnter方法
        curMescroll && curMescroll.beforeRouteLeave() // 退出路由时,记录列表滚动的位置,隐藏回到顶部按钮和isBounce的配置
        next()
    }
}

</script>

<style scoped>
.swiper-box img{
    width: 100%;
}
.status{
    margin:  0 10px;
    position: relative;
    border-bottom: 1px dashed rgba(255,108,46,0.47);
}
.status  .item{
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color:rgba(14,14,14,1);
    font-size: 12px;
}
.status  .item p{
    font-size:15px;
    color:rgba(14,14,14,1);
    margin-bottom: 10px;
}
.status  .item img{
    width: 122px;
}
.status .explain{
    position: absolute;
    right: 0;
    top: 10px;
    width:75px;
    height:27px;
    border-radius:0px 3px 0px 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color:rgba(255,255,255,1);
    background:rgba(255,108,46,1);
}
.status .explain img{
    width:11px;
    height:11px;
    margin-right: 3px;
}

/*菜单*/
.tabs-warp{
    overflow-y: hidden;
    box-sizing: content-box;
    margin:  0 10px;
    border-bottom: 1px dashed rgba(255,108,46,0.47);
}
.tabs-warp .tabs-content{
    width: 100%;
    overflow-x: auto;
    text-align: left;
}
.tabs-warp .tabs-content .tabs{
    width: 100%;
    white-space: nowrap;
}
.tabs-warp .tabs-content .tabs li{
    display: inline-block;
    vertical-align: middle;
    color: #0F0F0F;
    font-size: 15px;
    margin: 11px 0 ;
    text-align: center;
    height:27px;
    line-height: 27px;
    margin-right: 10px;
}
.tabs-warp .tabs-content .tabs .active{
    color: #fff;
    background:rgba(255,108,46,1);
    border-radius:3px;
}
.content .type-item{
    /* position:static;
    top: 0;
    left: 0;
    right: 0;
    z-index: 22; */
    background: #fff;
}
.content {
    /* position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 22;
    height: 100%;
    background: #fff; */
}
.content .fixed{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 22;
    background: #fff;
}
.content .type-list ul{
    display: flex;
    align-items: center;
    height: 44px;
    justify-content:flex-start;
    background: #ffffff;
    padding-left: 10px;
}
.content  .type-list ul li{
    border:1px solid rgba(27,27,27,0.5);
    border-radius:3px;
    font-size: 12px;
    height: 22px;
    color: #1B1B1B;
    display: flex;
    align-items:center;
    justify-content: center;
    padding:  0 10px;
    margin-right: 8px;
}
.content  .type-list ul li:last-child(){
    margin-right: 0;
}
.content .type-list ul li.active{
    border:1px solid rgba(255,108,46,1);
    border-radius:3px;
    color: #FF6C2E;
}
/* .tabs-warp  .type-list ul li:first-child{
    margin-left: 0;
}
.tabs-warp  .type-list ul li:last-child{
    margin-right: 0;
} */
/*菜单进度*/
/* .tabs-warp .tab-bar{
position: relative;
height: 2px;
background-color: #FF6990;
transition: left 300ms;
} */
/*列表*/
.content .swiper-container{
    /* position: fixed;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    background: #f5f5f5; */
}
.content .sticky{
    position: fixed;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
}
.content .swiper-wrapper .swiper-slide .mescroll{
    padding: 21px 15px 40px 15px;
    box-sizing: border-box;
    min-height: 100px;
    height: 100%;
}
/*展示上拉加载的数据列表*/
.data-li{
    position: relative;
    /* height: 200px; */
    background: #ffffff;
    border-radius:5px;
    width: 47%;
    margin-bottom: 12px;
    border:1px solid rgba(36, 35, 35, 0.1);
}
.pd-img-box{
    width: 100%;
    height: 150px;
    font-size: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}
.pd-img-box img.item-bg{
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 5px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}
.pd-img-box img.item-pd{
    position: absolute;
    z-index: 11;
    width: 76px;
    height: 96px;
}
.pd-img-box .pd-item-img{
    position: absolute;
    background: #fff;
    z-index: 22;
    width: 70px;
    height: 70px;
    border-radius: 100%;
    overflow: hidden;
    bottom: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.pd-img-box .pd-item-img .pad-img{
    width: 100%;
    object-fit: contain;
    border-radius: 100%;
}
.itemList {
    overflow: hidden
}
.data-li:nth-of-type(odd){
    float: left;
}
.data-li:nth-of-type(even){
    float: right;
}
.data-li .item-box{
    text-align: left;
    font-size: 0;
    padding-bottom: 2px;
    height: 40px;
}
.data-li .item-box .icon-tips{ 
    width: 60px;
    height: 15px;
}
.data-li .item-box .text-box{
    margin-top: 5px;
    display: flex;
    align-items:center;
    justify-content: space-around ;
    padding: 0 2px;
    /* border:1px solid rgba(36, 35, 35, 0.22); */

}
.data-li .pd-name{
    font-size: 9px;
    overflow: hidden;
    width: 75px;
    color: #0C0C0C;
    font-size: 12px;
    text-overflow: ellipsis;/*文字隐藏后添加省略号*/
    white-space: nowrap;/*强制不换行*/
}
.data-li  .price-box{
    display: flex;
    align-items: center;
}
.data-li .pd-price{
    font-size:14px;
    color:rgba(255,108,46,1);
}
.data-li .pd-old-price{
    color:rgba(121,121,121,1);
    font-size:11px;
    text-decoration: line-through;
    margin-left: 10px;
}
.data-li .pd-buy{
    font-size: 11px;
    color: gray;
    width:60px;
    height:25px;
    background:rgba(255,108,46,1);
    border-radius:3px;
    color:rgba(255,255,255,1);
    display: flex;
    align-items: center;
    justify-content: center
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

/*ios使用sticky样式实现*/
.nav-sticky{
    z-index: 9999;/*需设置zIndex,避免在悬停时,可能会被列表数据遮住*/
    position: -webkit-sticky;
    position: sticky;
    top: 0;/*相对mescroll的div悬停的位置*/
}
/*android和pc端悬停*/
.nav-fixed{
    z-index: 9999;
    position: fixed;
    top: 44px;
    left: 0;
    width: 100%;
}
</style>


