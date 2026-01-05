var idd;
var currentPage = 1;
var pageSize = 20; // 与 bootstrap-table 的 pageSize 保持一致
var totalCount = 0;
var totalPages = 0;

function getList(page) {
    // 如果有传入页码参数，更新当前页码
    if (page) {
        currentPage = page;
    }

    // 获取查询条件（不再清空表单值）
    var ksrq = $('#ksrq').val() || '';
    var jsrq = $('#jsrq').val() || '';
    var h = $('#hth').val() || '';
    var i = $('#rwh').val() || '';
    var k = $('#th').val() || '';
    var r = $('#thyy').val() || '';

    console.log('查询条件:', {
        pageNum: currentPage,
        pageSize: pageSize,
        ksrq: ksrq,
        jsrq: jsrq,
        h: h,
        i: i,
        k: k,
        r: r
    });

    // 构建查询参数
    var params = {
        pageNum: currentPage,
        pageSize: pageSize
    };

    // 如果有查询条件，添加到参数中
    if (ksrq || jsrq || h || i || k || r) {
        params.ksrq = ksrq;
        params.jsrq = jsrq;
        params.h = h;
        params.i = i;
        params.k = k;
        params.r = r;
    }

    $ajax({
        type: 'post',
        url: '/thjl/getList',
        contentType: 'application/json',
        data: JSON.stringify(params),
        dataType: 'json'
    }, false, '', function (res) {
        console.log('=== 调试信息开始 ===');
        console.log('API响应状态:', res.code);
        console.log('API响应消息:', res.msg);
        console.log('完整响应数据:', res);

        if (res.code == 200) {
            // 从响应中获取分页数据
            var data = res.data.records || res.data.list || res.data;
            totalCount = res.data.total || 0;
            totalPages = res.data.totalPages || res.data.pages || 1;

            // 使用Bootstrap Table插件渲染
            setTable(data);

            // 更新分页信息显示
            updatePagination();

            // 重新初始化拖动
            setTimeout(function() {
                initTableDragScroll();
            }, 500);

            // 添加列可调整功能
            if ($("#userTable").data('colResizable')) {
                $("#userTable").colResizable({
                    liveDrag: true,
                    gripInnerHtml: "<div class='grip'></div>",
                    draggingClass: "dragging",
                    resizeMode: 'fit'
                });
            }

            // 保留原有的 id 处理逻辑
            for (i=0; i<=res.data.id; i++){
                idd=i;
            }

            // 如果有查询条件，显示查询结果提示
            if (ksrq || jsrq || h || i || k || r) {
                console.log('查询完成，找到 ' + totalCount + ' 条记录');
            }
        }
    });
}

