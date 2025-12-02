var idd;
function getList() {
    $('#rwh').val("");
    $('#th').val("");
    $('#thyy').val("");
    $('#hth').val("");
    $('#jsrq').val("");
    $('#ksrq').val("");
    $ajax({
        type: 'post',
        url: '/thjl/getList',
    }, false, '', function (res) {
        console.log('=== 调试信息开始 ===');
        console.log('API响应状态:', res.code);
        console.log('API响应消息:', res.msg);
        console.log('完整响应数据:', res);
        if (res.code == 200) {
            setTable(res.data);
            $("#userTable").colResizable({
                liveDrag: true,
                gripInnerHtml: "<div class='grip'></div>",
                draggingClass: "dragging",
                resizeMode: 'fit'
            });
            for (i=0;i<=res.data.id;i++){
                idd=i;
            }
        }
    })
}

$(function () {
    getList();

    // $('#select-btn').click(function () {
    //     var name = $('#name').val();
    //     console.log('查询条件 - 姓名:', name);
    //
    //     $ajax({
    //         type: 'post',
    //         url: '/thjl/queryList',
    //         data: {
    //             name: name  // 只传递姓名参数
    //         }
    //     }, true, '', function (res) {
    //         console.log('查询响应:', res);
    //         if (res.code == 200) {
    //             console.log('查询到的数据:', res.data);
    //             setTable(res.data);
    //             swal("查询成功", "找到 " + res.data.length + " 条记录", "success");
    //         } else {
    //             swal("查询失败", res.msg, "error");
    //         }
    //     })
    // });


    $(function () {
        getList();

        // 设置默认日期（保持 yyyy-MM-dd 格式）
        var date = new Date();
        date.setMonth(date.getMonth() - 3);
        var year = date.getFullYear();
        var month = ('0' + (date.getMonth() + 1)).slice(-2);
        var day = ('0' + date.getDate()).slice(-2);
        var ks = year + '-' + month + '-' + day;
        document.getElementById("ksrq").value ="";

        var jsDate = new Date();
        jsDate.setMonth(jsDate.getMonth() + 1);
        var jsyear = jsDate.getFullYear();
        var jsmonth = ('0' + (jsDate.getMonth() + 1)).slice(-2);
        var jsday = ('0' + jsDate.getDate()).slice(-2);
        var js = jsyear + '-' + jsmonth + '-' + jsday;
        document.getElementById("jsrq").value = "";


        $('#select-btn').click(function () {
            var ksrq = $('#ksrq').val();
            var jsrq = $('#jsrq').val();
            var h = $('#hth').val();
            var i = $('#rwh').val();
            var k = $('#th').val();
            var r = $('#thyy').val();

            // 添加调试信息
            console.log('查询条件:', {
                ksrq: ksrq,
                jsrq: jsrq,
                h: h,
                i: i,
                k: k,
                r: r
            });

            // 如果日期为空，传递空字符串而不是null
            ksrq = ksrq || '';
            jsrq = jsrq || '';

            $ajax({
                type: 'post',
                url: '/thjl/queryList',
                data: {
                    ksrq: ksrq,
                    jsrq: jsrq,
                    h: h || '',
                    i: i || '',
                    k: k || '',
                    r: r || ''
                }
            }, true, '查询中...', function (res) {
                console.log('查询响应:', res);
                if (res.code == 200) {
                    console.log('查询到的数据:', res.data);
                    setTable(res.data);
                    // 添加查询成功提示
                    swal("查询成功", "找到 " + res.data.length + " 条记录", "success");
                } else {
                    // 添加查询失败提示
                    swal("查询失败", res.msg, "error");
                }
            })
        });
    });

    //刷新
    $("#refresh-btn").click(function () {

        getList();
    });

    //点击新增按钮显示弹窗
    $("#add-btn").click(function () {
        $('#add-modal').modal('show');
    });

//新增弹窗里点击关闭按钮
    $('#add-close-btn').click(function () {
        $('#add-modal').modal('hide');
    });

//新增弹窗里点击提交按钮
    $("#add-submit-btn").click(function () {
        // 防止重复提交
        var $btn = $(this);
        if ($btn.data('submitting')) {
            return;
        }
        $btn.data('submitting', true);
        $btn.prop('disabled', true);

        var originalText = $btn.html();
        $btn.html('<i class="bi bi-arrow-clockwise icon"></i>提交中...');

        // 手动构建参数，包含所有字段
        let params = {
            c: $('#add-c').val(),      // 退货客户
            d: $('#add-d').val(),      // 退货电话
            e: $('#add-e').val(),      // 退货日期
            f: $('#add-f').val(),      // 回厂日期
            g: $('#add-g').val(),      // 退货单号
            h: $('#add-h').val(),      // 合同号
            i: $('#add-i').val(),      // 任务号
            j: $('#add-j').val(),      // 产品名称
            k: $('#add-k').val(),      // 图号
            l: $('#add-l').val(),      // 单位
            m: $('#add-m').val(),      // 数量
            n: $('#add-n').val(),      // 单价
            o: $('#add-o').val(),      // 金额
            p: $('#add-p').val(),      // 材质
            q: $('#add-q').val(),      // 重量
            r: $('#add-r').val(),      // 退货原因
            s: $('#add-s').val(),      // 备注
            t: $('#add-t').val(),      // 地址
            u: $('#add-u').val(),      // 客户签字
            v: $('#add-v').val()       // 电话
        };

        console.log('前端输入的数据:', params);
        console.log('发送的JSON数据:', JSON.stringify(params));

        // 直接提交，不进行表单验证
        $ajax({
            type: 'post',
            url: '/thjl/add',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: 'application/json;charset=utf-8'
        }, false, '', function (res) {
            // 恢复按钮状态
            $btn.data('submitting', false);
            $btn.prop('disabled', false);
            $btn.html(originalText);

            console.log('服务器响应:', res);

            if (res.code == 200) {
                swal("", res.msg, "success");
                $('#add-form')[0].reset();
                getList();
                $('#add-modal').modal('hide');
            } else {
                swal("", res.msg, "error");
            }
        }, function(xhr, status, error) {
            // 请求失败时也恢复按钮状态
            $btn.data('submitting', false);
            $btn.prop('disabled', false);
            $btn.html(originalText);

            console.error('请求失败详情:');
            console.error('状态:', status);
            console.error('错误:', error);
            console.error('响应文本:', xhr.responseText);

            swal("", "请求失败，请检查网络连接: " + error, "error");
        });
    });
    //点击修改按钮显示弹窗
    $('#update-btn').click(function () {
        let rows = getTableSelection('#userTable');
        if (rows.length > 1 || rows.length == 0) {
            swal('请选择一条数据修改!');
            return;
        }

        let selectedRow = rows[0];
        console.log('选中的行数据:', selectedRow);

        // 数据在 data 属性中，正确访问方式：
        let rowData = selectedRow.data;
        console.log('实际数据对象:', rowData);

        // 存储数据 - 从 data 属性中获取
        window.selectedUserData = {
            c: rowData.c,
            d: rowData.d,
            e: rowData.e,
            f: rowData.f,
            g: rowData.g,
            h: rowData.h,
            i: rowData.i,
            j: rowData.j,
            k: rowData.k,
            l: rowData.l,
            m: rowData.m,
            n: rowData.n,
            o: rowData.o,
            p: rowData.p,
            q: rowData.q,
            r: rowData.r,
            s: rowData.s,
            t: rowData.t,
            u: rowData.u,
            v: rowData.v,
            id: rowData.id
        };

        console.log('存储的数据:', window.selectedUserData);

        $('#update-modal').modal('show');
    });

// 监听弹窗完全显示事件
    $('#update-modal').on('shown.bs.modal', function () {
        if (window.selectedUserData) {
            console.log('读取的数据:', window.selectedUserData);

            let selectedRow = window.selectedUserData;

            console.log('弹窗已显示，开始填充数据...');
            console.log('要填充的数据:', selectedRow);

            // 填充数据
            $('#update-c').val(selectedRow.c || '');  // 退货客户
            $('#update-d').val(selectedRow.d || '');  // 退货电话
            $('#update-e').val(selectedRow.e || '');  // 退货日期
            $('#update-f').val(selectedRow.f || '');  // 回厂日期
            $('#update-g').val(selectedRow.g || '');  // 退货单号
            $('#update-h').val(selectedRow.h || '');  // 合同号
            $('#update-i').val(selectedRow.i || '');  // 任务号
            $('#update-j').val(selectedRow.j || '');  // 产品名称
            $('#update-k').val(selectedRow.k || '');  // 图号
            $('#update-l').val(selectedRow.l || '');  // 单位
            $('#update-m').val(selectedRow.m || '');  // 数量
            $('#update-n').val(selectedRow.n || '');  // 单价
            $('#update-o').val(selectedRow.o || '');  // 金额
            $('#update-p').val(selectedRow.p || '');  // 材质
            $('#update-q').val(selectedRow.q || '');  // 重量
            $('#update-r').val(selectedRow.r || '');  // 退货原因
            $('#update-s').val(selectedRow.s || '');  // 备注
            $('#update-t').val(selectedRow.t || '');  // 地址
            $('#update-u').val(selectedRow.u || '');  // 客户签字
            $('#update-v').val(selectedRow.v || '');  // 电话

            $('#id').val(selectedRow.id || '');  // 添加这一行！


            console.log('填充后的表单值:');
            console.log('退货客户:', $('#update-c').val());
            console.log('退货电话:', $('#update-d').val());
            console.log('退货日期:', $('#update-e').val());
            console.log('回厂日期:', $('#update-f').val());
            console.log('退货单号:', $('#update-g').val());
            console.log('合同号:', $('#update-h').val());
            console.log('任务号:', $('#update-i').val());
            console.log('产品名称:', $('#update-j').val());
            console.log('图号:', $('#update-k').val());
            console.log('单位:', $('#update-l').val());
            console.log('数量:', $('#update-m').val());
            console.log('单价:', $('#update-n').val());
            console.log('金额:', $('#update-o').val());
            console.log('材质:', $('#update-p').val());
            console.log('重量:', $('#update-q').val());
            console.log('退货原因:', $('#update-r').val());
            console.log('备注:', $('#update-s').val());
            console.log('地址:', $('#update-t').val());
            console.log('客户签字:', $('#update-u').val());
            console.log('电话:', $('#update-v').val());



            window.selectedUserData = null;
        }
    });

    //修改弹窗点击提交按钮 - 完全绕过验证
    $('#update-submit-btn').click(function () {
        var msg = confirm("确认要修改吗？");
        console.log("msg", msg);
        if (msg) {
            // 获取表单数据
            let params = {
                id: $('#id').val(),
                c: $('#update-c').val(),  // 退货客户
                d: $('#update-d').val(),  // 退货电话
                e: $('#update-e').val(),  // 退货日期
                f: $('#update-f').val(),  // 回厂日期
                g: $('#update-g').val(),  // 退货单号
                h: $('#update-h').val(),  // 合同号
                i: $('#update-i').val(),  // 任务号
                j: $('#update-j').val(),  // 产品名称
                k: $('#update-k').val(),  // 图号
                l: $('#update-l').val(),  // 单位
                m: $('#update-m').val(),  // 数量
                n: $('#update-n').val(),  // 单价
                o: $('#update-o').val(),  // 金额
                p: $('#update-p').val(),  // 材质
                q: $('#update-q').val(),  // 重量
                r: $('#update-r').val(),  // 退货原因
                s: $('#update-s').val(),  // 备注
                t: $('#update-t').val(),  // 地址
                u: $('#update-u').val(),  // 客户签字
                v: $('#update-v').val()   // 电话
            };

            console.log('提交的修改数据:', params);

            // 显示加载状态
            $(this).prop('disabled', true).text('提交中...');

            $.ajax({
                type: 'POST',
                url: '/thjl/update',
                data: JSON.stringify(params),
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                success: function (res) {
                    console.log('服务器响应:', res);

                    // 恢复按钮状态
                    $('#update-submit-btn').prop('disabled', false).text('提交');

                    if (res.code == 200) {
                        swal("", res.msg, "success");
                        $('#update-modal').modal('hide');
                        $('#update-form')[0].reset();
                        getList();
                    } else {
                        swal("", res.msg || "修改失败", "error");
                    }
                },
                error: function (xhr, status, error) {
                    console.error('请求失败:', error);
                    console.error('状态:', status);
                    console.error('响应文本:', xhr.responseText);

                    // 恢复按钮状态
                    $('#update-submit-btn').prop('disabled', false).text('提交');

                    swal("", "请求失败，请检查网络连接或联系管理员", "error");
                }
            });
        }
    });


    //点击删除按钮
    $('#delete-btn').click(function () {
        var msg = confirm("确认要删除吗？");
        if (msg) {
            let rows = getTableSelection("#userTable");
            if (rows.length == 0) {
                swal('请选择要删除的数据！');
                return;
            }
            let idList = [];
            $.each(rows, function (index, row) {
                idList.push(row.data.id)
            });
            $ajax({
                type: 'post',
                url: '/thjl/delete',
                data: JSON.stringify({
                    idList: idList
                }),
                dataType: 'json',
                contentType: 'application/json;charset=utf-8'
            }, false, '', function (res) {
                if (res.code == 200) {
                    swal("", res.msg, "success");
                    getList();
                } else if(res.code == 403){
                    swal("删除失败,权限不足,管理员权限可以删除");
                }else {
                    swal("", res.msg, "error");
                }
            })
        }
    })
});

