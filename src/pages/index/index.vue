<template>
    <div class="swiper-box">   
        <swiper :options="swiperBannerOption" ref="mySwiper" id="swiperHeader">
            <!-- slides -->
            <swiper-slide>
               <img src="../../assets/img/banner.png" alt="">
            </swiper-slide>
            <!-- Optional controls -->
            <div class="swiper-pagination"  slot="pagination"></div>
        </swiper>
        <div class="status" id="statusType">   
            <div class="item status-no" v-if="status">
                <img :src="banner.statusNo" alt="">
                <p>～您还没有预约种子哦～</p>
            </div>
            <div class="item status-yes" v-if="!status">   
                <img :src="banner.statusYes" alt="">
                <p>～您的mac种子已成功预约～</p>
            </div>
            <router-link to="explain">
            <p class="explain">
                <img src="../../assets/img/icon-explain.png" alt="">
                <span>种子说明</span>
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
                <swiper-slide v-for="(item,index) in tabs" :key="index">
                    <div class="type-list">
                        <ul>
                            <li 
                                v-for="(item,index1) in tabs[index].subTabs" :key="index1" 
                                :class="{'active': index1 == subCurIndex[index] }" 
                                @click="subSelected(index1,index)"
                            >
                                {{ item.name }}
                            </li> 
                        </ul>
                    </div>
                    <mescroll-vue ref="mescroll{{index}}" :down="getMescrollDown(index)" :up="getMescrollUp(index)" @init="mescrollInit(index,arguments)">
                        <ul :id="dataList(index)" class="itemList">
                            <li class="data-li" v-for="pd in tabs[index].list" :key="pd.id">
                                <div class="pd-img-box">   
                                    <img class="pd-img" :src="pd.img"/>
                                </div>
                                <div class="static item-box">
                                    <img src="../../assets/img/icon-tips.png" alt="" class="icon-tips">
                                    <div class="static text-box">  
                                        <div class="static">   
                                            <div class="pd-name">{{pd.name}}</div>
                                            <div class="static price-box">
                                                <p class="pd-price">¥{{pd.costPrice/100}}</p>
                                                <p class="pd-old-price">{{pd.presentPrice/100}}</p>
                                            </div>
                                        </div>
                                        <p class="pd-buy">立即购买</p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </mescroll-vue>
                </swiper-slide>
            </swiper>
        </div>
        <div class="pop-box" style="display:none">
            <div class="sure-order" style="display:none">
                <p class="title">确认订单</p>
                <div class="order-info">
                    <p><span>种子名称：</span>迪奥080种子</p>
                    <p><span>种子价格：</span>¥ 50</p>
                    <p><span>实际支付价格：</span>¥ 50</p>
                </div>
                <div class="button">
                    <button class="canale">取消支付</button>
                    <button class="sure-pay">立即支付</button>
                </div>
            </div>
            <div class="success" style="display:none">   
                <p class="title">支付成功</p>
                <div class="tips-info">
                    <img src="../../assets/img/icon-success.png" alt="">
                    <p>感谢您购买种子，届时请登录APP培养收取果实！</p>
                </div>
                <div class="button">   
                    <button>确定</button>
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
            tabWidth: 80, // 每个tab的宽度
            barWidth: 40, // tab底部红色线的宽度
            curIndex: 0, // 当前tab的下标
            tabScrollLeft: 0, // 菜单滚动条的位置
            swiperOption: { // 轮播配置
                on: {
                    transitionEnd: () => {
                        this.changeTab(this.swiper.activeIndex);
                    }
                }
            }
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
            return this.$refs.mySwiper.swiper
        },
        barLeft () { // 红线的位置
            return (this.tabWidth * this.curIndex + (this.tabWidth - this.barWidth) / 2) + 'px'
        }
    },
    created () {
        // this.getStatus();
        this.getAllSendTotal();
        this.getAllSend();
    },
    mounted(){
        this.getBnaner();
        // this.initSticky();
    },
    methods: {

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
                    let result = res.data.result;
                    let subTabs = [];
                    
                    for(let i in result){
                        var all = {
                            id:0,
                            name:"全部"
                        }
                        _this.subCurIndex.push(0);
                        _this.tabs[i].subTabs = [];
                        _this.tabs[i].subTabs.push(all);
                        _this.tabs[i].subTabs = _this.tabs[i].subTabs.concat(result[i].seedTwoInfo);
                        _this.allData[i].subItem = result[i].seedTwoInfo;
                    };
                    console.log(_this.allData)
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
                    for(let i in result){
                        let obj = {};
                        result[i].isListInit = false;
                        result[i].list = [];
                        tabs.push(result[i]);
                        obj.total = result[i].seedThreeinfo;
                        _this.allData.push(obj)
                    }
                    _this.tabs = tabs;
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
            
            let mescroll = document.getElementsByClassName("mescroll");
            for(let i = 0;i<mescroll.length;i++){
                mescroll[i].style.display = "none"
            }
            mescroll[tabIndex].style.display = "block"

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
            }
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
            this.$set(this.subCurIndex, mescroll.tabIndex, 0);
            mescroll.resetUpScroll();// 触发下拉刷新的回调,加载第一页的数据

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
                mescroll.endSuccess(curPageData.length);// 联网成功的回调,隐藏下拉刷新和上拉加载的状态;
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
    height: 140px;
    border-bottom: 1px solid rgba(160,160,160,0.27);
}
.status  .item{
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color:rgba(14,14,14,1);
    font-size: 12px;
    
}
.status  .item img{
    width: 63px;
    margin-bottom: 15px;
    margin-top: 25px;
}
.status .explain{
    position: absolute;
    right: 0;
    top: 10px;
    width:75px;
    height:27px;
    border:1px solid rgba(255,0,0,1);
    border-radius:0px 3px 0px 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color:rgba(245,8,8,1);
}
.status .explain img{
    width:11px;
    height:11px;
    margin-right: 3px;
}