function getTableSelection(tableSelector) {
    var table = $(tableSelector);
    var selectedRows = [];

    if (table.hasClass('bootstrap-table')) {
        // Bootstrap Table 方式 - 确保获取到完整数据
        try {
            selectedRows = table.bootstrapTable('getSelections');
            console.log("Bootstrap Table 选中行:", selectedRows);
            console.log("选中行数量:", selectedRows.length);

            // 验证数据完整性
            if (selectedRows.length > 0) {
                console.log("第一条选中行的完整数据:", selectedRows[0]);
                console.log("ID字段:", selectedRows[0].id);
                console.log("c字段（退货客户）:", selectedRows[0].c);
                console.log("d字段（退货电话）:", selectedRows[0].d);
            }
        } catch (error) {
            console.error("获取选中行数据失败:", error);
        }
    } else {
        // 简单表格方式（备用）
        $(tableSelector + ' tbody tr.selected').each(function() {
            var rowId = $(this).data('id');
            var rowData = {
                id: rowId,
                data: {
                    id: rowId
                }
            };
            selectedRows.push(rowData);
        });
    }

    return selectedRows;
}


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

    // 修改查询按钮事件，使用统一的 getList 方法
    $('#select-btn').click(function () {
        // 重置为第一页
        currentPage = 1;
        getList(currentPage);
    });

    // 清空按钮（如果需要）
    $('#clear-btn').click(function () {
        // 清空查询条件
        $('#ksrq').val('');
        $('#jsrq').val('');
        $('#hth').val('');
        $('#rwh').val('');
        $('#th').val('');
        $('#thyy').val('');

        // 重置为第一页并重新加载
        currentPage = 1;
        getList(currentPage);
    });

    $("#refresh-btn").click(function () {
        currentPage = 1;
        getList(currentPage);
        swal("刷新成功", "已刷新数据", "success");
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
            gongzuoling: $('#add-gongzuoling').val(),      // 退货日期 (正确)
            lingjianhao: $('#add-lingjianhao').val(),      // 退货日期 (正确)
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
                getList(currentPage);
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

    // 修改更新按钮事件，使用Bootstrap Table的选择
    $('#update-btn').click(function () {
        console.log("更新按钮被点击");

        // 直接使用 Bootstrap Table 的 getSelections
        let selectedRows = $('#userTable').bootstrapTable('getSelections');
        console.log("获取到的行数据:", selectedRows);

        if (selectedRows.length > 1) {
            swal('请只选择一条数据修改!');
            return;
        }
        if (selectedRows.length == 0) {
            swal('请选择一条数据修改!');
            return;
        }

        let selectedRow = selectedRows[0]; // 直接获取行数据对象
        console.log('选中的行数据:', selectedRow);
        console.log('数据ID:', selectedRow.id);
        console.log('数据字段c（退货客户）:', selectedRow.c);
        console.log('数据字段d（退货电话）:', selectedRow.d);

        // 直接填充表单数据，不需要复杂的转换
        if (selectedRow) {
            console.log('立即填充表单数据:', selectedRow);

            // 填充表单数据
            $('#update-c').val(selectedRow.c || '');  // 退货客户
            $('#update-d').val(selectedRow.d || '');  // 退货电话
            $('#update-e').val(selectedRow.e || '');  // 退货日期
            $('#update-gongzuoling').val(selectedRow.gongzuoling || '');  // 退货日期
            $('#update-lingjianhao').val(selectedRow.lingjianhao || '');  // 退货日期
            $('#update-f').val(selectedRow.f || '');  // 退货单号
            $('#update-w').val(selectedRow.w || '');  // 回厂日期
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

            $('#id').val(selectedRow.id || '');

            console.log('表单ID值:', $('#id').val());
            console.log('表单c值:', $('#update-c').val());
            console.log('表单d值:', $('#update-d').val());
        }

        $('#update-modal').modal('show');
    });

    // 修改弹窗显示事件
    $('#update-modal').on('shown.bs.modal', function () {
        console.log("修改弹窗已显示");

        // 如果没有全局数据，尝试从表单获取（作为备用）
        if (!window.selectedUserData) {
            console.log("警告：没有全局数据，尝试从表单读取");
            var id = $('#id').val();
            if (id) {
                console.log("从表单读取到ID:", id);
            }
        } else {
            console.log("弹窗显示时读取全局数据:", window.selectedUserData);

            // 再次确认表单数据是否正确
            console.log("表单字段验证:");
            console.log("- ID:", $('#id').val());
            console.log("- 退货客户:", $('#update-c').val());
            console.log("- 退货电话:", $('#update-d').val());
            console.log("- 退货日期:", $('#update-e').val());
        }
    });

    // 修改这里：根据映射关系调整修改表单的字段
    $('#update-submit-btn').click(function () {
        console.log("修改提交按钮被点击");

        // 验证表单数据
        console.log("提交前验证数据:");
        console.log("ID:", $('#id').val());
        console.log("退货客户:", $('#update-c').val());
        console.log("退货电话:", $('#update-d').val());

        var msg = confirm("确认要修改吗？");
        if (!msg) {
            return;
        }

        // 修正字段映射
        let params = {
            id: $('#id').val(),
            c: $('#update-c').val(),  // 退货客户
            d: $('#update-d').val(),  // 退货电话
            e: $('#update-e').val(),  // 退货日期 (正确)
            gongzuoling: $('#update-gongzuoling').val(),  // 退货日期 (正确)
            lingjianhao: $('#update-lingjianhao').val(),  // 退货日期 (正确)
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
        };

        console.log('提交的修改数据:', params);

        // 验证必要字段
        if (!params.id) {
            swal("修改失败", "ID不能为空", "error");
            return;
        }

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
                    // 清除全局数据
                    window.selectedUserData = null;
                    // 重新加载数据
                    getList(currentPage);
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
    });

    // 当弹窗关闭时清理全局数据
    $('#update-modal').on('hidden.bs.modal', function () {
        console.log("修改弹窗已关闭，清理全局数据");
        window.selectedUserData = null;
    });

    // 修改删除按钮事件，使用Bootstrap Table的选择
    $('#delete-btn').click(function () {
        deleteSelectedRows();
    });

    // 统一的删除函数
    function deleteSelectedRows() {
        var msg = confirm("确认要删除选中的数据吗？");
        if (!msg) {
            return;
        }

        // 获取选中的行
        let rows = getTableSelection("#userTable");
        console.log("选中的行:", rows);

        if (rows.length == 0) {
            swal('请选择要删除的数据！');
            return;
        }

        let idList = [];
        $.each(rows, function (index, row) {
            idList.push(row.id);
        });

        console.log("要删除的ID列表:", idList);

        // 显示加载提示
        swal({
            title: "正在删除...",
            text: "请稍候",
            icon: "info",
            buttons: false,
            closeOnClickOutside: false,
            closeOnEsc: false
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
                swal({
                    title: "删除成功！",
                    text: res.msg,
                    icon: "success",
                    timer: 1500,
                    buttons: false
                });
                // 重新加载数据
                setTimeout(function() {
                    getList(currentPage);
                }, 500);
            } else if(res.code == 403) {
                swal("删除失败", "权限不足，管理员权限可以删除", "error");
            } else {
                swal("删除失败", res.msg || "删除操作失败", "error");
            }
        }, function(error) {
            console.error("删除请求失败:", error);
            swal("删除失败", "网络错误，请检查连接", "error");
        });
    }

    // ============= 新增：页面加载后初始化拖动 =============
    // 延迟初始化，等待表格完全加载
    setTimeout(function() {
        initTableDragScroll();
    }, 1000);
    // ==================================================
});