function setTable(data) {
    // 确保表格容器存在
    if ($('#userTable').length === 0) {
        console.error('表格元素 #userTable 不存在');
        return;
    }

    // 销毁现有表格
    if ($('#userTable').hasClass('bootstrap-table')) {
        $('#userTable').bootstrapTable('destroy');
    }

    // 初始化表格
    $('#userTable').bootstrapTable({
        data: data,
        sortStable: true,
        classes: 'table table-hover table-bordered',
        idField: 'id',
        pagination: true,
        pageSize: 15,
        clickToSelect: true,
        locale: 'zh-CN',
        columns: [
            {
                field: 'c',  // 小写 c - 对应姓名
                title: '退货客户',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'd',  // 小写 d - 对应用户名
                title: '退货电话',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'e',  // 小写 e - 对应密码
                title: '退货日期',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'f',  // 小写 f - 对应权限
                title: '回厂日期',
                align: 'center',
                sortable: true,
                width: 100,
            },{
        field: 'g',  // 小写 e - 对应密码
            title: '退货单号',
            align: 'center',
            sortable: true,
            width: 100,
    },{
        field: 'h',  // 小写 e - 对应密码
            title: '合同号',
            align: 'center',
            sortable: true,
            width: 100,
    },{
        field: 'i',  // 小写 e - 对应密码
            title: '任务号',
            align: 'center',
            sortable: true,
            width: 100,
    },{
        field: 'j',  // 小写 e - 对应密码
            title: '产品名称',
            align: 'center',
            sortable: true,
            width: 100,
    },{
        field: 'k',  // 小写 e - 对应密码
            title: '图号',
            align: 'center',
            sortable: true,
            width: 100,
    },{
        field: 'l',  // 小写 e - 对应密码
            title: '单位',
            align: 'center',
            sortable: true,
            width: 100,
    },{
        field: 'm',  // 小写 e - 对应密码
            title: '数量',
            align: 'center',
            sortable: true,
            width: 100,
    },{
        field: 'n',  // 小写 e - 对应密码
            title: '单价',
            align: 'center',
            sortable: true,
            width: 100,
    },{
        field: 'o',  // 小写 e - 对应密码
            title: '金额',
            align: 'center',
            sortable: true,
            width: 100,
    },{
        field: 'p',  // 小写 e - 对应密码
            title: '材质',
            align: 'center',
            sortable: true,
            width: 100,
    },{
        field: 'q',  // 小写 e - 对应密码
            title: '重量',
            align: 'center',
            sortable: true,
            width: 100,
    },{
                field: 'r',  // 小写 e - 对应密码
                title: '退货原因',
                align: 'center',
                sortable: true,
                width: 100,
            },{
                field: 's',  // 小写 e - 对应密码
                title: '备注',
                align: 'center',
                sortable: true,
                width: 100,
            },{
                field: 't',  // 小写 e - 对应密码
                title: '地址',
                align: 'center',
                sortable: true,
                width: 100,
            },{
                field: 'u',  // 小写 e - 对应密码
                title: '客户签字',
                align: 'center',
                sortable: true,
                width: 100,
            },{
                field: 'v',  // 小写 e - 对应密码
                title: '电话',
                align: 'center',
                sortable: true,
                width: 100,
            }
        ],
        onClickRow: function (row, el) {
            let isSelect = $(el).hasClass('selected')
            if (isSelect) {
                $(el).removeClass('selected')
            } else {
                $(el).addClass('selected')
            }
        }
    });

    // 强制刷新表格视图
    $('#userTable').bootstrapTable('load', data);
    $('#userTable').bootstrapTable('resetView');
}


