// 全局变量存储列标题和乘数
var columnTitles = {
    'r': '铣工时/40',
    't': '车工时/40',
    'v': '钳公式/40'
};
var columnMultipliers = {
    'r': 40,
    't': 40,
    'v': 40
};


var idd;
// 在 htjl.js 文件中添加
function initTitleInputs() {
    // 初始化标题输入框的代码
    console.log("initTitleInputs 函数被调用");
    // 具体的初始化逻辑...
}
// function getList() {
//     $('#name').val("");
//     $('#power').val("");
//     $ajax({
//         type: 'post',
//         url: '/htjl/getList',
//     }, false, '', function (res) {
//         console.log('=== 调试信息开始 ===');
//         console.log('API响应状态:', res.code);
//         console.log('API响应消息:', res.msg);
//         console.log('完整响应数据:', res);
//         if (res.code == 200) {
//             setTable(res.data);
//             $("#userTable").colResizable({
//                 liveDrag: true,
//                 gripInnerHtml: "<div class='grip'></div>",
//                 draggingClass: "dragging",
//                 resizeMode: 'fit'
//             });
//             for (i=0;i<=res.data.id;i++){
//                 idd=i;
//             }
//         }
//     })
// }



function getList() {
    $('#name').val("");
    $('#power').val("");
    $ajax({
        type: 'post',
        url: '/htjl/getListExcludeThjl',  // 修改为新的接口
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
            // 移除有问题的循环，根据实际情况调整
            if (res.data && res.data.length > 0) {
                idd = res.data[res.data.length - 1].id;
            }
        }
    })
}