/*菜单*/
.tabs-warp{
    /* height: 43px;高度比tabs-content小, 目的是隐藏tabs的水平滚动条 */
    overflow-y: hidden;
    border-bottom: 1px solid #eee;
    box-sizing: content-box;
    margin:  0 10px;
    border-bottom: 1px solid rgba(160,160,160,0.14);
    }
.tabs-warp .tabs-content{
    width: 100%;
    overflow-x: auto;
    text-align: left;
}
.tabs-warp .tabs-content .tabs{
    width: 100%;
    white-space: nowrap;
    padding-left: 10px;
}
.tabs-warp .tabs-content .tabs li{
    display: inline-block;
    height: 40px;
    line-height: 45px;
    vertical-align: middle;
    text-align: left;
    color: #868686;
}
.tabs-warp .tabs-content .tabs .active{
    color: #0E0E0E;
}
.content .type-item{
    position:static;
    top: 0;
    left: 0;
    right: 0;
    z-index: 22;
    background: #fff;
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
    /* border-top:1px solid rgba(160,160,160,0.14); */
    justify-content:space-around;
    background: #ffffff
}
.content  .type-list ul li{
    border:1px solid rgba(27,27,27,0.3);
    border-radius:3px;
    font-size: 11px;
    height: 22px;
    color: #868686;
    display: flex;
    align-items:center;
    justify-content: center;
    padding: 0 10px;
}
.content .type-list ul li.active{
    border:1px solid rgba(255,0,0,1);
    color: #FF0000;
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
    bottom: 0; */
    background: #f5f5f5;
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
}
/*展示上拉加载的数据列表*/
.data-li{
    position: relative;
    height: 200px;
    background: #ffffff;
    border-radius:5px;
    width: 47%;
    margin-bottom: 12px;
}
.pd-img-box{
    width: 100%;
    height: 130px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.pd-img-box img{
    object-fit: contain
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
.data-li .pd-img{
    width: 100%;
    height: 80px;
}
.data-li .item-box{
    text-align: left;
    font-size: 0;
}
.data-li .item-box .icon-tips{ 
    width: 60px;
    height: 15px;
}
.data-li .item-box .text-box{
    margin-top: 12px;
    display: flex;
    align-items:center;
    justify-content: space-around ;
    padding: 0 2px;

}
.data-li .pd-name{
    font-size: 9px;
    overflow: hidden;
    width: 75px;
    text-overflow: ellipsis;/*文字隐藏后添加省略号*/
    white-space: nowrap;/*强制不换行*/
}
.data-li  .price-box{
    display: flex;
    align-items: center;
}
.data-li .pd-price{
    color:rgba(252,6,6,1);
    font-size:11px;
}
.data-li .pd-old-price{
    color:#797979;
    font-size:10px;
    text-decoration: line-through;
    margin-left: 10px;
}
.data-li .pd-buy{
    font-size: 11px;
    color: gray;
    width:60px;
    height:25px;
    background:rgba(255,0,0,1);
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
    font-weight:200;
    color:rgba(16,16,16,1);
    color: #101010;
}
.pop-box .sure-order .button{
    margin-top: 35px;
    padding: 0 70px;
    display: flex;
    align-items: center;
    justify-content: space-between
}
.pop-box .sure-order .button button{
    width: 78px;
    height:26px;
    border-radius:13px;
    color: #FFFFFF;
    background: #FF0000;
    font-size: 12px;
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
.pop-box .success .button button{
    font-size:15px;
    font-weight:bold;
    color:rgba(255,255,255,1);
}
</style>


