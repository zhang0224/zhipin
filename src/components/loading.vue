<template>
    <div>
        <div class="loading static" id="loading">
            <div class="loading-item"> 
                <div class="spinner">
                    <div class="rect1"></div>
                    <div class="rect2"></div>
                    <div class="rect3"></div>
                    <div class="rect4"></div>
                    <div class="rect5"></div>
                </div>
                <p>loading...</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name:'Loading'
}
</script>

<style scoped>
.loading{
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 9999;
    display: flex;
    font-size: 0
}
.static .loading-item{
    margin: auto;
    text-align: center;
    border-radius: 5px;
    color: #fff;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    width: 40%;
    background:  rgba(40,40,40,.75);
    display: flex;
    align-items: center;
    font-size: 14px;
}

.static .spinner {
    margin-top: 20px;
    width: 100px;
    height: 50px;
    text-align: center;
    font-size: 10px;
}

.static .spinner > div {
    background:#fff;
    height: 100%;
    width: 6px;
    margin-left: 5px;
    display: inline-block;
    -webkit-animation: stretchdelay 1.2s infinite ease-in-out;
    animation: stretchdelay 1.2s infinite ease-in-out;
}

.static .spinner .rect2 {
    -webkit-animation-delay: -1.1s;
    animation-delay: -1.1s;
}

.static .spinner .rect3 {
    -webkit-animation-delay: -1.0s;
    animation-delay: -1.0s;
}

.static .spinner .rect4 {
    -webkit-animation-delay: -0.9s;
    animation-delay: -0.9s;
}

.static .spinner .rect5 {
    -webkit-animation-delay: -0.8s;
    animation-delay: -0.8s;
}
.static .loading-item p{
    margin: 10px;
}

@-webkit-keyframes stretchdelay {
    0%, 40%, 100% { -webkit-transform: scaleY(0.4) } 
    20% { -webkit-transform: scaleY(1.0) }
}

@keyframes stretchdelay {
    0%, 40%, 100% {
        transform: scaleY(0.4);
        -webkit-transform: scaleY(0.4);
    }  20% {
        transform: scaleY(1.0);
        -webkit-transform: scaleY(1.0);
    }
}
</style>