$(function () {
    getList();




    // 初始化标题输入框
    initTitleInputs();



    $('#select-btn').click(function () {
        var name = $('#name').val();
        var department = $('#department').val(); // 假设部门输入框的id是department
        console.log('查询条件 - 姓名:', name, '部门:', department);

        $ajax({
            type: 'post',
            url: '/htjl/queryList',
            data: {
                name: name,
                department: department  // 添加部门参数
            }
        }, true, '', function (res) {
            console.log('查询响应:', res);
            if (res.code == 200) {
                console.log('查询到的数据:', res.data);
                setTable(res.data);
                swal("查询成功", "找到 " + res.data.length + " 条记录", "success");
            } else {
                swal("查询失败", res.msg, "error");
            }
        })
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
            c: $('#add-c').val(),      // 业务单位
            d: $('#add-d').val(),      // 合同号
            e: $('#add-e').val(),      // 任务号
            f: $('#add-f').val(),      // 工艺规程状态
            g: $('#add-g').val(),      // 工序
            h: $('#add-h').val(),      // 名称
            i: $('#add-i').val(),      // 图号
            j: $('#add-j').val(),      // 单位
            k: $('#add-k').val(),      // 数量
            l: $('#add-l').val(),      // 材质
            m: $('#add-m').val(),      // 序合计
            n: $('#add-n').val(),      // 重量
            o: $('#add-o').val(),      // 工件
            p: $('#add-p').val(),      // 单位元
            q: $('#add-q').val(),      // 合计金额
            r: $('#add-r').val(),      // 铣工时/40
            s: $('#add-s').val(),      // 铣单价
            t: $('#add-t').val(),      // 车工时/40
            u: $('#add-u').val(),      // 车单价
            v: $('#add-v').val(),      // 钳公式/40
            w: $('#add-w').val(),      // 钳单位
            x: $('#add-x').val(),      // 整件外委工时/57.6
            y: $('#add-y').val(),      // 整件外委单位
            z: $('#add-z').val(),      // 外委工时/48
            aa: $('#add-aa').val(),    // 外委单价
            ab: $('#add-ab').val(),    // 镗工时/73
            ac: $('#add-ac').val(),    // 镗单价
            ad: $('#add-ad').val(),    // 割工时/24
            ae: $('#add-ae').val(),    // 割单价
            af: $('#add-af').val(),    // 磨工时/42
            ag: $('#add-ag').val(),    // 磨单价
            ah: $('#add-ah').val(),    // 数控铣工时/69
            ai: $('#add-ai').val(),    // 数控铣单价
            aj: $('#add-aj').val(),    // 立车/71
            ak: $('#add-ak').val(),    // 立车单价
            al: $('#add-al').val(),    // 电火花/42
            am: $('#add-am').val(),    // 电火花单价
            an: $('#add-an').val(),    // 中走丝/38
            ao: $('#add-ao').val(),    // 中走丝单价
            ap: $('#add-ap').val(),    // 下料
            aq: $('#add-aq').val(),    // 深孔钻
            ar: $('#add-ar').val(),    // 回厂日期
            as: $('#add-as').val(),    // 出厂日期
            at: $('#add-at').val(),    // 订单要求交货时间
            au: $('#add-au').val(),    // 铣
            av: $('#add-av').val(),    // 车
            aw: $('#add-aw').val(),    // 登记员
            ax: $('#add-ax').val()     // 备注
        };

        console.log('前端输入的数据:', params);
        console.log('发送的JSON数据:', JSON.stringify(params));

        // 直接提交，不进行表单验证
        $ajax({
            type: 'post',
            url: '/htjl/add',
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
            w: rowData.w,
            x: rowData.x,
            y: rowData.y,
            z: rowData.z,
            aa: rowData.aa,
            ab: rowData.ab,
            ac: rowData.ac,
            ad: rowData.ad,
            ae: rowData.ae,
            af: rowData.af,
            ag: rowData.ag,
            ah: rowData.ah,
            ai: rowData.ai,
            aj: rowData.aj,
            ak: rowData.ak,
            al: rowData.al,
            am: rowData.am,
            an: rowData.an,
            ao: rowData.ao,
            ap: rowData.ap,
            aq: rowData.aq,
            ar: rowData.ar,
            as: rowData.as,
            at: rowData.at,
            au: rowData.au,
            av: rowData.av,
            aw: rowData.aw,
            ax: rowData.ax,
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
            $('#update-c').val(selectedRow.c || '');  // 业务单位
            $('#update-d').val(selectedRow.d || '');  // 合同号
            $('#update-e').val(selectedRow.e || '');  // 任务号
            $('#update-f').val(selectedRow.f || '');  // 工艺规程状态
            $('#update-g').val(selectedRow.g || '');  // 工序
            $('#update-h').val(selectedRow.h || '');  // 名称
            $('#update-i').val(selectedRow.i || '');  // 图号
            $('#update-j').val(selectedRow.j || '');  // 单位
            $('#update-k').val(selectedRow.k || '');  // 数量
            $('#update-l').val(selectedRow.l || '');  // 材质
            $('#update-m').val(selectedRow.m || '');  // 序合计
            $('#update-n').val(selectedRow.n || '');  // 重量
            $('#update-o').val(selectedRow.o || '');  // 工件
            $('#update-p').val(selectedRow.p || '');  // 单位元
            $('#update-q').val(selectedRow.q || '');  // 合计金额
            $('#update-r').val(selectedRow.r || '');  // 铣工时/40
            $('#update-s').val(selectedRow.s || '');  // 铣单价
            $('#update-t').val(selectedRow.t || '');  // 车工时/40
            $('#update-u').val(selectedRow.u || '');  // 车单价
            $('#update-v').val(selectedRow.v || '');  // 钳公式/40
            $('#update-w').val(selectedRow.w || '');  // 钳单位
            $('#update-x').val(selectedRow.x || '');  // 整件外委工时/57.6
            $('#update-y').val(selectedRow.y || '');  // 整件外委单位
            $('#update-z').val(selectedRow.z || '');  // 外委工时/48
            $('#update-aa').val(selectedRow.aa || '');  // 外委单价
            $('#update-ab').val(selectedRow.ab || '');  // 镗工时/73
            $('#update-ac').val(selectedRow.ac || '');  // 镗单价
            $('#update-ad').val(selectedRow.ad || '');  // 割工时/24
            $('#update-ae').val(selectedRow.ae || '');  // 割单价
            $('#update-af').val(selectedRow.af || '');  // 磨工时/42
            $('#update-ag').val(selectedRow.ag || '');  // 磨单价
            $('#update-ah').val(selectedRow.ah || '');  // 数控铣工时/69
            $('#update-ai').val(selectedRow.ai || '');  // 数控铣单价
            $('#update-aj').val(selectedRow.aj || '');  // 立车/71
            $('#update-ak').val(selectedRow.ak || '');  // 立车单价
            $('#update-al').val(selectedRow.al || '');  // 电火花/42
            $('#update-am').val(selectedRow.am || '');  // 电火花单价
            $('#update-an').val(selectedRow.an || '');  // 中走丝/38
            $('#update-ao').val(selectedRow.ao || '');  // 中走丝单价
            $('#update-ap').val(selectedRow.ap || '');  // 下料
            $('#update-aq').val(selectedRow.aq || '');  // 深孔钻
            $('#update-ar').val(selectedRow.ar || '');  // 回厂日期
            $('#update-as').val(selectedRow.as || '');  // 出厂日期
            $('#update-at').val(selectedRow.at || '');  // 订单要求交货时间
            $('#update-au').val(selectedRow.au || '');  // 铣
            $('#update-av').val(selectedRow.av || '');  // 车
            $('#update-aw').val(selectedRow.aw || '');  // 登记员
            $('#update-ax').val(selectedRow.ax || '');  // 备注

            $('#id').val(selectedRow.id || '');  // 添加这一行！


            console.log('填充后的表单值:');
            console.log('业务单位:', $('#update-c').val());
            console.log('合同号:', $('#update-d').val());
            console.log('任务号:', $('#update-e').val());
            console.log('工艺规程状态:', $('#update-f').val());
            console.log('工序:', $('#update-g').val());
            console.log('名称:', $('#update-h').val());
            console.log('图号:', $('#update-i').val());
            console.log('单位:', $('#update-j').val());
            console.log('数量:', $('#update-k').val());
            console.log('材质:', $('#update-l').val());
            console.log('序合计:', $('#update-m').val());
            console.log('重量:', $('#update-n').val());
            console.log('工件:', $('#update-o').val());
            console.log('单位元:', $('#update-p').val());
            console.log('合计金额:', $('#update-q').val());
            console.log('铣工时/40:', $('#update-r').val());
            console.log('铣单价:', $('#update-s').val());
            console.log('车工时/40:', $('#update-t').val());
            console.log('车单价:', $('#update-u').val());
            console.log('钳公式/40:', $('#update-v').val());
            console.log('钳单位:', $('#update-w').val());
            console.log('整件外委工时/57.6:', $('#update-x').val());
            console.log('整件外委单位:', $('#update-y').val());
            console.log('外委工时/48:', $('#update-z').val());
            console.log('外委单价:', $('#update-aa').val());
            console.log('镗工时/73:', $('#update-ab').val());
            console.log('镗单价:', $('#update-ac').val());
            console.log('割工时/24:', $('#update-ad').val());
            console.log('割单价:', $('#update-ae').val());
            console.log('磨工时/42:', $('#update-af').val());
            console.log('磨单价:', $('#update-ag').val());
            console.log('数控铣工时/69:', $('#update-ah').val());
            console.log('数控铣单价:', $('#update-ai').val());
            console.log('立车/71:', $('#update-aj').val());
            console.log('立车单价:', $('#update-ak').val());
            console.log('电火花/42:', $('#update-al').val());
            console.log('电火花单价:', $('#update-am').val());
            console.log('中走丝/38:', $('#update-an').val());
            console.log('中走丝单价:', $('#update-ao').val());
            console.log('下料:', $('#update-ap').val());
            console.log('深孔钻:', $('#update-aq').val());
            console.log('回厂日期:', $('#update-ar').val());
            console.log('出厂日期:', $('#update-as').val());
            console.log('订单要求交货时间:', $('#update-at').val());
            console.log('铣:', $('#update-au').val());
            console.log('车:', $('#update-av').val());
            console.log('登记员:', $('#update-aw').val());
            console.log('备注:', $('#update-ax').val());



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
                c: $('#update-c').val(),  // 业务单位
                d: $('#update-d').val(),  // 合同号
                e: $('#update-e').val(),  // 任务号
                f: $('#update-f').val(),  // 工艺规程状态
                g: $('#update-g').val(),  // 工序
                h: $('#update-h').val(),  // 名称
                i: $('#update-i').val(),  // 图号
                j: $('#update-j').val(),  // 单位
                k: $('#update-k').val(),  // 数量
                l: $('#update-l').val(),  // 材质
                m: $('#update-m').val(),  // 序合计
                n: $('#update-n').val(),  // 重量
                o: $('#update-o').val(),  // 工件
                p: $('#update-p').val(),  // 单位元
                q: $('#update-q').val(),  // 合计金额
                r: $('#update-r').val(),  // 铣工时/40
                s: $('#update-s').val(),  // 铣单价
                t: $('#update-t').val(),  // 车工时/40
                u: $('#update-u').val(),  // 车单价
                v: $('#update-v').val(),  // 钳公式/40
                w: $('#update-w').val(),  // 钳单位
                x: $('#update-x').val(),  // 整件外委工时/57.6
                y: $('#update-y').val(),  // 整件外委单位
                z: $('#update-z').val(),  // 外委工时/48
                aa: $('#update-aa').val(),  // 外委单价
                ab: $('#update-ab').val(),  // 镗工时/73
                ac: $('#update-ac').val(),  // 镗单价
                ad: $('#update-ad').val(),  // 割工时/24
                ae: $('#update-ae').val(),  // 割单价
                af: $('#update-af').val(),  // 磨工时/42
                ag: $('#update-ag').val(),  // 磨单价
                ah: $('#update-ah').val(),  // 数控铣工时/69
                ai: $('#update-ai').val(),  // 数控铣单价
                aj: $('#update-aj').val(),  // 立车/71
                ak: $('#update-ak').val(),  // 立车单价
                al: $('#update-al').val(),  // 电火花/42
                am: $('#update-am').val(),  // 电火花单价
                an: $('#update-an').val(),  // 中走丝/38
                ao: $('#update-ao').val(),  // 中走丝单价
                ap: $('#update-ap').val(),  // 下料
                aq: $('#update-aq').val(),  // 深孔钻
                ar: $('#update-ar').val(),  // 回厂日期
                as: $('#update-as').val(),  // 出厂日期
                at: $('#update-at').val(),  // 订单要求交货时间
                au: $('#update-au').val(),  // 铣
                av: $('#update-av').val(),  // 车
                aw: $('#update-aw').val(),  // 登记员
                ax: $('#update-ax').val()   // 备注
            };

            console.log('提交的修改数据:', params);

            // 显示加载状态
            $(this).prop('disabled', true).text('提交中...');

            $.ajax({
                type: 'POST',
                url: '/htjl/update',
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
                url: '/htjl/delete',
                data: JSON.stringify({
                    idList: idList
                }),
                dataType: 'json',
                contentType: 'application/json;charset=utf-8'
            }, false, '', function (res) {
                if (res.code == 200) {
                    swal("", res.msg, "success");
                    getList();
                } else {
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
                field: 'c',
                title: '业务单位',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'd',
                title: '合同号',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'e',
                title: '任务号',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'zhuangtai',  // 字段名应该是实际的字段名，不是'未创建'
                title: '工艺规程状态',
                align: 'center',
                sortable: true,
                width: 100,
                formatter: function(value, row, index) {
                    // 如果状态字段有值，直接显示
                    if (value && value !== '未创建') {
                        return value;
                    }

                    // 获取K列和M列的值
                    var kValue = row.k;
                    var mValue = row.m;

                    // 先判断K列是否为空
                    if (kValue === null || kValue === undefined || kValue === '') {
                        return '未创建';
                    }

                    // 如果K列不为空，再进行比较
                    kValue = parseFloat(kValue) || 0;
                    mValue = parseFloat(mValue) || 0;

                    // 根据逻辑判断状态
                    if (kValue > mValue) {
                        return '未完成';
                    } else {
                        return '已完成';
                    }
                }
            },{
                field: 'g',
                title: '工序',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'h',
                title: '名称',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'i',
                title: '图号',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'j',
                title: '单位',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'k',
                title: '数量',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'l',
                title: '材质',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'm',
                title: '序合计',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'n',
                title: '重量',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'o',
                title: '工件',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'p',
                title: '单位元',
                align: 'center',
                sortable: true,
                width: 100,
                formatter: function(value, row, index) {
                    // 计算 s + u + w + y + aa + ac + ae + ag + ai + ak + am + ao 的总和
                    var sum = 0;

                    // 获取各个列的值并累加
                    var columns = ['s', 'u', 'w', 'y', 'aa', 'ac', 'ae', 'ag', 'ai', 'ak', 'am', 'ao'];

                    columns.forEach(function(field) {
                        var columnValue = row[field];
                        if (columnValue !== null && columnValue !== undefined && columnValue !== '') {
                            sum += parseFloat(columnValue) || 0;
                        }
                    });

                    // 返回计算结果，保留2位小数
                    return sum.toFixed(2);
                }
            }, {
                field: 'q',
                title: '合计金额',
                align: 'center',
                sortable: true,
                width: 100,
                formatter: function (value, row, index) {
                    var quantity = parseFloat(row.k) || 0; // 数量

                    // 重新计算单位元（和p列相同的逻辑）
                    var unitPrice = 0;
                    var priceColumns = ['s', 'u', 'w', 'y', 'aa', 'ac', 'ae', 'ag', 'ai', 'ak', 'am', 'ao'];

                    priceColumns.forEach(function(field) {
                        var columnValue = row[field];
                        if (columnValue !== null && columnValue !== undefined && columnValue !== '') {
                            unitPrice += parseFloat(columnValue) || 0;
                        }
                    });

                    if (quantity > 0 && unitPrice > 0) {
                        return (quantity * unitPrice).toFixed(2);
                    }
                    return '';
                }
            },{
                field: 'r',
                title: '铣工时/40',
                align: 'center',
                sortable: true,
                width: 100,
                formatter: function(value) {
                    if (value !== null && value !== undefined && value !== '') {
                        return (parseFloat(value) * columnMultipliers['r']).toFixed(2);
                    }
                    return value || '';
                }
            }, {
                field: 's',
                title: '铣单价',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 't',
                title: '车工时/40',
                align: 'center',
                sortable: true,
                width: 100,
                formatter: function(value) {
                    if (value !== null && value !== undefined && value !== '') {
                        return (parseFloat(value) * columnMultipliers['t']).toFixed(2);
                    }
                    return value || '';
                }
            },  {
                field: 'u',
                title: '车单价',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'v',
                title: '钳公式/40',
                align: 'center',
                sortable: true,
                width: 100,
                formatter: function(value) {
                    if (value !== null && value !== undefined && value !== '') {
                        return (parseFloat(value) * columnMultipliers['v']).toFixed(2);
                    }
                    return value || '';
                }
            }, {
                field: 'w',
                title: '钳单位',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'x',
                title: '整件外委工时/57.6',
                align: 'center',
                sortable: true,
                width: 150,
                formatter: function(value) {
                    if (value !== null && value !== undefined && value !== '') {
                        return (parseFloat(value) * columnMultipliers['x']).toFixed(2);
                    }
                    return value || '';
                }
            },  {
                field: 'y',
                title: '整件外委单位',
                align: 'center',
                sortable: true,
                width: 150,
            }, {
                field: 'z',
                title: '外委工时/48',
                align: 'center',
                sortable: true,
                width: 150,
                formatter: function(value) {
                    if (value !== null && value !== undefined && value !== '') {
                        return (parseFloat(value) * columnMultipliers['z']).toFixed(2);
                    }
                    return value || '';
                }
            }, {
                field: 'aa',
                title: '外委单价',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'ab',
                title: '镗工时/73',
                align: 'center',
                sortable: true,
                width: 100,
                formatter: function(value) {
                    if (value !== null && value !== undefined && value !== '') {
                        return (parseFloat(value) * columnMultipliers['ab']).toFixed(2);
                    }
                    return value || '';
                }
            },   {
                field: 'ac',
                title: '镗单价',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'ad',
                title: '割工时/24',
                align: 'center',
                sortable: true,
                width: 100,
                formatter: function(value) {
                    if (value !== null && value !== undefined && value !== '') {
                        return (parseFloat(value) * columnMultipliers['ad']).toFixed(2);
                    }
                    return value || '';
                }
            },  {
                field: 'ae',
                title: '割单价',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'af',
                title: '磨工时/42',
                align: 'center',
                sortable: true,
                width: 100,
                formatter: function(value) {
                    if (value !== null && value !== undefined && value !== '') {
                        return (parseFloat(value) * columnMultipliers['af']).toFixed(2);
                    }
                    return value || '';
                }
            },{
                field: 'ag',
                title: '磨单价',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'ah',
                title: '数控铣工时/69',
                align: 'center',
                sortable: true,
                width: 150,
                formatter: function(value) {
                    if (value !== null && value !== undefined && value !== '') {
                        return (parseFloat(value) * columnMultipliers['ah']).toFixed(2);
                    }
                    return value || '';
                }
            },{
                field: 'ai',
                title: '数控铣单价',
                align: 'center',
                sortable: true,
                width: 150,
            }, {
                field: 'aj',
                title: '立车/71',
                align: 'center',
                sortable: true,
                width: 100,
                formatter: function(value) {
                    if (value !== null && value !== undefined && value !== '') {
                        return (parseFloat(value) * columnMultipliers['aj']).toFixed(2);
                    }
                    return value || '';
                }
            },{
                field: 'ak',
                title: '立车单价',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'al',
                title: '电火花/42',
                align: 'center',
                sortable: true,
                width: 150,
                formatter: function(value) {
                    if (value !== null && value !== undefined && value !== '') {
                        return (parseFloat(value) * columnMultipliers['al']).toFixed(2);
                    }
                    return value || '';
                }
            },  {
                field: 'am',
                title: '电火花单价',
                align: 'center',
                sortable: true,
                width: 150,
            }, {
                field: 'an',
                title: '中走丝/38',
                align: 'center',
                sortable: true,
                width: 150,
                formatter: function(value) {
                    if (value !== null && value !== undefined && value !== '') {
                        return (parseFloat(value) * columnMultipliers['an']).toFixed(2);
                    }
                    return value || '';
                }
            }, {
                field: 'ao',
                title: '中走丝单价',
                align: 'center',
                sortable: true,
                width: 150,
            }, {
                field: 'ap',
                title: '下料',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'aq',
                title: '深孔钻',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'ar',
                title: '回厂日期',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'as',
                title: '出厂日期',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'at',
                title: '订单要求交货时间',
                align: 'center',
                sortable: true,
                width: 200,
            }, {
                field: 'au',
                title: '铣',
                align: 'center',
                sortable: true,
                width: 100,
                formatter: function(value, row, index) {
                    var quantity = parseFloat(row.k) || 0;
                    var rValue = parseFloat(row.r) || 0;
                    var calculatedR = rValue * columnMultipliers['r'];

                    if (quantity > 0 && calculatedR > 0) {
                        return (quantity * calculatedR).toFixed(2);
                    }
                    return '';
                }
            }, {
                field: 'av',
                title: '车',
                align: 'center',
                sortable: true,
                width: 100,
                formatter: function(value, row, index) {
                    var quantity = parseFloat(row.k) || 0;
                    var tValue = parseFloat(row.t) || 0;
                    var calculatedT = tValue * columnMultipliers['t'];

                    if (quantity > 0 && calculatedT > 0) {
                        return (quantity * calculatedT).toFixed(2);
                    }
                    return '';
                }
            }, {
                field: 'aw',
                title: '登记员',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'ax',
                title: '备注',
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
// ==================== 列标题编辑功能 ====================

// 应用单个列标题更改
function applyTitleChange(field) {
    try {
        var inputId = 'edit' + field.toUpperCase() + 'Title';
        var newTitle = document.getElementById(inputId).value;

        if (!newTitle || newTitle.trim() === '') {
            swal("警告", "标题不能为空！", "warning");
            return;
        }

        console.log('正在更新 ' + field + ' 列标题为: ' + newTitle);

        // 更新标题和乘数
        columnTitles[field] = newTitle;

        // 更新乘数映射
        var match = newTitle.match(/\/(\d+(\.\d+)?)$/);
        if (match && match[1]) {
            var newMultiplier = parseFloat(match[1]);
            columnMultipliers[field] = newMultiplier;

            // 刷新表格以应用新的标题和乘数
            refreshTableWithNewTitles();

            // 显示成功提示
            swal("成功", "已更新 " + field + " 列标题和乘数", "success");
        } else {
            swal("警告", "未检测到有效的乘数，请使用 列名/数字 格式（例如：铣工时/30）", "warning");
        }

    } catch (error) {
        console.error('更新列标题失败:', error);
        swal("错误", "更新失败: " + error.message, "error");
    }
}

// 刷新表格并更新标题
function refreshTableWithNewTitles() {
    var table = $('#userTable');

    // 更新表格列的标题
    var columns = table.bootstrapTable('getOptions').columns[0];
    columns.forEach(function(column) {
        if (column.field === 'r') {
            column.title = columnTitles['r'];
        } else if (column.field === 't') {
            column.title = columnTitles['t'];
        } else if (column.field === 'v') {
            column.title = columnTitles['v'];
        }
    });

    // 刷新表格
    table.bootstrapTable('refresh');
}

// 批量应用所有标题更改
function applyAllTitleChanges() {
    var fields = ['r', 't', 'v'];
    var updatedCount = 0;

    fields.forEach(function(field) {
        var inputId = 'edit' + field.toUpperCase() + 'Title';
        var inputElement = document.getElementById(inputId);
        if (inputElement && inputElement.value.trim() !== '') {
            var newTitle = inputElement.value;
            columnTitles[field] = newTitle;

            var match = newTitle.match(/\/(\d+(\.\d+)?)$/);
            if (match && match[1]) {
                columnMultipliers[field] = parseFloat(match[1]);
                updatedCount++;
            }
        }
    });

    if (updatedCount > 0) {
        refreshTableWithNewTitles();
        swal("成功", "已更新 " + updatedCount + " 个列的标题和乘数", "success");
    } else {
        swal("警告", "没有检测到有效的标题更新", "warning");
    }
}

// 重置所有标题为默认值
function resetAllTitles() {
    var defaultTitles = {
        'r': '铣工时/40',
        't': '车工时/40',
        'v': '钳公式/40'
    };

    // 重置输入框值
    Object.keys(defaultTitles).forEach(function(field) {
        var inputId = 'edit' + field.toUpperCase() + 'Title';
        var inputElement = document.getElementById(inputId);
        if (inputElement) {
            inputElement.value = defaultTitles[field];
        }
        columnTitles[field] = defaultTitles[field];
    });

    // 重置乘数映射
    columnMultipliers['r'] = 40;
    columnMultipliers['t'] = 40;
    columnMultipliers['v'] = 40;

    // 刷新表格
    setTimeout(function() {
        refreshTableWithNewTitles();
        swal("成功", "已重置所有标题和乘数为默认值", "success");
    }, 100);
}

// 初始化表格列配置
function initializeTableColumns() {
    return [
        {
            field: 'c',
            title: '业务单位',
            align: 'center',
            sortable: true,
            width: 100,
        }, {
            field: 'd',
            title: '合同号',
            align: 'center',
            sortable: true,
            width: 100,
        }, {
            field: 'e',
            title: '任务号',
            align: 'center',
            sortable: true,
            width: 100,
        }, {
            field: 'zhuangtai',
            title: '工艺规程状态',
            align: 'center',
            sortable: true,
            width: 100,
            formatter: function(value, row, index) {
                if (value && value !== '未创建') {
                    return value;
                }

                var kValue = row.k;
                var mValue = row.m;

                if (kValue === null || kValue === undefined || kValue === '') {
                    return '未创建';
                }

                kValue = parseFloat(kValue) || 0;
                mValue = parseFloat(mValue) || 0;

                if (kValue > mValue) {
                    return '未完成';
                } else {
                    return '已完成';
                }
            }
        },{
            field: 'g',
            title: '工序',
            align: 'center',
            sortable: true,
            width: 100,
        }, {
            field: 'h',
            title: '名称',
            align: 'center',
            sortable: true,
            width: 100,
        }, {
            field: 'i',
            title: '图号',
            align: 'center',
            sortable: true,
            width: 100,
        }, {
            field: 'j',
            title: '单位',
            align: 'center',
            sortable: true,
            width: 100,
        }, {
            field: 'k',
            title: '数量',
            align: 'center',
            sortable: true,
            width: 100,
        }, {
            field: 'l',
            title: '材质',
            align: 'center',
            sortable: true,
            width: 100,
        }, {
            field: 'm',
            title: '序合计',
            align: 'center',
            sortable: true,
            width: 100,
        }, {
            field: 'n',
            title: '重量',
            align: 'center',
            sortable: true,
            width: 100,
        }, {
            field: 'o',
            title: '工件',
            align: 'center',
            sortable: true,
            width: 100,
        }, {
            field: 'p',
            title: '单位元',
            align: 'center',
            sortable: true,
            width: 100,
            formatter: function(value, row, index) {
                var sum = 0;
                var columns = ['s', 'u', 'w', 'y', 'aa', 'ac', 'ae', 'ag', 'ai', 'ak', 'am', 'ao'];

                columns.forEach(function(field) {
                    var columnValue = row[field];
                    if (columnValue !== null && columnValue !== undefined && columnValue !== '') {
                        sum += parseFloat(columnValue) || 0;
                    }
                });

                return sum.toFixed(2);
            }
        }, {
            field: 'q',
            title: '合计金额',
            align: 'center',
            sortable: true,
            width: 100,
            formatter: function (value, row, index) {
                var quantity = parseFloat(row.k) || 0;
                var unitPrice = 0;
                var priceColumns = ['s', 'u', 'w', 'y', 'aa', 'ac', 'ae', 'ag', 'ai', 'ak', 'am', 'ao'];

                priceColumns.forEach(function(field) {
                    var columnValue = row[field];
                    if (columnValue !== null && columnValue !== undefined && columnValue !== '') {
                        unitPrice += parseFloat(columnValue) || 0;
                    }
                });

                if (quantity > 0 && unitPrice > 0) {
                    return (quantity * unitPrice).toFixed(2);
                }
                return '';
            }
        },{
            field: 'r',
            title: columnTitles['r'], // 使用动态标题
            align: 'center',
            sortable: true,
            width: 100,
            formatter: function(value) {
                if (value !== null && value !== undefined && value !== '') {
                    return (parseFloat(value) * columnMultipliers['r']).toFixed(2);
                }
                return value || '';
            }
        }, {
            field: 't',
            title: columnTitles['t'], // 使用动态标题
            align: 'center',
            sortable: true,
            width: 100,
            formatter: function(value) {
                if (value !== null && value !== undefined && value !== '') {
                    return (parseFloat(value) * columnMultipliers['t']).toFixed(2);
                }
                return value || '';
            }
        }, {
            field: 'v',
            title: columnTitles['v'], // 使用动态标题
            align: 'center',
            sortable: true,
            width: 100,
            formatter: function(value) {
                if (value !== null && value !== undefined && value !== '') {
                    return (parseFloat(value) * columnMultipliers['v']).toFixed(2);
                }
                return value || '';
            }
        }
        // ... 其他列配置
    ];

    $('#userTable').bootstrapTable('load', data);
    $('#userTable').bootstrapTable('resetView');
}



//
// // ==================== 退货单功能 ====================
// function initReturnOrder() {
//     $('#return-date').val(getCurrentDate());
//     bindReturnOrderEvents();
//     calculateTotalAmount();
// }
//
// function bindReturnOrderEvents() {
//     $('#select-all').click(function() {
//         $('.row-select').prop('checked', this.checked);
//     });
// // 保存退货单按钮点击事件
//     $("#save-return-btn").click(function () {
//
//         // 检测必填字段
//         var returnCustomer = $('#return-customer').val();
//         var returnDate = $('#return-date').val();
//         var returnNo = $('#return-no').val();
//         var returnPhone = $('#return-phone').val();
//
//         // 检测逻辑
//         if (!returnCustomer) {
//             swal("保存失败", "请填写退货客户", "error");
//             return;
//         }
//         if (!returnDate) {
//             swal("保存失败", "请选择退货日期", "error");
//             return;
//         }
//         if (!returnNo) {
//             swal("保存失败", "请生成退货单号", "error");
//             return;
//         }
//         if (!returnPhone) {
//             swal("保存失败", "请填写退货电话", "error");
//             return;
//         }
//
//         var $btn = $(this);
//         if ($btn.data('submitting')) {
//             return;
//         }
//         $btn.data('submitting', true);
//         $btn.prop('disabled', true);
//
//         var originalText = $btn.html();
//         $btn.html('<i class="bi bi-arrow-clockwise icon"></i>提交中...');
//
//         // 直接收集所有明细行的数据
//         var details = [];
//         $('#return-detail-table tbody tr').each(function(index) {
//             var $row = $(this);
//             var detail = {
//                 // 共用信息
//                 f: $('#return-no').val(),
//                 c: $('#return-customer').val(),
//                 d: $('#return-phone').val(),
//                 r: $('#company-address').val() ,
//                 t: $('#company-phone').val(),
//                 e: $('return-date').val(),
//                 s: $('#customer-signature').val(),
//                 // 明细特有信息
//                 q: $row.find('input[name="returnReason"]').val(),
//                 g: $row.find('input[name="contractNo"]').val(),
//                 h: $row.find('input[name="taskNo"]').val(),
//                 i: $row.find('input[name="productName"]').val(),
//                 j: $row.find('input[name="drawingNo"]').val(),
//                 k: $row.find('input[name="unit"]').val(),
//                 l: $row.find('input[name="quantity"]').val(),
//                 m: $row.find('input[name="unitPrice"]').val(),
//                 n: $row.find('input[name="amount"]').val(),
//                 o: $row.find('input[name="material"]').val(),
//                 p: $row.find('input[name="weight"]').val(),
//                 w: $row.find('input[name="returnDate"]').val(),
//                 u: $row.find('input[name="remark"]').val(),
//                 v: $row.data('original-id') || ''  // 从data属性获取原表id
//             };
//
//
//             details.push(detail);
//
//         });
//
//         console.log('要保存的退货单数据:', details);
//
//         // 遍历发送每个明细
//         var successCount = 0;
//         var totalCount = details.length;
//
//         details.forEach(function(detail, index) {
//             $ajax({
//                 type: 'post',
//                 url: '/htjl/save',
//                 data: JSON.stringify(detail),
//                 dataType: 'json',
//                 contentType: 'application/json;charset=utf-8'
//             }, false, '', function (res) {
//                 successCount++;
//
//                 if (successCount === totalCount) {
//                     $btn.data('submitting', false);
//                     $btn.prop('disabled', false);
//                     $btn.html(originalText);
//
//                     if (res.code == 200) {
//                         swal("", "保存成功，共插入 " + successCount + " 条数据", "success");
//                         // 清空表单
//                         $('#return-customer').val('');
//                         $('#return-phone').val('');
//                         $('#return-reason').val('');
//                         $('#customer-signature').val('');
//                         $('#return-detail-table tbody').empty();
//                         addReturnRow();
//                         calculateTotalAmount();
//                     } else {
//                         swal("", res.msg, "error");
//                     }
//                 }
//             }, function(xhr, status, error) {
//                 $btn.data('submitting', false);
//                 $btn.prop('disabled', false);
//                 $btn.html(originalText);
//                 swal("", "请求失败: " + error, "error");
//             });
//         });
//     });
//     $('#add-row-btn').click(function() {
//         addReturnRow();
//     });
//
//     $('#remove-row-btn').click(function() {
//         removeSelectedRows();
//     });
//
//     $('#generate-btn').click(function() {
//         generateReturnOrder();
//     });
//     $('#baocun-btn').click(function() {
//         tuihuojilu();
//     });
//
//     $('#print-btn').click(function() {
//         printReturnOrder();
//     });
//
//     $(document).on('input', 'input[name="quantity"], input[name="unitPrice"]', function() {
//         calculateRowAmount($(this).closest('tr'));
//         calculateTotalAmount();
//     });
//
//     $(document).on('change', '.row-select', function() {
//         updateSelectAllState();
//     });
// }
//
//
//
//
//
// function addReturnRow() {
//     var table = $('#return-detail-table tbody');
//     var rowCount = table.find('tr').length;
//     var newRow = `
//         <tr>
//             <td><input type="checkbox" class="row-select"></td>
//             <td>${rowCount + 1}</td>
//             <td><input type="text" class="form-control form-control-sm" name="contractNo"></td>
//             <td><input type="text" class="form-control form-control-sm" name="taskNo"></td>
//             <td><input type="text" class="form-control form-control-sm" name="productName"></td>
//             <td><input type="text" class="form-control form-control-sm" name="drawingNo"></td>
//             <td><input type="text" class="form-control form-control-sm" name="unit"></td>
//             <td><input type="number" class="form-control form-control-sm" name="quantity" value="1"></td>
//             <td><input type="number" class="form-control form-control-sm" name="unitPrice" value="0"></td>
//             <td><input type="number" class="form-control form-control-sm" name="amount" value="0" readonly></td>
//             <td><input type="text" class="form-control form-control-sm" name="material"></td>
//             <td><input type="text" class="form-control form-control-sm" name="weight"></td>
//             <td><input type="date" class="form-control form-control-sm" name="returnDate"></td>
//             <td><input type="text" class="form-control form-control-sm" name="returnReason"></td>
//             <td><input type="text" class="form-control form-control-sm" name="remark"></td>
//         </tr>
//     `;
//     table.append(newRow);
//     updateRowNumbers();
// }
//
// function removeSelectedRows() {
//     var selectedRows = $('.row-select:checked');
//     if (selectedRows.length === 0) {
//         alert('请选择要删除的行');
//         return;
//     }
//
//     if (confirm('确定要删除选中的行吗？')) {
//         selectedRows.each(function() {
//             $(this).closest('tr').remove();
//         });
//         updateRowNumbers();
//         calculateTotalAmount();
//     }
// }
//
// function updateRowNumbers() {
//     $('#return-detail-table tbody tr').each(function(index) {
//         $(this).find('td:eq(1)').text(index + 1);
//     });
// }
//
// function calculateRowAmount(row) {
//     var quantity = parseFloat(row.find('input[name="quantity"]').val()) || 0;
//     var unitPrice = parseFloat(row.find('input[name="unitPrice"]').val()) || 0;
//     var amount = quantity * unitPrice;
//     row.find('input[name="amount"]').val(amount.toFixed(2));
//     return amount;
// }
//
// function calculateTotalAmount() {
//     var total = 0;
//     $('#return-detail-table tbody tr').each(function() {
//         total += calculateRowAmount($(this));
//     });
//
//     $('#total-amount').text(total.toFixed(2));
//     $('#total-amount-chinese').text(numberToChinese(total));
// }
//
// function numberToChinese(num) {
//     if (num === 0) return '零元整';
//
//     var chineseNum = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
//     var chineseUnit = ['', '拾', '佰', '仟'];
//     var bigUnit = ['', '万', '亿'];
//
//     var numStr = Math.round(num * 100).toString();
//     var integerPart = numStr.slice(0, -2) || '0';
//     var decimalPart = numStr.slice(-2);
//
//     var integerChinese = '';
//     var integerArray = integerPart.split('').reverse();
//
//     for (var i = 0; i < integerArray.length; i++) {
//         var digit = parseInt(integerArray[i]);
//         var unit = chineseUnit[i % 4];
//         var bigUnitIndex = Math.floor(i / 4);
//         var bigUnitChar = bigUnit[bigUnitIndex];
//
//         if (digit === 0) {
//             if (integerChinese.charAt(0) !== '零' && i % 4 !== 0) {
//                 integerChinese = '零' + integerChinese;
//             }
//         } else {
//             integerChinese = chineseNum[digit] + unit + bigUnitChar + integerChinese;
//         }
//     }
//
//     var decimalChinese = '';
//     var jiao = parseInt(decimalPart.charAt(0)) || 0;
//     var fen = parseInt(decimalPart.charAt(1)) || 0;
//
//     if (jiao > 0) {
//         decimalChinese += chineseNum[jiao] + '角';
//     }
//     if (fen > 0) {
//         decimalChinese += chineseNum[fen] + '分';
//     }
//
//     var result = integerChinese + '元';
//     if (decimalChinese) {
//         result += decimalChinese;
//     } else {
//         result += '整';
//     }
//
//     return result;
// }
//
// function updateSelectAllState() {
//     var allChecked = $('.row-select:checked').length === $('.row-select').length;
//     $('#select-all').prop('checked', allChecked);
// }
//
// function generateReturnOrder() {
//
//     let rows = getTableSelection('#userTable');
//     if (rows.length == 0) {
//         swal('请选择要生成退货单的数据!');
//         return;
//     }
//
//     console.log('选中的行数据:', rows);
//
//     // 清空现有退货单数据（保留第一行）
//     $('#return-detail-table tbody tr:gt(0)').remove();
//
//     // 填充退货单数据
//     rows.forEach(function(selectedRow, index) {
//         let rowData = selectedRow.data;
//         console.log('第' + (index + 1) + '行数据:', rowData);
//
//         if (index === 0) {
//             // 第一行使用现有行
//             fillReturnRowData($('#return-detail-table tbody tr:first'), rowData);
//         } else {
//             // 添加新行并填充数据
//             addReturnRow();
//             var newRow = $('#return-detail-table tbody tr:last');
//             fillReturnRowData(newRow, rowData);
//         }
//     });
//
//     // 更新退货单头部信息（使用第一个选中行的信息）
//     if (rows.length > 0) {
//         let firstRow = rows[0].data;
//         $('#return-customer').val(firstRow.c || '');
//         $('#return-phone').val(firstRow.phone || '');
//
//         // 生成退货单号（根据当前时间）
//         $('#return-no').val(generateReturnNo());
//
//         // 设置当前日期为退货日期
//         $('#return-date').val(getCurrentDate());
//     }
//
//     // 计算总金额
//     calculateTotalAmount();
//
//     $('#return-modal').modal('show');
//     swal("生成成功", "已生成 " + rows.length + " 条退货单数据", "success");
// }
// // 填充退货单行数据
// function fillReturnRowData($row, rowData) {
//     $row.find('input[name="contractNo"]').val(rowData.d || '');
//     $row.find('input[name="taskNo"]').val(rowData.e || '');
//     $row.find('input[name="productName"]').val(rowData.h || '');
//     $row.find('input[name="drawingNo"]').val(rowData.i || '');
//     $row.find('input[name="unit"]').val(rowData.j || '');
//     $row.find('input[name="quantity"]').val(rowData.k || '1');
//     $row.find('input[name="unitPrice"]').val(rowData.p || '0');
//     $row.find('input[name="material"]').val(rowData.l || '');
//     $row.find('input[name="weight"]').val(rowData.n || '');
//     $row.find('input[name="remark"]').val(rowData.ax || '');
// // 设置隐藏的原表id
//     $row.data('original-id', rowData.id);  // 将原表id存储在data属性中
//     // 计算金额
//     calculateRowAmount($row);
// }
//
// // 简化版 - 纯前端生成退货单号
// function generateReturnNo() {
//     $ajax({
//         type: 'post',
//         url: '/htjl/getddh',
//     }, false, '', function (res) {
//         if (res.code == 200) {
//             var now = new Date();
//             var dateStr = now.getFullYear() +
//                 String(now.getMonth() + 1).padStart(2, '0') +
//                 String(now.getDate()).padStart(2, '0');
//             maxNo = res.data;  // 注意：这里是小写 f，但数据库字段是大写 F
//             var newReturnNo;
//
//             if (!maxNo || maxNo === '') {
//                 newReturnNo = "No:" + dateStr + "0001";
//             } else {
//                 var numberPart = maxNo.split(":")[1];
//                 var nextNum = parseInt(numberPart) + 1;
//                 newReturnNo = "No:" + nextNum;
//             }
//
//             // 直接填入输入框
//             $('#return-no').val(newReturnNo);
//             console.log('退货单号已更新:', newReturnNo);
//
//         } else {
//             console.error('获取单号失败');
//             // 失败时生成临时单号
//             var tempNo = "No:" + new Date().getTime();
//             $('#return-no').val(tempNo);
//         }
//     });  // 这里添加了缺少的右括号
// }
//
// function getCurrentDate() {
//     var now = new Date();
//     var year = now.getFullYear();
//     var month = String(now.getMonth() + 1).padStart(2, '0');
//     var day = String(now.getDate()).padStart(2, '0');
//     return year + '-' + month + '-' + day;
// }
//
// function printReturnOrder() {
//     alert('打印功能开发中...');
// }




















// ==================== 出库单单功能 ====================
// 跳转到出库单页面功能
function gotoReturnOrderPage() {
    let rows = getTableSelection('#userTable');
    if (rows.length == 0) {
        swal('请先选择数据', '请在表格中选择要生成出库单的数据', 'info');
        return false;
    }

    console.log('选中的行数据:', rows);


    // 筛选符合条件的数据（f字段为"已完成"）
    let validRows = rows.filter(function(selectedRow) {
        let rowData = selectedRow.data;
// 方法1：直接从数据中获取状态
        let processStatus = rowData.zhuangtai || '';

        // 方法2：如果方法1不行，重新计算状态（和表格中一样的逻辑）
        if (!processStatus || processStatus === '未创建') {
            let kValue = parseFloat(rowData.k) || 0;
            let mValue = parseFloat(rowData.m) || 0;

            if (rowData.k === null || rowData.k === undefined || rowData.k === '') {
                processStatus = '未创建';
            } else if (kValue > mValue) {
                processStatus = '未完成';
            } else {
                processStatus = '已完成';
            }
        }        let isValid = processStatus === '已完成';

        console.log('行数据工艺状态:', processStatus, '是否有效:', isValid);
        return isValid;
    });

    if (validRows.length === 0) {
        swal('生成失败', '选中的行中没有工艺规程状态为"已完成"的数据!', 'error');
        return false;
    }



    // 提取所有选中行的ID
    // const selectedIds = rows.map(row => row.data.id);
    const selectedIds = validRows.map(row => row.data.id);
    console.log('所有选中的ID:', selectedIds);

    const params = {
        ids: selectedIds.join(','), // 用逗号分隔多个ID
        count: rows.length,
        source: 'main',
        timestamp: Date.now()
    };

    const queryString = new URLSearchParams(params).toString();
    const targetUrl = 'spmc.html?' + queryString;

    console.log('跳转URL:', targetUrl);
    window.open(targetUrl, '_blank');

    return true;
}

// 绑定按钮点击事件
$(document).ready(function() {
    // 在现有的初始化代码中添加
    $('#goto-return-btn').click(function() {
        gotoReturnOrderPage();
    });

    // // 也可以修改现有的生成按钮，让它也使用跳转功能
    // $('#generate-btn1').click(function() {
    //     gotoReturnOrderPage();
    // });
});








// // 根据ID查询单条记录
// function getById(id) {
//     console.log('根据ID查询:', id);
//     alert(222)
//
//     $ajax({
//         type: 'post',
//         url: '/htjl/getById',
//         data: {
//             id: id  // 传递ID参数
//         }
//     }, true, '', function (res) {
//         console.log('单条记录查询响应:', res);
//         if (res.code == 200) {
//             console.log('查询到的数据:', res.data);
//             alert(res.data[0].id)
//             // 这里可以处理单条数据，比如填充表单或显示详情
//             showDetail(res.data);
//             swal("查询成功", "找到对应记录", "success");
//         } else {
//             swal("查询失败", res.msg, "error");
//         }
//     })
// }
//
// // 显示详情的方法示例
// function showDetail(data) {
//     // 根据你的页面结构填充数据
//     // 例如：
//     // $('#detailId').val(data.id);
//     // $('#detailName').val(data.c); // 假设c字段是姓名
//     // ... 其他字段
//     console.log('显示详情:', data);
// }
//
// // 在需要的地方调用，比如点击表格行时
// $('#dataTable').on('click', 'tr', function() {
//     var id = $(this).data('id'); // 假设行上有data-id属性
//     if (id) {
//         getById(id);
//     }
// });
//
//
//
//
//
//
//
//
// // 根据多个ID查询
// function getByIds(ids) {
//     console.log('根据多个ID查询:', ids);
//     alert(111)
//
//     $ajax({
//         type: 'post',
//         url: '/htjl/getByIds',
//         data: {
//             ids: ids.join(',')  // 将数组转换为逗号分隔的字符串
//         }
//     }, true, '', function (res) {
//         console.log('多条记录查询响应:', res);
//         alert(res.data[0].id)
//         if (res.code == 200) {
//             console.log('查询到的数据:', res.data);
//             alert(res.data[0].id)
//             setTable(res.data); // 更新表格
//             swal("查询成功", "找到 " + res.data.length + " 条记录", "success");
//         } else {
//             swal("查询失败", res.msg, "error");
//         }
//     })
// }




// // 填充表格数据的函数
// function setTable1(data) {
//     var tableBody = $('#return-detail-table1 tbody');
//     tableBody.empty(); // 清空现有数据
//
//     if (!data || data.length === 0) {
//         // 如果没有数据，显示空行
//         tableBody.append(`
//             <tr>
//                 <td colspan="14" class="text-center">暂无数据</td>
//             </tr>
//         `);
//         return;
//     }
//
//     // 遍历数据并生成表格行
//     data.forEach(function(item, index) {
//         var row = `
//             <tr>
//                 <td><input type="checkbox" class="row-select"></td>
//                 <td><input type="text" class="form-control form-control-sm" name="xuhao" value="${index + 1}" contenteditable="false"></td>
//                 <td><input type="text" class="form-control form-control-sm" name="contractNo" value="${item.contractNo || ''}" contenteditable="false"></td>
//                 <td><input type="text" class="form-control form-control-sm" name="taskNo" value="${item.taskNo || ''}" contenteditable="false"></td>
//                 <td><input type="text" class="form-control form-control-sm" name="gongxu" value="${item.gongxu || ''}" contenteditable="false"></td>
//                 <td><input type="text" class="form-control form-control-sm" name="productName" value="${item.productName || ''}" contenteditable="false"></td>
//                 <td><input type="text" class="form-control form-control-sm" name="drawingNo" value="${item.drawingNo || ''}" contenteditable="false"></td>
//                 <td><input type="text" class="form-control form-control-sm" name="unit" value="${item.unit || ''}" contenteditable="false"></td>
//                 <td><input type="number" class="form-control form-control-sm" name="quantity" value="${item.quantity || ''}" contenteditable="false"></td>
//                 <td><input type="number" class="form-control form-control-sm" name="unitPrice" value="${item.unitPrice || ''}" contenteditable="false"></td>
//                 <td><input type="number" class="form-control form-control-sm" name="amount" value="${item.amount || ''}" contenteditable="false"></td>
//                 <td><input type="text" class="form-control form-control-sm" name="material" value="${item.material || ''}" contenteditable="false"></td>
//                 <td><input type="text" class="form-control form-control-sm" name="weight" value="${item.weight || ''}" contenteditable="false"></td>
//                 <td><input type="text" class="form-control form-control-sm" name="remark" value="${item.remark || ''}" contenteditable="false"></td>
//             </tr>
//         `;
//         tableBody.append(row);
//     });
// }
//
// // 字段映射函数（根据你的API返回字段调整）
// function mapDataFields(apiData) {
//     return apiData.map(function(item) {
//         return {
//             contractNo: item.contractNo || item.htbh || '', // 合同号
//             taskNo: item.taskNo || item.rwh || '', // 任务号
//             gongxu: item.gongxu || item.jggx || '', // 加工工序
//             productName: item.productName || item.cpmc || '', // 产品名称
//             drawingNo: item.drawingNo || item.th || '', // 图号
//             unit: item.unit || item.dw || '', // 单位
//             quantity: item.quantity || item.sl || '', // 数量
//             unitPrice: item.unitPrice || item.dj || '', // 单价
//             amount: item.amount || item.je || '', // 金额
//             material: item.material || item.cz || '', // 材质
//             weight: item.weight || item.zl || '', // 重量
//             remark: item.remark || item.bz || '' // 备注
//         };
//     });
// }
//
// // 全选功能
// $('#select-all1').change(function() {
//     var isChecked = $(this).prop('checked');
//     $('#return-detail-table1 .row-select').prop('checked', isChecked);
// });
//
// // 使用示例
// function loadData() {
//     $ajax({
//         type: 'post',
//         url: '/your-api-url', // 替换为你的API地址
//         data: {
//             // 你的查询参数
//         }
//     }, true, '', function (res) {
//         console.log('查询响应:', res);
//         if (res.code == 200) {
//             console.log('查询到的数据:', res.data);
//
//             // 如果字段名不匹配，先进行映射
//             var mappedData = mapDataFields(res.data);
//
//             // 填充表格
//             setTable(mappedData);
//
//             swal("查询成功", "找到 " + res.data.length + " 条记录", "success");
//         } else {
//             swal("查询失败", res.msg, "error");
//         }
//     });
// }
//
// // 页面加载完成后初始化
// $(document).ready(function() {
//     // 绑定全选事件
//     $('#select-all1').change(function() {
//         var isChecked = $(this).prop('checked');
//         $('#return-detail-table1 .row-select').prop('checked', isChecked);
//     });
// });