// 使用Bootstrap Table插件渲染表格
function setTable(data) {
    console.log('setTable 被调用，数据长度:', data ? data.length : 0);

    var $table = $('#userTable');
    if (!$table.length) {
        console.error('表格元素 #userTable 不存在');
        return;
    }

    // 销毁现有表格
    if ($table.hasClass('bootstrap-table')) {
        $table.bootstrapTable('destroy');
    }

    // 初始化Bootstrap Table
    $table.bootstrapTable({
        data: data,
        sortStable: true,
        classes: 'table table-hover table-bordered table-custom',
        idField: 'id',
        pagination: false, // 禁用插件分页，使用自定义分页
        clickToSelect: true, // 启用点击选择
        height: 400,
        fixedHeader: true,
        locale: 'zh-CN',
        rowAttributes: function(row, index) {
            return {
                'data-index': index,
                'data-id': row.id
            };
        },
        columns: [
            {
                field: 'state',
                checkbox: true,
                align: 'center',
                valign: 'middle',
                width: 50
            },
            {
                field: 'c',
                title: '退货客户',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'd',
                title: '退货电话',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'e',
                title: '退货日期',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable',
                formatter: function(value) {
                    return value || '';
                }
            },
            {
                field: 'f',
                title: '退货单号',
                align: 'center',
                sortable: true,
                width: 150,
                class: 'editable'
            },
            {
                field: 'gongzuoling',
                title: '工作令',
                align: 'center',
                sortable: true,
                width: 150,
                class: 'editable'
            },
            {
                field: 'lingjianhao',
                title: '零件号',
                align: 'center',
                sortable: true,
                width: 150,
                class: 'editable'
            },
            {
                field: 'w',
                title: '回厂日期',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable',
                formatter: function(value) {
                    return value || '';
                }
            },
            {
                field: 'g',
                title: '合同号',
                align: 'center',
                sortable: true,
                width: 150,
                class: 'editable'
            },
            {
                field: 'h',
                title: '任务号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'i',
                title: '产品名称',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'j',
                title: '图号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'k',
                title: '单位',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'l',
                title: '数量',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'm',
                title: '单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'n',
                title: '金额',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'o',
                title: '材质',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'p',
                title: '重量',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'q',
                title: '退货原因',
                align: 'center',
                sortable: true,
                width: 180,
                class: 'editable'
            },
            {
                field: 'r',
                title: '地址',
                align: 'center',
                sortable: true,
                width: 180,
                class: 'editable'
            },
            {
                field: 's',
                title: '客户签字',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 't',
                title: '电话',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'u',
                title: '备注',
                align: 'center',
                sortable: true,
                width: 180,
                class: 'editable'
            }
        ],
        onPostBody: function() {
            // 绑定行点击事件
            bindRowClickEvents();
            // 初始化表格拖动滚动
            setTimeout(function() {
                initTableDragScroll();
            }, 300);
        },
        onCheck: function(row, $element) {
            // 复选框选中事件
            $element.closest('tr').addClass('selected');
        },
        onUncheck: function(row, $element) {
            // 复选框取消选中事件
            $element.closest('tr').removeClass('selected');
        },
        onCheckAll: function(rows) {
            // 全选事件
            $('#userTable tbody tr').addClass('selected');
        },
        onUncheckAll: function(rows) {
            // 取消全选事件
            $('#userTable tbody tr').removeClass('selected');
        }
    });

    // 强制刷新表格视图
    $table.bootstrapTable('load', data);
    $table.bootstrapTable('resetView');

    console.log('Bootstrap Table渲染完成');
}

