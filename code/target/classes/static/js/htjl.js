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

var currentTableData = [];


var idd;
// 在 htjl.js 文件中添加
function initTitleInputs() {
    // 初始化标题输入框的代码
    console.log("initTitleInputs 函数被调用");
    // 具体的初始化逻辑...
}

function getList() {
    $('#name').val("");
    $('#power').val("");
    $ajax({
        type: 'post',
        url: '/htjl/getListExcludeThjl',
    }, false, '', function (res) {
        if (res.code == 200) {
            // 保存数据到全局变量
            currentTableData = res.data;
            setTable(currentTableData);
            $("#userTable").colResizable({
                liveDrag: true,
                gripInnerHtml: "<div class='grip'></div>",
                draggingClass: "dragging",
                resizeMode: 'fit'
            });
            if (res.data && res.data.length > 0) {
                idd = res.data[res.data.length - 1].id;
            }
        }
    })
}


$(function () {
    getList();

    $('#goto-return-btn').click(function(e) {
        e.preventDefault();
        console.log('跳转到出库单按钮被点击');
        gotoReturnOrderPage();
    });

    initReturnOrder();


    // 初始化标题输入框
    initTitleInputs();



    // 修改查询按钮点击事件
    $('#select-btn').click(function() {
        var name = $('#name').val().trim();
        var processStatus = $('#department').val().trim(); // 改为 processStatus

        console.log('查询条件 - 业务单位:', name, '工艺规程状态:', processStatus);

        if (currentTableData.length === 0) {
            swal("提示", "请先加载数据", "info");
            return;
        }

        // 前端过滤数据
        var filteredData = filterTableData(name, processStatus);
        console.log('过滤后的数据:', filteredData);

        // 更新表格
        setTable(filteredData);
        swal("查询成功", "找到 " + filteredData.length + " 条记录", "success");
    });


    // 修复过滤函数
    function filterTableData(name, processStatus) {
        if (!name && !processStatus) {
            return currentTableData;
        }

        return currentTableData.filter(function(item) {
            var matchName = true;
            var matchStatus = true;

            // 按业务单位过滤 (c字段)
            if (name) {
                var itemName = (item.c || '').toString().toLowerCase();
                matchName = itemName.includes(name.toLowerCase());
            }

            // 按工艺规程状态过滤
            if (processStatus) {
                // 计算当前行的工艺规程状态（与表格显示逻辑一致）
                var currentStatus = calculateProcessStatus(item);
                matchStatus = currentStatus.includes(processStatus);
            }

            return matchName && matchStatus;
        });
    }

    // 添加状态计算函数（与表格格式化函数保持一致）
    function calculateProcessStatus(row) {
        // 如果已经有状态值，直接返回
        if (row.zhuangtai && row.zhuangtai !== '未创建') {
            return row.zhuangtai;
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


    // 修改刷新按钮，重置查询条件并显示所有数据
    $("#refresh-btn").click(function () {
        // 清空查询条件
        $('#name').val("");
        $('#department').val("");

        getList();

        // 显示所有数据
        // setTable(currentTableData);
        swal("刷新成功", "已显示所有数据", "success");
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
            hetongzhuangtai: $('#add-f').val(),       // 工艺规程状态
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
            $('#update-f').val(selectedRow.hetongzhuangtai || '');  // 工艺规程状态
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
                hetongzhuangtai: $('#update-f').val(),
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
                    swal("删除成功！");
                    getList();
                }else if(res.code == 403){
                    swal("删除失败,权限不足,管理员权限可以删除");
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
        clickToSelect: false, // 禁用默认的点击选择
        locale: 'zh-CN',
        rowAttributes: function(row, index) {
            return {
                'data-index': index,
                'data-id': row.id
            };
        },
        columns: [
            {
                field: 'c',
                title: '业务单位',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'd',
                title: '合同号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'e',
                title: '任务号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'zhuangtai',
                title: '工艺规程状态',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable',
                formatter: function(value, row, index) {
                    return value || '';
                }
            }, {
                field: 'g',
                title: '工序',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'h',
                title: '名称',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'i',
                title: '图号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'j',
                title: '单位',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            }, {
                field: 'k',
                title: '数量',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            }, {
                field: 'l',
                title: '材质',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'av',
                title: '序合计',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'aw',
                title: '重量',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            }, {
                field: 'ax',
                title: '工件尺寸',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'm',
                title: '单价元',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'n',
                title: '合计金额',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'o',
                title: '铣工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'p',
                title: '铣单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'q',
                title: '车工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'r',
                title: '车单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 's',
                title: '钳工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 't',
                title: '钳单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'u',
                title: '整件外委工时',
                align: 'center',
                sortable: true,
                width: 140,
                class: 'editable'
            }, {
                field: 'v',
                title: '整件外委单位',
                align: 'center',
                sortable: true,
                width: 140,
                class: 'editable'
            }, {
                field: 'w',
                title: '外委工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'x',
                title: '外委单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'y',
                title: '镗工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'z',
                title: '镗单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'aa',
                title: '割工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'ab',
                title: '割单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'ac',
                title: '磨工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'ad',
                title: '磨单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'ae',
                title: '数控铣工时',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'af',
                title: '数控铣单价',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'ag',
                title: '立车',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            }, {
                field: 'ah',
                title: '立车单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'ai',
                title: '电火花',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'aj',
                title: '电火花单价',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'ak',
                title: '中走丝',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'al',
                title: '中走丝单价',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'am',
                title: '下料',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            }, {
                field: 'an',
                title: '深孔钻',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'ao',
                title: '回厂日期',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'ap',
                title: '出厂日期',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'ay',
                title: '订单要求交货时间',
                align: 'center',
                sortable: true,
                width: 160,
                class: 'editable'
            }, {
                field: 'aq',
                title: '铣',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            }, {
                field: 'ar',
                title: '车',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            }, {
                field: 'aas',
                title: '登记员',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'at',
                title: '备注',
                align: 'center',
                sortable: true,
                width: 150,
                class: 'editable'
            }
        ],
        onPostBody: function() {
            bindRowClickEvents();
            enableCellEditing();
        }
    });

    // 强制刷新表格视图
    $('#userTable').bootstrapTable('load', data);
    $('#userTable').bootstrapTable('resetView');
}

// 绑定行点击事件（区分单击和双击）
function bindRowClickEvents() {
    var clickTimer = null;
    var clickedRow = null;

    $('#userTable').off('click', 'tbody tr').on('click', 'tbody tr', function(e) {
        var $row = $(this);

        // 如果是双击，清除计时器并执行双击操作
        if (clickTimer && clickedRow && clickedRow.is($row)) {
            clearTimeout(clickTimer);
            clickTimer = null;
            handleRowDoubleClick($row);
            return;
        }

        // 设置新的计时器
        clickedRow = $row;
        clickTimer = setTimeout(function() {
            handleRowSingleClick($row);
            clickTimer = null;
            clickedRow = null;
        }, 300); // 300ms延迟，用于区分单击和双击
    });
}


// 处理行单击事件（选择行）
function handleRowSingleClick($row) {
    let isSelect = $row.hasClass('selected');
    if (isSelect) {
        $row.removeClass('selected');
    } else {
        $row.addClass('selected');
    }
}

function handleRowDoubleClick($row) {
    var rowIndex = $row.data('index');
    var tableData = $('#userTable').bootstrapTable('getData');
    var rowData = tableData[rowIndex];

    if (rowData) {
        console.log('双击行数据:', rowData);

        // 准备传递给工艺规程页面的完整数据
        var processData = {
            // 基础信息
            id: rowData.id,
            c: rowData.c || '',           // 业务单位
            e: rowData.e || '',           // 任务号
            f: rowData.f || '未创建',     // 工艺规程状态
            h: rowData.h || '',           // 名称
            i: rowData.i || '',           // 图号
            k: rowData.k || '',           // 数量
            l: rowData.l || '',           // 材质
        };

        // 跳转到工艺规程页面
        navigateToProcessPage(processData);
    }
}


// 单元格编辑功能
function enableCellEditing() {
    $('#userTable').on('click', 'td.editable', function() {
        var $cell = $(this);
        var $row = $cell.closest('tr');

        // 如果已经在编辑状态，则不再重复创建
        if ($cell.find('input, select').length > 0) {
            return;
        }

        var originalValue = $cell.text().trim();

        // 修复：正确获取字段名
        var colIndex = $cell.index();
        var $headerTh = $('#userTable thead th').eq(colIndex);

        // 方法1：从data-field属性获取
        var field = $headerTh.attr('data-field') || $headerTh.data('field');

        // 方法2：如果还获取不到，从表格配置中获取
        if (!field) {
            var tableOptions = $('#userTable').bootstrapTable('getOptions');
            if (tableOptions && tableOptions.columns && tableOptions.columns[colIndex]) {
                field = tableOptions.columns[colIndex].field;
            }
        }

        // 方法3：如果还获取不到，从列的field属性获取
        if (!field) {
            field = $headerTh.find('[data-field]').attr('data-field');
        }

        console.log('字段信息:', {
            colIndex: colIndex,
            field: field,
            headerHtml: $headerTh.html(),
            headerTh: $headerTh
        });

        // 修改：使用Bootstrap Table的API获取行数据和ID
        var rowIndex = $row.data('index');
        var tableData = $('#userTable').bootstrapTable('getData');
        var rowData = tableData[rowIndex];
        var rowId = rowData ? rowData.id : null;

        console.log('编辑信息:', {
            field: field,
            rowId: rowId,
            originalValue: originalValue,
            rowIndex: rowIndex
        });

        // 如果没有获取到字段名或ID，提示错误
        if (!field || field === 'undefined') {
            swal("编辑失败", "无法获取字段名: " + field, "error");
            return;
        }
        if (!rowId) {
            swal("编辑失败", "无法获取行ID，请刷新页面重试", "error");
            return;
        }

        // 特殊处理工艺规程状态字段 - 使用下拉框
        if (field === 'zhuangtai') {
            createSelectEditor($cell, originalValue, field, rowId, tableData, rowIndex);
        } else {
            createInputEditor($cell, originalValue, field, rowId, tableData, rowIndex);
        }
    });
}

// 创建下拉框编辑器（针对工艺规程状态字段）
function createSelectEditor($cell, originalValue, field, rowId, tableData, rowIndex) {
    var $select = $('<select class="form-control cell-edit-select">')
        .css({
            width: '100%',
            height: '100%',
            border: '1px solid #007bff',
            borderRadius: '3px',
            padding: '2px 5px'
        });

    // 添加工艺规程状态选项
    $select.append('<option value="">请选择</option>');
    $select.append('<option value="未创建">未创建</option>');

    // 设置当前值
    $select.val(originalValue);

    // 清空单元格内容并添加下拉框
    $cell.empty().append($select);
    $select.focus();

    // 保存编辑
    function saveEdit() {
        var newValue = $select.val();

        // 如果值没有变化，则不保存
        if (newValue === originalValue) {
            $cell.text(originalValue);
            return;
        }

        console.log('发送更新:', { id: rowId, field: field, newValue: newValue });

        // 发送更新请求
        $.ajax({
            type: 'post',
            url: '/htjl/updateField',
            data: JSON.stringify({
                id: rowId,
                [field]: newValue
            }),
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function(res) {
                if (res.code == 200) {
                    $cell.text(newValue);
                    // 更新本地数据
                    tableData[rowIndex][field] = newValue;
                    // 注释掉这行，避免重新加载表格中断编辑状态
                    // getList();
                } else {
                    $cell.text(originalValue);
                    swal("更新失败", res.msg, "error");
                }
            },
            error: function(xhr, status, error) {
                $cell.text(originalValue);
                console.error('更新请求失败:', error);
                swal("更新失败", "网络错误，请重试", "error");
            }
        });
    }

    // 绑定事件
    $select.on('blur', saveEdit);
    $select.on('change', saveEdit); // 选择即保存
    $select.on('keydown', function(e) {
        if (e.keyCode === 27) { // ESC键
            $cell.text(originalValue);
        }
    });
}

// 创建输入框编辑器
function createInputEditor($cell, originalValue, field, rowId, tableData, rowIndex) {
    var $input = $('<input type="text" class="form-control cell-edit-input">')
        .val(originalValue)
        .css({
            width: '100%',
            height: '100%',
            border: '1px solid #007bff',
            borderRadius: '3px',
            padding: '2px 5px'
        });

    // 清空单元格内容并添加输入框
    $cell.empty().append($input);
    $input.focus().select();

    // 保存编辑
    function saveEdit() {
        var newValue = $input.val().trim();

        // 如果值没有变化，则不保存
        if (newValue === originalValue) {
            $cell.text(originalValue);
            return;
        }

        console.log('发送更新:', { id: rowId, field: field, newValue: newValue });

        // 发送更新请求
        $.ajax({
            type: 'post',
            url: '/htjl/updateField',
            data: JSON.stringify({
                id: rowId,
                [field]: newValue
            }),
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function(res) {
                if (res.code == 200) {
                    $cell.text(newValue);
                    // 更新本地数据
                    tableData[rowIndex][field] = newValue;
                    // 注释掉这行，避免重新加载表格中断编辑状态
                    // getList();
                } else {
                    $cell.text(originalValue);
                    swal("更新失败", res.msg, "error");
                }
            },
            error: function(xhr, status, error) {
                $cell.text(originalValue);
                console.error('更新请求失败:', error);
                swal("更新失败", "网络错误，请重试", "error");
            }
        });
    }

    // 绑定事件
    $input.on('blur', saveEdit);
    $input.on('keydown', function(e) {
        if (e.keyCode === 13) { // Enter键
            saveEdit();
        } else if (e.keyCode === 27) { // ESC键
            $cell.text(originalValue);
        }
    });
}

// 绑定状态单元格双击事件
function bindStatusCellDoubleClick() {
    // 使用事件委托来绑定双击事件
    $('#userTable').off('dblclick', '.status-cell').on('dblclick', '.status-cell', function(e) {
        e.stopPropagation();

        var $cell = $(this);
        var rowIndex = $cell.data('row-index');
        var table = $('#userTable');
        var rowData = table.bootstrapTable('getData')[rowIndex];

        if (rowData) {
            console.log('双击工艺规程状态单元格:', rowData);
            handleStatusDoubleClick(rowData);
        }
    });

    console.log('状态单元格双击事件已绑定');
}

// 状态列格式化函数
function statusFormatter(value, row, index) {
    var statusClass = '';
    var statusText = value || '未创建';

    switch(statusText) {
        case '未创建':
            statusClass = 'status-not-created';
            break;
        case '未完成':
            statusClass = 'status-in-progress';
            break;
        case '已完成':
            statusClass = 'status-completed';
            break;
        default:
            statusClass = 'status-unknown';
    }

    return '<span class="status-cell ' + statusClass + '" data-row-index="' + index + '" style="cursor: pointer; padding: 5px; border-radius: 3px;" title="双击查看/编辑工艺规程">' + statusText + '</span>';
}

// 跳转到工艺规程页面
function navigateToProcessPage(data) {
    // 使用sessionStorage传递完整数据
    sessionStorage.setItem('currentProcessData', JSON.stringify(data));

    // 修改iframe的src
    var iframe = window.frameElement;
    if (iframe) {
        // 当前在iframe中，让父页面修改iframe的src
        window.parent.changeIframeSrc('gygc.html');
    } else {
        window.location.href = 'gygc.html';
    }
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


function gotoReturnOrderPage() {
    let rows = getTableSelection('#userTable');
    if (rows.length == 0) {
        swal({
            title: '请先选择数据',
            text: '请在表格中选择要生成出库单的数据',
            icon: 'info',
            confirmButtonText: '确定'
        });
        return false;
    }

    console.log('选中的行数据:', rows);

    // 筛选符合条件的数据（状态为"已完成"）
    let validRows = [];
    let invalidRows = [];

    rows.forEach(function(selectedRow) {
        let rowData = selectedRow.data;
        let processStatus = rowData.zhuangtai || '';

        // 重新计算状态（和表格中一样的逻辑）
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
        }

        if (processStatus === '已完成') {
            validRows.push(rowData);
        } else {
            invalidRows.push(rowData);
        }
    });

    if (validRows.length === 0) {
        swal({
            title: '生成失败',
            text: '选中的行中没有工艺规程状态为"已完成"的数据!',
            icon: 'error',
            confirmButtonText: '确定'
        });
        return false;
    }

    // 如果有部分行不符合条件，给出提示
    if (invalidRows.length > 0) {
        swal({
            title: '部分数据不符合条件',
            text: `已选择 ${rows.length} 行，其中 ${validRows.length} 行状态为"已完成"可以出库，${invalidRows.length} 行状态不符合要求将被忽略。`,
            icon: 'warning',
            confirmButtonText: '继续'
        });
    }

    // 准备传递给出库页面的数据 - 携带所有有效行
    var returnData = {
        selectedRows: validRows.map(row => {
            // 传递完整数据，确保出库页面能获取所有必要信息
            return {
                id: row.id,
                c: row.c,           // 业务单位
                d: row.d,           // 合同号
                e: row.e,           // 任务号
                f: row.f || '',     // 工艺规程状态
                g: row.g || '',     // 工序
                h: row.h,           // 名称
                i: row.i,           // 图号
                j: row.j,           // 单位
                k: row.k,           // 数量
                l: row.l,           // 材质
                m: row.m || '',     // 序合计
                n: row.n || '',     // 重量
                o: row.o || '',     // 工件
                p: row.p || '',     // 单位元
                q: row.q || '',     // 合计金额
                r: row.r || '',     // 铣工时/40
                s: row.s || '',     // 铣单价
                t: row.t || '',     // 车工时/40
                u: row.u || '',     // 车单价
                v: row.v || '',     // 钳公式/40
                w: row.w || '',     // 钳单位
                x: row.x || '',     // 整件外委工时/57.6
                y: row.y || '',     // 整件外委单位
                z: row.z || '',     // 外委工时/48
                aa: row.aa || '',   // 外委单价
                ab: row.ab || '',   // 镗工时/73
                ac: row.ac || '',   // 镗单价
                ad: row.ad || '',   // 割工时/24
                ae: row.ae || '',   // 割单价
                af: row.af || '',   // 磨工时/42
                ag: row.ag || '',   // 磨单价
                ah: row.ah || '',   // 数控铣工时/69
                ai: row.ai || '',   // 数控铣单价
                aj: row.aj || '',   // 立车/71
                ak: row.ak || '',   // 立车单价
                al: row.al || '',   // 电火花/42
                am: row.am || '',   // 电火花单价
                an: row.an || '',   // 中走丝/38
                ao: row.ao || '',   // 中走丝单价
                ap: row.ap || '',   // 下料
                aq: row.aq || '',   // 深孔钻
                ar: row.ar || '',   // 回厂日期
                as: row.as || '',   // 出厂日期
                at: row.at || '',   // 订单要求交货时间
                au: row.au || '',   // 铣
                av: row.av || '',   // 车
                aw: row.aw || '',   // 登记员
                ax: row.ax || '',   // 备注
                zhuangtai: row.zhuangtai || '已完成'
            };
        }),
        count: validRows.length,
        timestamp: Date.now(),
        source: 'htjl_page'
    };

    console.log('传递给出库页面的数据条数:', validRows.length);
    console.log('传递给出库页面的数据:', returnData);

    // 使用sessionStorage传递完整数据
    sessionStorage.setItem('currentReturnData', JSON.stringify(returnData));

    // 跳转到出库页面
    var iframe = window.frameElement;
    if (iframe) {
        // 当前在iframe中，让父页面修改iframe的src
        console.log('在iframe中，调用父页面方法');
        window.parent.changeIframeSrc('ckd.html');
    } else {
        console.log('直接跳转到出库页面');
        window.location.href = 'ckd.html';
    }

    return true;
}

// ==================== 退货单功能 ====================
function initReturnOrder() {
    $('#return-date').val(getCurrentDate());
    bindReturnOrderEvents();
    calculateTotalAmount();
}

function bindReturnOrderEvents() {
    $('#select-all').click(function() {
        $('.row-select').prop('checked', this.checked);
    });
// 保存退货单按钮点击事件
    $("#save-return-btn").click(function () {

        // 检测必填字段
        var returnCustomer = $('#return-customer').val();
        var returnDate = $('#return-date').val();
        var returnNo = $('#return-no').val();
        var returnPhone = $('#return-phone').val();

        // 检测逻辑
        if (!returnCustomer) {
            swal("保存失败", "请填写退货客户", "error");
            return;
        }
        if (!returnDate) {
            swal("保存失败", "请选择退货日期", "error");
            return;
        }
        if (!returnNo) {
            swal("保存失败", "请生成退货单号", "error");
            return;
        }
        if (!returnPhone) {
            swal("保存失败", "请填写退货电话", "error");
            return;
        }

        var $btn = $(this);
        if ($btn.data('submitting')) {
            return;
        }
        $btn.data('submitting', true);
        $btn.prop('disabled', true);

        var originalText = $btn.html();
        $btn.html('<i class="bi bi-arrow-clockwise icon"></i>提交中...');

        // 直接收集所有明细行的数据
        var details = [];
        $('#return-detail-table tbody tr').each(function(index) {
            var $row = $(this);
            var detail = {
                // 共用信息
                f: $('#return-no').val(),
                c: $('#return-customer').val(),
                d: $('#return-phone').val(),
                r: $('#company-address').val() ,
                t: $('#company-phone').val(),
                e: $('return-date').val(),
                s: $('#customer-signature').val(),
                // 明细特有信息
                q: $row.find('input[name="returnReason"]').val(),
                g: $row.find('input[name="contractNo"]').val(),
                h: $row.find('input[name="taskNo"]').val(),
                i: $row.find('input[name="productName"]').val(),
                j: $row.find('input[name="drawingNo"]').val(),
                k: $row.find('input[name="unit"]').val(),
                l: $row.find('input[name="quantity"]').val(),
                m: $row.find('input[name="unitPrice"]').val(),
                n: $row.find('input[name="amount"]').val(),
                o: $row.find('input[name="material"]').val(),
                p: $row.find('input[name="weight"]').val(),
                w: $row.find('input[name="returnDate"]').val(),
                u: $row.find('input[name="remark"]').val(),
                v: $row.data('original-id') || ''  // 从data属性获取原表id
            };


            details.push(detail);

        });

        console.log('要保存的退货单数据:', details);

        // 遍历发送每个明细
        var successCount = 0;
        var totalCount = details.length;

        details.forEach(function(detail, index) {
            $ajax({
                type: 'post',
                url: '/htjl/save',
                data: JSON.stringify(detail),
                dataType: 'json',
                contentType: 'application/json;charset=utf-8'
            }, false, '', function (res) {
                successCount++;

                if (successCount === totalCount) {
                    $btn.data('submitting', false);
                    $btn.prop('disabled', false);
                    $btn.html(originalText);

                    if (res.code == 200) {
                        swal("", "保存成功，共插入 " + successCount + " 条数据", "success");
                        // 清空表单
                        $('#return-customer').val('');
                        $('#return-phone').val('');
                        $('#return-reason').val('');
                        $('#customer-signature').val('');
                        $('#return-detail-table tbody').empty();
                        addReturnRow();
                        calculateTotalAmount();
                    } else {
                        swal("", res.msg, "error");
                    }
                }
            }, function(xhr, status, error) {
                $btn.data('submitting', false);
                $btn.prop('disabled', false);
                $btn.html(originalText);
                swal("", "请求失败: " + error, "error");
            });
        });
    });
    $('#add-row-btn').click(function() {
        addReturnRow();
    });

    $('#remove-row-btn').click(function() {
        removeSelectedRows();
    });

    $('#generate-btn').click(function() {
        generateReturnOrder();
    });
    $('#baocun-btn').click(function() {
        tuihuojilu();
    });


    $(document).on('input', 'input[name="quantity"], input[name="unitPrice"]', function() {
        calculateRowAmount($(this).closest('tr'));
        calculateTotalAmount();
    });

    $(document).on('change', '.row-select', function() {
        updateSelectAllState();
    });
}





function addReturnRow() {
    var table = $('#return-detail-table tbody');
    var rowCount = table.find('tr').length;
    var newRow = `
        <tr>
            <td><input type="checkbox" class="row-select"></td>
            <td>${rowCount + 1}</td>
            <td><input type="text" class="form-control form-control-sm" name="contractNo"></td>
            <td><input type="text" class="form-control form-control-sm" name="taskNo"></td>
            <td><input type="text" class="form-control form-control-sm" name="productName"></td>
            <td><input type="text" class="form-control form-control-sm" name="drawingNo"></td>
            <td><input type="text" class="form-control form-control-sm" name="unit"></td>
            <td><input type="number" class="form-control form-control-sm" name="quantity" value="1"></td>
            <td><input type="number" class="form-control form-control-sm" name="unitPrice" value="0"></td>
            <td><input type="number" class="form-control form-control-sm" name="amount" value="0" readonly></td>
            <td><input type="text" class="form-control form-control-sm" name="material"></td>
            <td><input type="text" class="form-control form-control-sm" name="weight"></td>
            <td><input type="date" class="form-control form-control-sm" name="returnDate"></td>
            <td><input type="text" class="form-control form-control-sm" name="returnReason"></td>
            <td><input type="text" class="form-control form-control-sm" name="remark"></td>
        </tr>
    `;
    table.append(newRow);
    updateRowNumbers();
}

function removeSelectedRows() {
    var selectedRows = $('.row-select:checked');
    if (selectedRows.length === 0) {
        alert('请选择要删除的行');
        return;
    }

    if (confirm('确定要删除选中的行吗？')) {
        selectedRows.each(function() {
            $(this).closest('tr').remove();
        });
        updateRowNumbers();
        calculateTotalAmount();
    }
}

function updateRowNumbers() {
    $('#return-detail-table tbody tr').each(function(index) {
        $(this).find('td:eq(1)').text(index + 1);
    });
}

function calculateRowAmount(row) {
    var quantity = parseFloat(row.find('input[name="quantity"]').val()) || 0;
    var unitPrice = parseFloat(row.find('input[name="unitPrice"]').val()) || 0;
    var amount = quantity * unitPrice;
    row.find('input[name="amount"]').val(amount.toFixed(2));
    return amount;
}

function calculateTotalAmount() {
    var total = 0;
    $('#return-detail-table tbody tr').each(function() {
        total += calculateRowAmount($(this));
    });

    $('#total-amount').text(total.toFixed(2));
    $('#total-amount-chinese').text(numberToChinese(total));
}

function numberToChinese(num) {
    if (num === 0) return '零元整';

    var chineseNum = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    var chineseUnit = ['', '拾', '佰', '仟'];
    var bigUnit = ['', '万', '亿'];

    var numStr = Math.round(num * 100).toString();
    var integerPart = numStr.slice(0, -2) || '0';
    var decimalPart = numStr.slice(-2);

    var integerChinese = '';
    var integerArray = integerPart.split('').reverse();

    for (var i = 0; i < integerArray.length; i++) {
        var digit = parseInt(integerArray[i]);
        var unit = chineseUnit[i % 4];
        var bigUnitIndex = Math.floor(i / 4);
        var bigUnitChar = bigUnit[bigUnitIndex];

        if (digit === 0) {
            if (integerChinese.charAt(0) !== '零' && i % 4 !== 0) {
                integerChinese = '零' + integerChinese;
            }
        } else {
            integerChinese = chineseNum[digit] + unit + bigUnitChar + integerChinese;
        }
    }

    var decimalChinese = '';
    var jiao = parseInt(decimalPart.charAt(0)) || 0;
    var fen = parseInt(decimalPart.charAt(1)) || 0;

    if (jiao > 0) {
        decimalChinese += chineseNum[jiao] + '角';
    }
    if (fen > 0) {
        decimalChinese += chineseNum[fen] + '分';
    }

    var result = integerChinese + '元';
    if (decimalChinese) {
        result += decimalChinese;
    } else {
        result += '整';
    }

    return result;
}

function updateSelectAllState() {
    var allChecked = $('.row-select:checked').length === $('.row-select').length;
    $('#select-all').prop('checked', allChecked);
}

function generateReturnOrder() {

    let rows = getTableSelection('#userTable');
    if (rows.length == 0) {
        swal('请选择要生成退货单的数据!');
        return;
    }

    console.log('选中的行数据:', rows);

    // 清空现有退货单数据（保留第一行）
    $('#return-detail-table tbody tr:gt(0)').remove();

    // 填充退货单数据
    rows.forEach(function(selectedRow, index) {
        let rowData = selectedRow.data;
        console.log('第' + (index + 1) + '行数据:', rowData);

        if (index === 0) {
            // 第一行使用现有行
            fillReturnRowData($('#return-detail-table tbody tr:first'), rowData);
        } else {
            // 添加新行并填充数据
            addReturnRow();
            var newRow = $('#return-detail-table tbody tr:last');
            fillReturnRowData(newRow, rowData);
        }
    });

    // 更新退货单头部信息（使用第一个选中行的信息）
    if (rows.length > 0) {
        let firstRow = rows[0].data;
        $('#return-customer').val(firstRow.c || '');
        $('#return-phone').val(firstRow.phone || '');

        // 生成退货单号（根据当前时间）
        $('#return-no').val(generateReturnNo());

        // 设置当前日期为退货日期
        $('#return-date').val(getCurrentDate());
    }

    // 计算总金额
    calculateTotalAmount();

    $('#return-modal').modal('show');
    swal("生成成功", "已生成 " + rows.length + " 条退货单数据", "success");
}
// 填充退货单行数据
function fillReturnRowData($row, rowData) {
    $row.find('input[name="contractNo"]').val(rowData.d || '');
    $row.find('input[name="taskNo"]').val(rowData.e || '');
    $row.find('input[name="productName"]').val(rowData.h || '');
    $row.find('input[name="drawingNo"]').val(rowData.i || '');
    $row.find('input[name="unit"]').val(rowData.j || '');
    $row.find('input[name="quantity"]').val(rowData.k || '1');
    $row.find('input[name="unitPrice"]').val(rowData.p || '0');
    $row.find('input[name="material"]').val(rowData.l || '');
    $row.find('input[name="weight"]').val(rowData.n || '');
    $row.find('input[name="remark"]').val(rowData.ax || '');
// 设置隐藏的原表id
    $row.data('original-id', rowData.id);  // 将原表id存储在data属性中
    // 计算金额
    calculateRowAmount($row);
}

// 简化版 - 纯前端生成退货单号
function generateReturnNo() {
    $ajax({
        type: 'post',
        url: '/htjl/getddh',
    }, false, '', function (res) {
        if (res.code == 200) {
            var now = new Date();
            var dateStr = now.getFullYear() +
                String(now.getMonth() + 1).padStart(2, '0') +
                String(now.getDate()).padStart(2, '0');
            maxNo = res.data;  // 注意：这里是小写 f，但数据库字段是大写 F
            var newReturnNo;

            if (!maxNo || maxNo === '') {
                newReturnNo = "No:" + dateStr + "0001";
            } else {
                var numberPart = maxNo.split(":")[1];
                var nextNum = parseInt(numberPart) + 1;
                newReturnNo = "No:" + nextNum;
            }

            // 直接填入输入框
            $('#return-no').val(newReturnNo);
            console.log('退货单号已更新:', newReturnNo);

        } else {
            console.error('获取单号失败');
            // 失败时生成临时单号
            var tempNo = "No:" + new Date().getTime();
            $('#return-no').val(tempNo);
        }
    });  // 这里添加了缺少的右括号
}

function getCurrentDate() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}
