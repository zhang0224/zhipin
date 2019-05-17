<template>
    <div class="order-item">   
        <!--滑动区域-->
        <div ref="mescroll" class="mescroll">
            <div>
                <ul id="newsList" class="news-list" v-if="newArr.length > 0">
                    <li v-for="item in newArr" :key="item.id">
                        <p><span>订单编号:</span>{{ item.serialNo }}</p>
                        <p><span>商品名称:</span>{{ item.seedName }}</p>
                        <p><span>商品价格:</span>¥{{ item.seedPrice }}</p>
                        <p><span>实际支付价格:</span>¥{{ item.payPrice }}</p>
                        <p><span>购买时间:</span>{{ item.createTime }}</p>
                    </li>
                </ul>
                <div class="order-null" v-else>
                    <img src="../../assets/img/icon-order-null.png">
                    <p>～您还没有预约种子，暂无订单查询哦～</p>
                </div>
            </div>
        </div>
        <Loading v-show="showLoading"></Loading>
    </div>
</template>

<script>

import MeScroll from 'mescroll.js'
import 'mescroll.js/mescroll.min.css'
import axios from 'axios' 
import Loading from '../../components/loading.vue'

export default {
    name: 'listNews',
    data () {
        return {
            mescroll: null,
            showLoading:true,
            newArr: [] // 数据列表
        }
    },
    components: {
        Loading
    },
    created () {
        sessionStorage.setItem("openid","olKeh0gNM1OoGKIqCE-RZdVg2b2g")
        document.title="订单查询"
        window.APPID = "wx154654ede25d7f0b";
    },
    mounted () {
        this.getCode();
        // this.initMescroll()
    },
    methods: {

        getCode () { // 非静默授权，第一次有弹框
            const code = this.GetUrlParam("code") ; // 截取路径中的code，如果没有就去微信授权，如果已经获取到了就直接传code给后台获取openId
            const local = window.location.href;
            if (!code) {
                window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + window.APPID + '&redirect_uri=' + encodeURIComponent(local) + '&response_type=code&scope=snsapi_base&state=1#wechat_redirect';
            } else {
                this.getOpenId(code) //把code传给后台获取用户信息
            };
        },

        getOpenId (code) { // 通过code获取 openId等用户信息，/api/user/wechat/login 为后台接口;
            if(sessionStorage.getItem("code") == code){
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
                _this.initMescroll();
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
        initMescroll(){
            // 创建MeScroll对象:为避免配置的id和父组件id重复,这里使用ref的方式初始化mescroll
            this.mescroll = new MeScroll(this.$refs.mescroll, {// 在mounted生命周期初始化mescroll,以确保您配置的dom元素能够被找到.
                down: {
                    auto: false, // 是否在初始化完毕之后自动执行下拉回调callback; 默认true
                    callback: this.downCallback // 下拉刷新的回调
                },
                up: {
                    auto: true, // 是否在初始化时以上拉加载的方式自动加载第一页数据; 默认false
                    callback: this.upCallback, // 上拉回调,此处可简写; 相当于 callback: function (page) { upCallback(page); }
                    page: {
                        num: 0, // 当前页码,默认0,回调之前会加1,即callback(page)会从1开始
                        size: 10 // 每页数据的数量
                    },
                    noMoreSize: 5, // 如果列表已无数据,可设置列表的总数量要大于等于5条才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看
                    toTop: { // 配置回到顶部按钮
                        src: 'http://www.mescroll.com/img/mescroll-totop.png'
                    }
                }
            })
        },
        /* 下拉刷新的回调 */
        downCallback () {
            // 联网加载数据
            this.getListDataFromNet(0, 1, (data) => {
                // 添加新数据到列表顶部
                this.newArr.unshift(data);
                // 数据渲染成功后,隐藏下拉刷新的状态
                this.$nextTick(() => {
                    this.mescroll.endSuccess(false)// 结束下拉刷新,无参
                })
            }, () => {
                // 联网失败的回调,隐藏下拉刷新的状态
                this.mescroll.endErr()
            })
        },

        // 上拉回调 page = {num:1, size:10}; num:当前页 ,默认从1开始; size:每页数据条数,默认10
        upCallback (page) {
        // 联网加载数据
            this.getListDataFromNet(page.num, page.size, (curPageData) => {
                // 添加列表数据
                this.newArr = this.newArr.concat(curPageData)
                // 数据渲染成功后,隐藏下拉刷新的状态
                this.$nextTick(() => {
                    this.mescroll.endSuccess(false)
                })
            }, () => {
                // 联网失败的回调,隐藏下拉刷新和上拉加载的状态;
                this.mescroll.endErr()
            })
        },

        /* 联网加载列表数据
        在您的实际项目中,请参考官方写法: http://www.mescroll.com/api.html#tagUpCallback
        请忽略getListDataFromNet的逻辑,这里仅仅是在本地模拟分页数据,本地演示用
        实际项目以您服务器接口返回的数据为准,无需本地处理分页.
        * */
        getListDataFromNet (pageNum, pageSize, successCallback, errorCallback) {
            let _this = this;
            _this.mescroll.lockDownScroll(null);
            axios.defaults.baseURL = '/api/' 
            this.$http({
                method:'post', 
                url:'/wxchat/getAllByOpenId?openId=' + sessionStorage.getItem("openid"), 
            }).then(function(res){ 
                console.log(res);
                if(res.data.response.code == '0000'){
                    let newArr = [];
                    newArr = res.data.result;
                    successCallback && successCallback(newArr)
                }
            }).catch(function(err){ 
                console.log(err) 
            });
            _this.showLoading =false;
        }
    },

    beforeRouteEnter (to, from, next) { // 如果没有配置回到顶部按钮或isBounce,则beforeRouteEnter不用写
        next(vm => {
        if (vm.mescroll) {
            // 恢复到之前设置的isBounce状态
            if (vm.mescroll.lastBounce != null) vm.mescroll.setBounce(vm.mescroll.lastBounce)
            // 滚动到之前列表的位置(注意:路由使用keep-alive才生效)
            if (vm.mescroll.lastScrollTop) {
                vm.mescroll.setScrollTop(vm.mescroll.lastScrollTop)
                    setTimeout(() => { // 需延时,因为setScrollTop内部会触发onScroll,可能会渐显回到顶部按钮
                        vm.mescroll.setTopBtnFadeDuration(0)// 设置回到顶部按钮显示时无渐显动画
                    }, 16)
                }
            }
        })
    },
    beforeRouteLeave (to, from, next) { // 如果没有配置回到顶部按钮或isBounce,则beforeRouteLeave不用写
        if (this.mescroll) {
            this.mescroll.lastBounce = this.mescroll.optUp.isBounce// 记录当前是否禁止ios回弹
            this.mescroll.setBounce(true) // 允许bounce
            this.mescroll.lastScrollTop = this.mescroll.getScrollTop()// 记录当前滚动条的位置
            this.mescroll.hideTopBtn(0)// 隐藏回到顶部按钮,无渐隐动画
        }
        next()
    },

}
</script>

<style scoped>
/*以fixed的方式固定mescroll的高度*/
.order-item .mescroll {
    position: fixed;
    top: 0;
    bottom: 0;
    height: auto;
    border-top: 1px solid rgba(14,14,14,0.08);
}
.order-item{
    border-top: 1px solid rgba(14,14,14,0.08);
    text-align: left;
}
.order-item ul{
    padding-top: 6px;
}
.order-item ul li{
    border-bottom: 6px solid rgba(246,246,246,1);
    padding-bottom: 21px;
}
.order-item ul p{
    margin: 0 12px;
    height:43px;
    display: flex;
    align-items: center;
    color: #0E0E0E;
    font-size: 12px;
    border-bottom: 1px solid rgba(14,14,14,0.08)
}
.order-item ul li:last-child{
    border: none
}
.order-item ul p span{
    margin-right: 15px;
    font-size: 11px;
    color: #151515;
}
.content .sticky{
    position: fixed;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
}
.order-null{
    text-align: center;
    margin-top: 150px;
}
.order-null img{
    width: 88px;
}
.order-null  p{
    font-size:12px;
    color:rgba(38,37,37,1);
    margin-top: 15px;
}
</style>
