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

            console.log('查询条件:', {
                ksrq: ksrq,
                jsrq: jsrq,
                h: h,
                i: i,
                k: k,
                r: r
            });

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
                    swal("查询成功", "找到 " + res.data.length + " 条记录", "success");
                } else {
                    swal("查询失败", res.msg, "error");
                }
            })
        });
    });

    $("#refresh-btn").click(function () {
        getList();
        swal("刷新成功", "已显示所有数据", "success");
    });

    $("#add-btn").click(function () {
        $('#add-modal').modal('show');
    });

    $('#add-close-btn').click(function () {
        $('#add-modal').modal('hide');
    });

    $('#update-close-btn').click(function () {
        $('#update-modal').modal('hide');
    });

    // 修改这里：根据映射关系调整新增表单的字段
    $("#add-submit-btn").click(function () {
        var $btn = $(this);
        if ($btn.data('submitting')) {
            return;
        }
        $btn.data('submitting', true);
        $btn.prop('disabled', true);

        var originalText = $btn.html();
        $btn.html('<i class="bi bi-arrow-clockwise icon"></i>提交中...');

        // 修正字段映射：
        // e: 退货日期, f: 退货单号, w: 回厂日期
        let params = {
            c: $('#add-c').val(),      // 退货客户
            d: $('#add-d').val(),      // 退货电话
            e: $('#add-e').val(),      // 退货日期 (正确)
            f: $('#add-f').val(),      // 退货单号 (正确)
            w: $('#add-w').val(),      // 回厂日期 (新增字段)
            g: $('#add-g').val(),      // 合同号
            h: $('#add-h').val(),      // 任务号
            i: $('#add-i').val(),      // 产品名称
            j: $('#add-j').val(),      // 图号
            k: $('#add-k').val(),      // 单位
            l: $('#add-l').val(),      // 数量
            m: $('#add-m').val(),      // 单价
            n: $('#add-n').val(),      // 金额
            o: $('#add-o').val(),      // 材质
            p: $('#add-p').val(),      // 重量
            q: $('#add-q').val(),      // 退货原因
            r: $('#add-r').val(),      // 地址
            s: $('#add-s').val(),      // 客户签字
            t: $('#add-t').val(),      // 电话
            u: $('#add-u').val(),      // 备注
            // v: $('#add-v').val()       // 空字段
        };

        console.log('新增数据:', params);

        $ajax({
            type: 'post',
            url: '/thjl/add',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: 'application/json;charset=utf-8'
        }, false, '', function (res) {
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

    $('#update-btn').click(function () {
        let rows = getTableSelection('#userTable');
        if (rows.length > 1 || rows.length == 0) {
            swal('请选择一条数据修改!');
            return;
        }

        let selectedRow = rows[0];
        console.log('选中的行数据:', selectedRow);

        let rowData = selectedRow.data;
        console.log('实际数据对象:', rowData);

        // 修正：添加 w 字段（回厂日期）
        window.selectedUserData = {
            c: rowData.c,
            d: rowData.d,
            e: rowData.e,  // 退货日期
            f: rowData.f,  // 退货单号
            w: rowData.w,  // 回厂日期 (新增)
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
            // v: rowData.v,
            id: rowData.id
        };

        console.log('存储的数据:', window.selectedUserData);

        $('#update-modal').modal('show');
    });

    $('#update-modal').on('shown.bs.modal', function () {
        if (window.selectedUserData) {
            console.log('读取的数据:', window.selectedUserData);

            let selectedRow = window.selectedUserData;

            // 修正：更新表单字段映射
            $('#update-c').val(selectedRow.c || '');  // 退货客户
            $('#update-d').val(selectedRow.d || '');  // 退货电话
            $('#update-e').val(selectedRow.e || '');  // 退货日期 (正确)
            $('#update-f').val(selectedRow.f || '');  // 退货单号 (正确)
            $('#update-w').val(selectedRow.w || '');  // 回厂日期 (新增字段)
            $('#update-g').val(selectedRow.g || '');  // 合同号
            $('#update-h').val(selectedRow.h || '');  // 任务号
            $('#update-i').val(selectedRow.i || '');  // 产品名称
            $('#update-j').val(selectedRow.j || '');  // 图号
            $('#update-k').val(selectedRow.k || '');  // 单位
            $('#update-l').val(selectedRow.l || '');  // 数量
            $('#update-m').val(selectedRow.m || '');  // 单价
            $('#update-n').val(selectedRow.n || '');  // 金额
            $('#update-o').val(selectedRow.o || '');  // 材质
            $('#update-p').val(selectedRow.p || '');  // 重量
            $('#update-q').val(selectedRow.q || '');  // 退货原因
            $('#update-r').val(selectedRow.r || '');  // 地址
            $('#update-s').val(selectedRow.s || '');  // 客户签字
            $('#update-t').val(selectedRow.t || '');  // 电话
            $('#update-u').val(selectedRow.u || '');  // 备注
            // $('#update-v').val(selectedRow.v || '');  // 空字段

            $('#id').val(selectedRow.id || '');

            console.log('填充后的表单值:');
            console.log('退货日期:', $('#update-e').val());
            console.log('退货单号:', $('#update-f').val());
            console.log('回厂日期:', $('#update-w').val());

            window.selectedUserData = null;
        }
    });

    // 修改这里：根据映射关系调整修改表单的字段
    $('#update-submit-btn').click(function () {
        var msg = confirm("确认要修改吗？");
        console.log("msg", msg);
        if (msg) {
            // 修正字段映射
            let params = {
                id: $('#id').val(),
                c: $('#update-c').val(),  // 退货客户
                d: $('#update-d').val(),  // 退货电话
                e: $('#update-e').val(),  // 退货日期 (正确)
                f: $('#update-f').val(),  // 退货单号 (正确)
                w: $('#update-w').val(),  // 回厂日期 (新增)
                g: $('#update-g').val(),  // 合同号
                h: $('#update-h').val(),  // 任务号
                i: $('#update-i').val(),  // 产品名称
                j: $('#update-j').val(),  // 图号
                k: $('#update-k').val(),  // 单位
                l: $('#update-l').val(),  // 数量
                m: $('#update-m').val(),  // 单价
                n: $('#update-n').val(),  // 金额
                o: $('#update-o').val(),  // 材质
                p: $('#update-p').val(),  // 重量
                q: $('#update-q').val(),  // 退货原因
                r: $('#update-r').val(),  // 地址
                s: $('#update-s').val(),  // 客户签字
                t: $('#update-t').val(),  // 电话
                u: $('#update-u').val(),  // 备注
                // v: $('#update-v').val()   // 空字段
            };

            console.log('提交的修改数据:', params);

            $(this).prop('disabled', true).text('提交中...');

            $.ajax({
                type: 'POST',
                url: '/thjl/update',
                data: JSON.stringify(params),
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                success: function (res) {
                    console.log('服务器响应:', res);

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

                    $('#update-submit-btn').prop('disabled', false).text('提交');

                    swal("", "请求失败，请检查网络连接或联系管理员", "error");
                }
            });
        }
    });

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
    if ($('#userTable').length === 0) {
        console.error('表格元素 #userTable 不存在');
        return;
    }

    if ($('#userTable').hasClass('bootstrap-table')) {
        $('#userTable').bootstrapTable('destroy');
    }

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
            { field: 'c', title: '退货客户', align: 'center', sortable: true, width: 100 },
            { field: 'd', title: '退货电话', align: 'center', sortable: true, width: 100 },
            { field: 'e', title: '退货日期', align: 'center', sortable: true, width: 100 },
            { field: 'f', title: '退货单号', align: 'center', sortable: true, width: 100 },
            { field: 'w', title: '回厂日期', align: 'center', sortable: true, width: 100 },
            { field: 'g', title: '合同号', align: 'center', sortable: true, width: 100 },
            { field: 'h', title: '任务号', align: 'center', sortable: true, width: 100 },
            { field: 'i', title: '产品名称', align: 'center', sortable: true, width: 100 },
            { field: 'j', title: '图号', align: 'center', sortable: true, width: 100 },
            { field: 'k', title: '单位', align: 'center', sortable: true, width: 100 },
            { field: 'l', title: '数量', align: 'center', sortable: true, width: 100 },
            { field: 'm', title: '单价', align: 'center', sortable: true, width: 100 },
            { field: 'n', title: '金额', align: 'center', sortable: true, width: 100 },
            { field: 'o', title: '材质', align: 'center', sortable: true, width: 100 },
            { field: 'p', title: '重量', align: 'center', sortable: true, width: 100 },
            { field: 'q', title: '退货原因', align: 'center', sortable: true, width: 100 },
            { field: 'r', title: '地址', align: 'center', sortable: true, width: 100 },
            { field: 's', title: '客户签字', align: 'center', sortable: true, width: 100 },
            { field: 't', title: '电话', align: 'center', sortable: true, width: 100 },
            { field: 'u', title: '备注', align: 'center', sortable: true, width: 100 }
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

    $('#userTable').bootstrapTable('load', data);
    $('#userTable').bootstrapTable('resetView');
}