// 绑定行点击事件（区分单击和双击）
function bindRowClickEvents() {
    var clickTimer = null;
    var clickedRow = null;

    $('#userTable').off('click', 'tbody tr').on('click', 'tbody tr', function(e) {
        var $row = $(this);

        // 排除点击复选框的情况
        if ($(e.target).is('input[type="checkbox"]') || $(e.target).hasClass('bootstrap-table-checkbox')) {
            return;
        }

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
            // 处理单击事件（行选择）
            handleRowSingleClick($row);
            clickTimer = null;
            clickedRow = null;
        }, 300); // 300ms延迟，用于区分单击和双击
    });
}

// 处理行单击事件（选择行）- Bootstrap Table 版本
function handleRowSingleClick($row) {
    var table = $('#userTable');
    var rowId = $row.data('id');
    var isSelected = table.bootstrapTable('getSelections').some(function(row) {
        return row.id === rowId;
    });

    if (isSelected) {
        table.bootstrapTable('uncheckBy', {field: 'id', values: [rowId]});
    } else {
        table.bootstrapTable('checkBy', {field: 'id', values: [rowId]});
    }
}

function handleRowDoubleClick($row) {
    var rowIndex = $row.data('index');
    var rowId = $row.data('id');

    console.log('双击行，索引:', rowIndex, 'ID:', rowId);

    // 可以在这里添加双击操作，如果需要的话
    // 例如：自动进入编辑模式
}

// 更新分页控件
function updatePagination() {
    // 移除现有的分页控件
    $('#customPaginationContainer').remove();

    var paginationHtml = `
        <div id="customPaginationContainer" class="pagination-container">
            <div class="pagination-info">
                共 <span class="total-count">${totalCount}</span> 条记录，
                第 <span class="current-page">${currentPage}</span> 页 / 共 <span class="total-pages">${totalPages}</span> 页
            </div>
            <div class="pagination-controls">
                <button class="pagination-btn first-page" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="bi bi-chevron-double-left"></i> 首页
                </button>
                <button class="pagination-btn prev-page" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="bi bi-chevron-left"></i> 上一页
                </button>
                <div class="page-numbers">`;

    var startPage = Math.max(1, currentPage - 2);
    var endPage = Math.min(totalPages, currentPage + 2);

    for (var i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHtml += `<button class="page-number active">${i}</button>`;
        } else {
            paginationHtml += `<button class="page-number">${i}</button>`;
        }
    }

    paginationHtml += `
                </div>
                <button class="pagination-btn next-page" ${currentPage === totalPages ? 'disabled' : ''}>
                    下一页 <i class="bi bi-chevron-right"></i>
                </button>
                <button class="pagination-btn last-page" ${currentPage === totalPages ? 'disabled' : ''}>
                    末页 <i class="bi bi-chevron-double-right"></i>
                </button>
                <div class="page-size-selector">
                    <select class="page-size-select form-control form-control-sm" style="width: auto; display: inline-block;">
                        <option value="10" ${pageSize === 10 ? 'selected' : ''}>10条/页</option>
                        <option value="15" ${pageSize === 15 ? 'selected' : ''}>15条/页</option>
                        <option value="20" ${pageSize === 20 ? 'selected' : ''}>20条/页</option>
                        <option value="50" ${pageSize === 50 ? 'selected' : ''}>50条/页</option>
                        <option value="100" ${pageSize === 100 ? 'selected' : ''}>100条/页</option>
                    </select>
                </div>
            </div>
        </div>`;

    // 将分页控件添加到表格后面
    $('#userTable1').after(paginationHtml);
    // 绑定分页事件
    bindPaginationEvents();
}

