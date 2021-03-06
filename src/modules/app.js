seajs.use(['director', 'gethtml', 'playlist','vue.min','url','storage'], function (Router, Dom, Playlist,Vue,urlList,storage) {
    var d = new Dom();
    var storage=new storage();
    var list = function (name) {
        return function () {
            d.getDom(name);
        };
    };

    var routes = {
        '/home':{
            "?([\s\S]*)": function(a){d.getDom('home');console.log(a)}
        } ,
        '/search_res': list('search_res'),
        '/error': list('error'),
        '/song':list('song'),
        '/artist':list('artist'),
        '/chat':list('chat'),
        '/album':list('album'),
        '/sl':list('sl')
    };
    if (!location.hash) {
        location.hash = '#/home';
    }

    $(window).bind('hashchange', function () {
      /*  window.clearInterval(intervalId);
         console.log('清除',window.intervalId);*/
        var r=location.hash.split("?")[0];
        if (!location.hash) {
            location.hash = '#/home';
        } else if (!routes[r.substr(1)]) {
            location.hash = '#/error';
        }
    });


    var router = Router(routes);
    router.init();

    //playlist
    window.pl = new Playlist();
    pl.readList();
    /*$('.jp-playlist-item-remove').click(function () {
        // alert('触发');
        var song_id = $(this).attr('data-id');
        pl.removeItem(song_id);
    });*/
    ///模板页控制器
    var TemplateCtrl=function(){

    };
    TemplateCtrl.prototype={
        //初始化
        init:function(){
            var u_t=storage.getItem('u_t');
            if(!!u_t){
                $('#id-btns').hide();
                $("#user-info").show();
                $('#nick-name-content').html(u_t.nick_name);
                $.ajax({
                    url:urlList.get("u_getSongList"),
                    type:"GET",
                    data:{
                        user_id:u_t.user_id
                    },
                    success:function(res){
                        console.log("song_ls",res);
                        var sl=new Vue({
                            el:"#sl",
                            data:{
                                sl:res.song_lists
                            }
                        });
                    }
                });


            }
            var listLen=$('#playlist li').length;
            $("#list-length").html(listLen);
            return u_t;
        },
        //注销
        logout:function(user_id) {
            $.get(urlList.get('u_logout'),{"user_id":user_id},function(res){
                console.log(res);
                if(res.status==='success'){
                    storage.removeItem('u_t');
                    $("#id-btns").show();
                    $("#user-info").hide();
                }else {
                    console.log("logout error");
                }
            });
        },
        //登录
        login:function(){
            $.get(urlList.get('login'),function(res){
                $('body').append(res);
            });
        },
        //注册
        signIn:function(){
            $.get(urlList.get('sign_in'),function(res){
                $('body').append(res);
            });
        },
        //搜索
        /*s：搜索的内容

         offset：偏移量（分页用）

         limit：获取的数量

         type：搜索的类型*/
        search:function(event){
            if(event.keyCode===13){
                var keywords=$('#search-input').val();
                var page=1;
                $.ajax({
                    url:urlList.get('u_search'),
                    type:"GET",

                    success:function(res){
                        window.location.hash="#/search_res?s="+keywords+"&type=1";
                    }
                });
            }
        }
    };

    /*全局量*/
    window.remind=function(txt,icon){
        if(!!icon){
            document.querySelector('#remind-icon').className=icon;
        }else {
            document.querySelector('#remind-icon').className="icon-emoticon-smile";
        }
        $('#remind-content').html(txt);
        $('.remind-box').fadeIn(500);
        setTimeout(function(){
            $('.remind-box').fadeOut(500);
        },2000);
    };
    //执行，绑定事件
    var tmplCtrl=new TemplateCtrl();
    //初始化
    var u_t=tmplCtrl.init();

    $('#btn-login').bind('click',function(){
        tmplCtrl.login();
    });
    $('#btn-sign').bind('click',function(){
        tmplCtrl.signIn();
    });
    $("#logout").bind('click',function(){
        tmplCtrl.logout(storage.getItem('u_t').user_id);
    });

    $('#search-input').keypress(function(e){
       tmplCtrl.search(e);
    });


    $('#jp-name').bind('click',function(){
        var song_id=$(this).attr('data-id');
        location.hash='#/song?id='+song_id;
    });

    $('#jp-singer').bind('click',function(){
        var singer_id=$(this).attr('data-singerId');
        location.hash='#/artist?id='+singer_id;
    });
      window.intervalId=0;
});
