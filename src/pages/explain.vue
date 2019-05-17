<template>
    <div class="explain">   
       <p class="item">您好，亲爱的小盆友大盆友，感谢您对职拼的认可哦~</p>

       <h2>游戏规则：</h2>
       <p class="item">1.扫码或搜索“职拼”关注公众号，点击下方预约种子链接或扫描海报二维码即可预约种子，预约成功后下载职拼APP进行种植培育。</p>
       <p class="item">2.每个种子的属性不同培育周期也不同，种子培育周期约为15-20天，种子发育成熟后可收取果实，兑换商品。</p>
       <p class="item">3.每个微信id限购3次。</p>

       <h2>注意事项：</h2>
       <p class="item">1.我们的商品保证货真价实，支持专柜验货哦~。</p>
       <p class="item">2.在预约种子后，可以在公众号进行订单查看哦~。</p>
       <p class="item">3.您可以于5月末在各大应用商店、App Store下载”职拼APP“，微信登录后，进行种子培养并收取成熟的商品哦~。</p>
       <p class="item">4.收取成熟的商品后，将由平台统一发货，届时请注意查收哦~。</p>
       <p class="item">5.有任何疑问，可以拨打客服热线：<a href="tel:010-80699904">010-80699904</a>。</p>
       <p class="item">客服在线时间：工作日  9:00-18:00。</p>

        <div class="footer">   
            <span>最终解释权归易创吧（北京）科技发展有限公司所有</span>
        </div>
    </div>
</template>
<script>
export default {
    created () {
        document.title="游戏说明"
    }
}
</script>
<style scoped>
    .explain{
        padding: 19px 23px 0 17px;
        font-weight:200;
        font-size:12PX;
        text-align: left;
    }
    .explain .item{
        line-height:24px;
        color:#0E0E0E;
    }
    .explain h2{
        font-size:15px;
        font-weight:bold;
        color:rgba(14,14,14,1);
        margin: 25px 0;
    }
    .footer{
        margin-top: 30px;
        text-align: center;
        margin-top: 32px;
    }
    .footer span{
        font-size:10px;
    }
    a{
        color: #044BA4
    }
</style>