// 绑定分页事件 - 使用事件委托确保新创建的元素也能绑定事件
function bindPaginationEvents() {
    // 使用事件委托，绑定到 document 上
    $(document).off('click', '.first-page').on('click', '.first-page', function(e) {
        e.preventDefault();
        if (!$(this).prop('disabled')) {
            getList(1);
        }
    });

    $(document).off('click', '.prev-page').on('click', '.prev-page', function(e) {
        e.preventDefault();
        if (!$(this).prop('disabled')) {
            getList(currentPage - 1);
        }
    });

    $(document).off('click', '.next-page').on('click', '.next-page', function(e) {
        e.preventDefault();
        if (!$(this).prop('disabled')) {
            getList(currentPage + 1);
        }
    });

    $(document).off('click', '.last-page').on('click', '.last-page', function(e) {
        e.preventDefault();
        if (!$(this).prop('disabled')) {
            getList(totalPages);
        }
    });

    $(document).off('click', '.page-number').on('click', '.page-number', function(e) {
        e.preventDefault();
        var page = parseInt($(this).text());
        if (page !== currentPage) {
            getList(page);
        }
    });

    $(document).off('change', '.page-size-select').on('change', '.page-size-select', function(e) {
        e.preventDefault();
        var newPageSize = parseInt($(this).val());
        if (newPageSize !== pageSize) {
            pageSize = newPageSize;
            currentPage = 1; // 重置到第一页
            getList(currentPage);
        }
    });
}

function initTableDragScroll() {
    console.log('初始化表格拖动滚动...');

    // 查找表格容器
    const tableContainer = document.querySelector('.fixed-table-body') ||
        document.querySelector('.table-responsive') ||
        document.querySelector('.bootstrap-table .fixed-table-container');

    if (!tableContainer) {
        console.warn('找不到表格容器');
        return;
    }

    console.log('找到表格容器:', tableContainer);

    let isDragging = false;
    let startX;
    let startY;
    let scrollLeft;
    let scrollTop;

    // 鼠标按下事件 - 开始拖动
    tableContainer.addEventListener('mousedown', function(e) {
        // 只有在表格有水平滚动条时才启用拖动
        if (tableContainer.scrollWidth <= tableContainer.clientWidth) {
            return;
        }

        isDragging = true;
        startX = e.pageX;
        startY = e.pageY;
        scrollLeft = tableContainer.scrollLeft;
        scrollTop = tableContainer.scrollTop;

        // 添加拖动样式
        tableContainer.style.cursor = 'grabbing';
        tableContainer.style.userSelect = 'none';

        // 防止文本选择
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';

        e.preventDefault();
        e.stopPropagation();
    });

    // 鼠标移动事件 - 拖动滚动
    tableContainer.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        e.preventDefault();

        const x = e.pageX;
        const y = e.pageY;
        const walkX = (x - startX) * 2; // 乘以2增加拖动速度
        const walkY = (y - startY) * 2;

        tableContainer.scrollLeft = scrollLeft - walkX;
        tableContainer.scrollTop = scrollTop - walkY;
    });

    // 鼠标释放事件 - 停止拖动
    tableContainer.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            tableContainer.style.cursor = 'grab';
            tableContainer.style.userSelect = 'auto';
            document.body.style.userSelect = 'auto';
            document.body.style.cursor = 'default';
        }
    });

    // 鼠标离开容器时释放拖动
    tableContainer.addEventListener('mouseleave', function() {
        if (isDragging) {
            isDragging = false;
            tableContainer.style.cursor = 'grab';
            tableContainer.style.userSelect = 'auto';
            document.body.style.userSelect = 'auto';
            document.body.style.cursor = 'default';
        }
    });

    // 设置初始光标样式
    tableContainer.style.cursor = 'grab';

    // 阻止默认的拖拽行为
    tableContainer.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });

    console.log('表格拖动滚动初始化完成');
}