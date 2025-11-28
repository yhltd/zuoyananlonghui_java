var idd;
function getList() {
    $('#name').val("");
    $('#power').val("");
    $.ajax({
        type: 'post',
        url: '/ywc/getList',
        success: function (res) {
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
                if (res.data && res.data.length > 0) {
                    let maxId = Math.max(...res.data.map(item => item.id));
                    idd = maxId;
                }
            }
        },
        error: function (xhr, status, error) {
            console.error('请求失败:', error);
        }
    });
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


    $('#select-btn').click(function () {
        var name = $('#name').val();
        console.log('查询条件 - 姓名:', name);

        $ajax({
            type: 'post',
            url: '/ywc/queryList',
            data: {
                name: name  // 只传递姓名参数
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

//     //点击新增按钮显示弹窗
//     $("#add-btn").click(function () {
//         $('#add-modal').modal('show');
//     });
//
// //新增弹窗里点击关闭按钮
//     $('#add-close-btn').click(function () {
//         $('#add-modal').modal('hide');
//     });
//
// //新增弹窗里点击提交按钮
//     $("#add-submit-btn").click(function () {
//         // 防止重复提交
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
//         // 手动构建参数，包含所有字段
//         let params = {
//             c: $('#add-c').val(),      // 业务单位
//             d: $('#add-d').val(),      // 合同号
//             e: $('#add-e').val(),      // 任务号
//             f: $('#add-f').val(),      // 工艺规程状态
//             g: $('#add-g').val(),      // 工序
//             h: $('#add-h').val(),      // 名称
//             i: $('#add-i').val(),      // 图号
//             j: $('#add-j').val(),      // 单位
//             k: $('#add-k').val(),      // 数量
//             l: $('#add-l').val(),      // 材质
//             m: $('#add-m').val(),      // 序合计
//             n: $('#add-n').val(),      // 重量
//             o: $('#add-o').val(),      // 工件
//             p: $('#add-p').val(),      // 单位元
//             q: $('#add-q').val(),      // 合计金额
//             r: $('#add-r').val(),      // 铣工时/40
//             s: $('#add-s').val(),      // 铣单价
//             t: $('#add-t').val(),      // 车工时/40
//             u: $('#add-u').val(),      // 车单价
//             v: $('#add-v').val(),      // 钳公式/40
//             w: $('#add-w').val(),      // 钳单位
//             x: $('#add-x').val(),      // 整件外委工时/57.6
//             y: $('#add-y').val(),      // 整件外委单位
//             z: $('#add-z').val(),      // 外委工时/48
//             aa: $('#add-aa').val(),    // 外委单价
//             ab: $('#add-ab').val(),    // 镗工时/73
//             ac: $('#add-ac').val(),    // 镗单价
//             ad: $('#add-ad').val(),    // 割工时/24
//             ae: $('#add-ae').val(),    // 割单价
//             af: $('#add-af').val(),    // 磨工时/42
//             ag: $('#add-ag').val(),    // 磨单价
//             ah: $('#add-ah').val(),    // 数控铣工时/69
//             ai: $('#add-ai').val(),    // 数控铣单价
//             aj: $('#add-aj').val(),    // 立车/71
//             ak: $('#add-ak').val(),    // 立车单价
//             al: $('#add-al').val(),    // 电火花/42
//             am: $('#add-am').val(),    // 电火花单价
//             an: $('#add-an').val(),    // 中走丝/38
//             ao: $('#add-ao').val(),    // 中走丝单价
//             ap: $('#add-ap').val(),    // 下料
//             aq: $('#add-aq').val(),    // 深孔钻
//             ar: $('#add-ar').val(),    // 回厂日期
//             as: $('#add-as').val(),    // 出厂日期
//             at: $('#add-at').val(),    // 订单要求交货时间
//             au: $('#add-au').val(),    // 铣
//             av: $('#add-av').val(),    // 车
//             aw: $('#add-aw').val(),    // 登记员
//             ax: $('#add-ax').val()     // 备注
//         };
//
//         console.log('前端输入的数据:', params);
//         console.log('发送的JSON数据:', JSON.stringify(params));
//
//         // 直接提交，不进行表单验证
//         $ajax({
//             type: 'post',
//             url: '/htjl/add',
//             data: JSON.stringify(params),
//             dataType: 'json',
//             contentType: 'application/json;charset=utf-8'
//         }, false, '', function (res) {
//             // 恢复按钮状态
//             $btn.data('submitting', false);
//             $btn.prop('disabled', false);
//             $btn.html(originalText);
//
//             console.log('服务器响应:', res);
//
//             if (res.code == 200) {
//                 swal("", res.msg, "success");
//                 $('#add-form')[0].reset();
//                 getList();
//                 $('#add-modal').modal('hide');
//             } else {
//                 swal("", res.msg, "error");
//             }
//         }, function(xhr, status, error) {
//             // 请求失败时也恢复按钮状态
//             $btn.data('submitting', false);
//             $btn.prop('disabled', false);
//             $btn.html(originalText);
//
//             console.error('请求失败详情:');
//             console.error('状态:', status);
//             console.error('错误:', error);
//             console.error('响应文本:', xhr.responseText);
//
//             swal("", "请求失败，请检查网络连接: " + error, "error");
//         });
//     });





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
                url: '/ywc/update',
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
                url: '/ywc/delete',
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
                field: 'f',
                title: '对账状态',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
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
            },{
                field: '',
                title: '出库单号',
                align: 'center',
                sortable: true,
                width: 100,
            },  {
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
            }, {
                field: 'q',
                title: '合计金额',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'r',
                title: '铣工时/40',
                align: 'center',
                sortable: true,
                width: 100,
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
            }, {
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
                width: 100,
            }, {
                field: 'y',
                title: '整件外委单位',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'z',
                title: '外委工时/48',
                align: 'center',
                sortable: true,
                width: 100,
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
            }, {
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
            }, {
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
            }, {
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
                width: 100,
            }, {
                field: 'ai',
                title: '数控铣单价',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'aj',
                title: '立车/71',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
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
                width: 100,
            }, {
                field: 'am',
                title: '电火花单价',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'an',
                title: '中走丝/38',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'ao',
                title: '中走丝单价',
                align: 'center',
                sortable: true,
                width: 100,
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
                width: 100,
            }, {
                field: 'au',
                title: '铣',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'av',
                title: '车',
                align: 'center',
                sortable: true,
                width: 100,
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


