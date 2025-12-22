var idd;
var currentPage = 1;
var pageSize = 20;
var totalCount = 0;
var totalPages = 0;

function getList(page, options = {}) {
    // 如果有传入页码参数，更新当前页码
    if (page) {
        currentPage = page;
    }

    console.log('=== getList 开始 ===');
    console.log('当前页码:', currentPage);
    console.log('页面大小:', pageSize);
    console.log('查询条件:', {
        name: $('#name').val(),
        hetongZhuangtai: $('#hetongZhuangtai').val(),
        hetongHao: $('#hetonghao').val(),
        renwuHao: $('#renwuHao').val(),
        tuhao: $('#tuhao').val()
    });



    // 获取查询条件
    var name = $('#name').val() || '';
    var hetongZhuangtai = $('#hetongZhuangtai').val() || '';
    var hetongHao = $('#hetonghao').val() || '';
    var renwuHao = $('#renwuhao').val() || '';
    var tuhao = $('#tuhao').val() || '';

    // 构建查询参数
    var params = {
        pageNum: currentPage,
        pageSize: pageSize
    };

    // 添加查询条件
    if (name) params.name = name;
    if (hetongZhuangtai) params.hetongZhuangtai = hetongZhuangtai;
    if (hetongHao) params.hetongHao = hetongHao;
    if (renwuHao) params.renwuHao = renwuHao;
    if (tuhao) params.tuhao = tuhao;

    $.ajax({
        type: 'post',
        url: '/ywc/getList',
        data: JSON.stringify(params),
        contentType: 'application/json',
        dataType: 'json',
        success: function (res) {
            console.log('=== 调试信息开始 ===');
            console.log('API响应状态:', res.code);
            console.log('API响应消息:', res.msg);
            console.log('完整响应数据:', res);
            if (res.code == 200) {
                // 处理分页数据
                var data = res.data.records || res.data.list || res.data;
                totalCount = res.data.total || 0;
                totalPages = res.data.totalPages || res.data.pages || 1;

                setTable(data);
                updatePagination();

                // ============= 新增：重新初始化拖动 =============
                setTimeout(function() {
                    initTableDragScroll();
                }, 500);
                // ================================================

                // 添加列可调整功能
                if ($("#userTable").data('colResizable')) {
                    $("#userTable").colResizable({
                        liveDrag: true,
                        gripInnerHtml: "<div class='grip'></div>",
                        draggingClass: "dragging",
                        resizeMode: 'fit'
                    });
                }

                    let maxId = Math.max(...data.map(item => item.id));
                    idd = maxId;

                // 如果有查询条件，显示查询结果提示
                if (name || hetongZhuangtai || hetongHao || renwuHao) {
                    console.log('查询完成，找到 ' + totalCount + ' 条记录');
                }
            }
        },
        error: function (xhr, status, error) {
            console.error('请求失败:', error);
        }
    });
}

function getSelectedRows() {
    // 使用bootstrap-table的getSelections方法获取选中行
    return $('#userTable').bootstrapTable('getSelections') || [];
}

$(function () {
    // 方法1：直接设置文档焦点
    document.body.focus();
    // 方法2：尝试设置表格焦点
    setTimeout(function() {
        var $table = $('#userTable');
        if ($table.length) {
            $table.focus();
            console.log('表格已获取焦点');
        }

        // 同时通知父窗口 iframe 已准备好
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'iframeReady',
                focused: true
            }, '*');
        }
    }, 100);


// 监听鼠标进入文档，自动获取焦点
$(document).on('mouseenter', function() {
    if (window.frameElement) {
        try {
            window.focus();
            document.body.focus();
        } catch (e) {
            console.log('设置焦点时出错:', e);
        }
    }
});

// 监听表格区域的点击，确保焦点
$('#userTable').on('click', function(e) {
    e.stopPropagation();
    $(this).focus();
    return true;
});
    // 初始化页面加载
    getList();
    loadhth();
    loadywdw();
    loadrwh();
    loadth();
    // 重置所有状态
    currentPage = 1;
    pageSize = 20;
    totalCount = 0;
    totalPages = 0;

    // 清理可能存在的残留
    try {
        if ($('#userTable').hasClass('bootstrap-table')) {
            $('#userTable').bootstrapTable('destroy');
        }
    } catch (e) {
        console.log('清理表格:', e.message);
    }

    // 移除所有事件绑定，避免重复绑定
    $('#select-btn').off('click');
    $('#clear-btn').off('click');
    $('#refresh-btn').off('click');
    $('#delete-btn').off('click');
    $('#export-btn').off('click');

    //条件查询
    // 条件查询 - 修复版本
    $('#select-btn').click(function () {
        console.log('查询按钮被点击');

        // 重置到第一页
        currentPage = 1;


        // 立即重新加载数据
        getList(); // 已经显示加载状态，不再重复显示

        console.log('开始查询，页码重置为:', currentPage);
    });

    // 清空按钮
    $('#clear-btn').click(function () {
        $('#name').val('');
        $('#hetongZhuangtai').val('');
        $('#hetonghao').val('');
        $('#renwuhao').val('');
        $('#tuhao').val('');
        currentPage = 1;
        getList();
    });

    //刷新
    $("#refresh-btn").click(function () {
        currentPage = 1;
        $('#name').val('');
        $('#hetongZhuangtai').val('');
        $('#hetonghao').val('');
        $('#renwuhao').val('');
        $('#tuhao').val('');
        getList();
        swal("刷新成功", "已显示所有数据", "success");
    });

    //计算
    $("#calculate-btn").click(function () {
        calculateSelectedRows();
    });

    // 导出按钮事件
    $('#export-btn').off('click').on('click', function() {
        console.log('导出Excel');
        showExportModal();
    });

    // 绑定确认导出事件
    $('#confirm-export-btn').off('click').on('click', function() {
        var filename = $('#export-filename').val().trim();
        var dateFormat = $('#export-date-format').val();

        if (!filename) {
            swal('请输入文件名');
            return;
        }

        // 添加日期后缀
        if (dateFormat !== 'none') {
            var dateSuffix = formatDate(new Date(), dateFormat);
            filename += '_' + dateSuffix;
        }

        // 确保文件名以.xlsx结尾
        if (!filename.toLowerCase().endsWith('.xlsx')) {
            filename += '.xlsx';
        }

        $('#exportModal').modal('hide');
        exportToExcel(filename);
    });

    // 点击删除按钮 - 修复版本
    $('#delete-btn').click(function () {
        console.log('删除按钮被点击');

        var msg = confirm("确认要删除选中的数据吗？");
        if (msg) {
            let rows = getTableSelection("#userTable");
            if (rows.length == 0) {
                swal('请选择要删除的数据！');
                return;
            }

            let idList = [];
            $.each(rows, function (index, row) {
                // 正确访问ID：row.data.id
                if (row.data && row.data.id) {
                    idList.push(row.data.id);
                } else {
                    console.warn('第' + index + '行没有找到ID，数据:', row);
                }
            });

            console.log('要删除的ID列表:', idList);

            // 显示删除确认和加载提示
            swal({
                title: "正在删除...",
                text: "请稍候",
                icon: "info",
                buttons: false,
                closeOnClickOutside: false,
                closeOnEsc: false
            });

            // 使用统一的ajax请求
            $.ajax({
                type: 'post',
                url: '/ywc/delete',
                data: JSON.stringify({
                    idList: idList
                }),
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                success: function (res) {
                    console.log('删除响应:', res);

                    if (res.code == 200) {
                        // 关闭删除确认弹窗
                        swal.close();

                        // 显示成功消息
                        swal({
                            title: "删除成功！",
                            text: res.msg,
                            icon: "success",
                            timer: 1500,
                            buttons: false
                        });

                        // 立即重新加载数据
                        console.log('删除成功，重新加载数据...');
                        getList();

                    } else if(res.code == 403) {
                        swal("删除失败", "权限不足，管理员权限可以删除", "error");
                    } else {
                        swal("删除失败", res.msg || "删除操作失败", "error");
                    }
                },
                error: function (xhr, status, error) {
                    console.error('删除请求失败:', error);
                    swal("删除失败", "网络错误，请检查连接", "error");
                }
            });
        }
    });

    // 延迟初始化，等待表格完全加载
    setTimeout(function() {
        initTableDragScroll();
    }, 1000);
});



// 独立的表格初始化函数
function initializeBootstrapTable(data) {
    var $table = $('#userTable');

    // 初始化bootstrap-table
    $table.bootstrapTable({
        data: data,
        sortStable: true,
        classes: 'table table-hover table-bordered table-custom',
        idField: 'id',
        pagination: false,
        clickToSelect: false,
        height: 400,
        fixedHeader: true,
        locale: 'zh-CN',
        columns: [
            {
                field: 'state',
                checkbox: true,
                align: 'center',
                valign: 'middle',
                width: 40
            },
            {
                field: 'c',
                title: '业务单位',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'd',
                title: '合同号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'e',
                title: '任务号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'lingjianhao',
                title: '零件号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'hetongzhuangtai',
                title: '对账状态',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable',
                formatter: function(value, row, index) {
                    return value || '';
                }
            },
            {
                field: 'g',
                title: '工序',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'h',
                title: '名称',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'i',
                title: '图号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'j',
                title: '单位',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            },
            {
                field: 'k',
                title: '数量',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            },
            {
                field: 'l',
                title: '材质',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'au',
                title: '出库单号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'av',
                title: '序合计',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'aw',
                title: '重量',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            },
            {
                field: 'ax',
                title: '工件尺寸',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'm',
                title: '单价元',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'n',
                title: '合计金额',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'o',
                title: '铣工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'p',
                title: '铣单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'xianshiji',
                title: '铣实际工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'q',
                title: '车工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'r',
                title: '车单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'cheshiji',
                title: '车实际工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 's',
                title: '钳工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 't',
                title: '钳单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'qianshiji',
                title: '钳实际工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'u',
                title: '整件外委工时',
                align: 'center',
                sortable: true,
                width: 140,
                class: 'editable'
            },
            {
                field: 'v',
                title: '整件外委单位',
                align: 'center',
                sortable: true,
                width: 140,
                class: 'editable'
            },
            {
                field: 'w',
                title: '外委工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'x',
                title: '外委单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'y',
                title: '镗工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'z',
                title: '镗单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'tangshiji',
                title: '镗实际工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'aa',
                title: '割工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'ab',
                title: '割单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'geshiji',
                title: '割实际工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'ac',
                title: '磨工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'ad',
                title: '磨单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'moshiji',
                title: '磨实际工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'ae',
                title: '数控铣工时',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'af',
                title: '数控铣单价',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'skxshiji',
                title: '数控铣实际工时',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'ag',
                title: '立车',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            },
            {
                field: 'ah',
                title: '立车单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'licheshiji',
                title: '立车实际工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'ai',
                title: '电火花',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'aj',
                title: '电火花单价',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'dianhuohuashiji',
                title: '电火花实际工时',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'ak',
                title: '中走丝',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'al',
                title: '中走丝单价',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'zhongzuosishiji',
                title: '中走丝实际工时',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'jingmixianqiege',
                title: '精密线切割',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'hanjiegongshi',
                title: '焊接工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'an',
                title: '深孔钻',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'ao',
                title: '回厂日期',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'dengjiriqi',
                title: '登记日期',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'ap',
                title: '出厂日期',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            // {
            //     field: 'shijijiaohuoriqi',
            //     title: '实际交货日期',
            //     align: 'center',
            //     sortable: true,
            //     width: 120,
            //     class: 'editable'
            // },
            // {
            //     field: 'ay',
            //     title: '订单要求交货时间',
            //     align: 'center',
            //     sortable: true,
            //     width: 160,
            //     class: 'editable'
            // },
            {
                field: 'aq',
                title: '铣',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            },
            {
                field: 'ar',
                title: '车',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            },
            {
                field: 'aas',
                title: '登记员',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },
            {
                field: 'at',
                title: '备注',
                align: 'center',
                sortable: true,
                width: 150,
                class: 'editable'
            }
        ],
        onPostBody: function() {
            console.log('表格渲染完成');
            // 启用单元格编辑
            setTimeout(function() {
                enableCellEditing();
            }, 100);
            // 初始化拖动
            setTimeout(function() {
                initTableDragScroll();
            }, 300);
        },
        onClickRow: function (row, $element) {
            let isSelect = $element.hasClass('selected')
            if (isSelect) {
                $element.removeClass('selected')
            } else {
                $element.addClass('selected')
            }
        },
        onDblClickRow: function(row, $element) {
            handleRowDoubleClick(row);
        },
        onPostBody: function() {
            // 表格渲染完成后启用单元格编辑
            enableCellEditing();
            // 延迟初始化表格拖动滚动
            setTimeout(function() {
                initTableDragScroll();
            }, 300);
        }
    });

    console.log('表格初始化完成');
}

// 修改后的单元格编辑功能（适配bootstrap-table）
function enableCellEditing() {
    console.log('启用单元格编辑...');

    // 先解绑事件，避免重复绑定
    $('#userTable').off('click', 'td.editable');

    $('#userTable').on('click', 'td.editable', function(e) {
        console.log('单元格被点击');
        e.stopPropagation(); // 阻止事件冒泡到行

        var $cell = $(this);
        var $row = $cell.closest('tr');

        // 如果已经在编辑状态，则不再重复创建
        if ($cell.find('input, select').length > 0) {
            console.log('单元格已在编辑状态');
            return;
        }

        var originalValue = $cell.text().trim();
        console.log('原始值:', originalValue);

        // ==== 修复：直接获取列索引，不需要减1 ====
        var colIndex = $cell.index(); // 单元格在行中的索引，从0开始
        console.log('列索引:', colIndex);

        // 获取表头单元格
        var $headerTh = $('#userTable thead th').eq(colIndex);
        console.log('表头单元格:', $headerTh);
        console.log('表头HTML:', $headerTh.html());

        // 尝试多种方式获取字段名
        var field = '';

        // 方法1：从data-field属性获取
        field = $headerTh.data('field') || $headerTh.attr('data-field');
        console.log('从data-field获取:', field);

        // 方法2：从表格配置获取
        if (!field) {
            var tableOptions = $('#userTable').bootstrapTable('getOptions');
            if (tableOptions && tableOptions.columns && tableOptions.columns[colIndex]) {
                field = tableOptions.columns[colIndex].field;
                console.log('从表格配置获取:', field);
            }
        }

        // 方法3：通过表头文本映射（备用方案）
        if (!field || field === 'undefined') {
            var headerText = $headerTh.text().trim();
            console.log('表头文本:', headerText);

            // 根据表头文本映射字段名
            var headerToFieldMap = {
                '业务单位': 'c',
                '合同号': 'd',
                '任务号': 'e',
                '零件号': 'lingjianhao',
                '对账状态': 'hetongzhuangtai',
                '工序': 'g',
                '名称': 'h',
                '图号': 'i',
                '单位': 'j',
                '数量': 'k',
                '材质': 'l',
                '出库单号': 'au',
                '序合计': 'av',
                '重量': 'aw',
                '工件尺寸': 'ax',
                '单价元': 'm',
                '合计金额': 'n',
                '铣工时': 'o',
                '铣单价': 'p',
                '铣实际工时': 'xianshiji',
                '车工时': 'q',
                '车单价': 'r',
                '车实际工时': 'cheshiji',
                '钳工时': 's',
                '钳单价': 't',
                '钳实际工时': 'qianshiji',
                '整件外委工时': 'u',
                '整件外委单位': 'v',
                '外委工时': 'w',
                '外委单价': 'x',
                '镗工时': 'y',
                '镗单价': 'z',
                '镗实际工时': 'tangshiji',
                '割工时': 'aa',
                '割单价': 'ab',
                '割实际工时': 'geshiji',
                '磨工时': 'ac',
                '磨单价': 'ad',
                '磨实际工时': 'moshiji',
                '数控铣工时': 'ae',
                '数控铣单价': 'af',
                '数控铣实际工时': 'skxshiji',
                '立车': 'ag',
                '立车单价': 'ah',
                '立车实际工时': 'licheshiji',
                '电火花': 'ai',
                '电火花单价': 'aj',
                '电火花实际工时': 'dianhuohuashiji',
                '中走丝': 'ak',
                '中走丝单价': 'al',
                '中走丝实际工时': 'zhongzuosishiji',
                '精密线切割': 'jingmixianqiege',
                '焊接工时': 'hanjiegongshi',
                '深孔钻': 'an',
                '回厂日期': 'ao',
                '登记日期': 'dengjiriqi',
                '出厂日期': 'ap',
                '订单要求交货时间': 'ay',
                '铣': 'aq',
                '车': 'ar',
                '登记员': 'aas',
                '备注': 'at'
            };

            if (headerToFieldMap[headerText]) {
                field = headerToFieldMap[headerText];
                console.log('从表头文本映射获取:', field);
            }
        }

        // 获取行ID
        var rowIndex = $row.data('index');
        var tableData = $('#userTable').bootstrapTable('getData');
        var rowData = tableData[rowIndex];
        var rowId = rowData ? rowData.id : null;

        console.log('编辑信息:', {
            colIndex: colIndex,
            field: field,
            rowId: rowId,
            originalValue: originalValue,
            rowIndex: rowIndex
        });

        // 验证数据
        if (!field || field === 'undefined') {
            console.error('无法获取字段名');
            swal("编辑失败", "无法获取字段名: " + field, "error");
            return;
        }
        if (!rowId) {
            console.error('无法获取行ID');
            swal("编辑失败", "无法获取行ID，请刷新页面重试", "error");
            return;
        }

        createInputEditor($cell, originalValue, field, rowId, tableData, rowIndex);
    });
}

// 创建下拉框编辑器（bootstrap-table版本）
function createSelectEditor($cell, originalValue, field, rowId, tableData, rowIndex) {
    console.log('创建下拉编辑器，字段:', field, '当前值:', originalValue);

    var $select = $('<select class="form-control cell-edit-select">')
        .css({
            width: '100%',
            minWidth: '100px',
            height: '30px',
            border: '2px solid #007bff',
            borderRadius: '4px',
            padding: '0 5px',
            boxSizing: 'border-box'
        });

    // 完整的对账状态选项
    var options = [
        {value: '', text: '请选择'},
        {value: '已对账', text: '已对账'},
        {value: '未对账', text: '未对账'},
        {value: '已开票', text: '已开票'},
        {value: '未开票', text: '未开票'}
    ];

    // 添加所有选项
    $.each(options, function(index, option) {
        $select.append('<option value="' + option.value + '">' + option.text + '</option>');
    });

    // 设置当前值
    $select.val(originalValue);
    console.log('设置下拉框值:', originalValue, '实际值:', $select.val());

    // 清空单元格并添加下拉框
    $cell.empty().append($select);
    $select.focus();

    // 保存编辑
    function saveEdit() {
        var newValue = $select.val();
        console.log('保存编辑，新值:', newValue, '原值:', originalValue);

        // 如果值没有变化，则不保存
        if (newValue === originalValue) {
            $cell.text(originalValue);
            return;
        }

        // 发送更新请求
        $.ajax({
            type: 'post',
            url: '/ywc/updateField',
            data: JSON.stringify({
                id: rowId,
                [field]: newValue
            }),
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function(res) {
                console.log('更新响应:', res);
                if (res.code == 200) {
                    $cell.text(newValue);
                    // 更新本地数据
                    tableData[rowIndex][field] = newValue;
                    // 重新加载当前页数据
                    getList(currentPage);
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
    $select.off('blur').on('blur', saveEdit);
    $select.off('change').on('change', saveEdit);
    $select.off('keydown').on('keydown', function(e) {
        if (e.keyCode === 27) { // ESC键
            $cell.text(originalValue);
        }
    });
}

// 创建输入框编辑器（bootstrap-table版本）
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
            url: '/ywc/updateField',
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
                    // 重新加载当前页数据
                    getList(currentPage);
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

// 处理行双击事件
function handleRowDoubleClick(row) {
    console.log('双击行:', row);

    if (row && row.id) {
        // 准备传递给工艺规程页面的完整数据
        var processData = {
            // 基础信息
            id: row.id,
            c: row.c || '',           // 业务单位
            e: row.e || '',           // 任务号
            h: row.h || '',           // 名称
            i: row.i || '',           // 图号
            k: row.k || '',           // 数量
            l: row.l || '',           // 材质
        };

        console.log('跳转数据:', processData);

        // 跳转到工艺规程页面
        navigateToProcessPage(processData);
    } else {
        console.warn('无法获取行数据，无法跳转');
        swal("提示", "无法获取行数据，请重试", "warning");
    }
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
            paginationHtml += `<button class="page-number active" data-page="${i}">${i}</button>`;
        } else {
            paginationHtml += `<button class="page-number" data-page="${i}">${i}</button>`;
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

    console.log('分页控件已更新，当前页:', currentPage, '总页数:', totalPages);

    // 绑定分页事件
    bindPaginationEvents();
}

// 绑定分页事件
function bindPaginationEvents() {
    console.log('绑定分页事件，当前页码:', currentPage);

    // 先移除所有事件绑定，避免重复绑定
    $(document).off('click', '.first-page, .prev-page, .next-page, .last-page, .page-number');
    $(document).off('change', '.page-size-select');

    // 使用事件委托绑定到分页容器
    $(document).on('click', '.pagination-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $btn = $(this);
        if ($btn.prop('disabled')) {
            return;
        }

        var action = '';
        if ($btn.hasClass('first-page')) action = 'first';
        else if ($btn.hasClass('prev-page')) action = 'prev';
        else if ($btn.hasClass('next-page')) action = 'next';
        else if ($btn.hasClass('last-page')) action = 'last';

        console.log('分页按钮点击:', action);

        switch(action) {
            case 'first':
                if (currentPage !== 1) {
                    currentPage = 1;
                    getList(currentPage);
                }
                break;
            case 'prev':
                if (currentPage > 1) {
                    currentPage--;
                    getList(currentPage);
                }
                break;
            case 'next':
                if (currentPage < totalPages) {
                    currentPage++;
                    getList(currentPage);
                }
                break;
            case 'last':
                if (currentPage !== totalPages) {
                    currentPage = totalPages;
                    getList(currentPage);
                }
                break;
        }
    });

    // 绑定页码点击事件
    $(document).on('click', '.page-number', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var page = parseInt($(this).text());
        console.log('点击页码:', page, '当前页码:', currentPage);

        if (page !== currentPage) {
            currentPage = page;
            getList(currentPage);
        }
    });

    // 绑定每页显示条数变化事件
    $(document).on('change', '.page-size-select', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var newPageSize = parseInt($(this).val());
        console.log('页面大小改变:', newPageSize, '原大小:', pageSize);

        if (newPageSize !== pageSize) {
            pageSize = newPageSize;
            currentPage = 1; // 重置到第一页
            getList(currentPage);
        }
    });
}

// ============= 后续代码保持不变（工序配置、导出功能等）==============

// 工序配置功能
$(function() {
    // 工序配置按钮点击事件
    $('#gongxu-config-btn').click(function() {
        loadGongxuConfig();
    });

    // 关闭按钮事件
    $('#gongxu-close-btn').click(function() {
        $('#gongxu-modal').modal('hide');
    });
});

// 加载工序配置
function loadGongxuConfig() {
    $.ajax({
        type: 'get',
        url: '/gx/getAll',
        success: function(res) {
            console.log('工序配置响应:', res);
            if (res.code == 200) {
                renderGongxuTable(res.data);
                $('#gongxu-modal').modal('show');
            } else {
                swal("加载失败", res.msg, "error");
            }
        },
        error: function(xhr, status, error) {
            console.error('加载工序配置失败:', error);
            swal("加载失败", "网络错误，请重试", "error");
        }
    });
}

// 渲染工序配置表格
function renderGongxuTable(data) {
    var tbody = $('#gongxuTableBody');
    tbody.empty();

    if (data && data.length > 0) {
        $.each(data, function(index, item) {
            var row = $('<tr>');
            row.append('<td>' + item.id + '</td>');
            row.append('<td>' + (item.name || '') + '</td>');
            row.append('<td><input type="text" class="form-control gongxu-num-input" data-id="' + item.id + '" value="' + (item.num || '') + '"></td>');
            row.append('<td><button class="btn btn-sm btn-primary save-gongxu-btn" data-id="' + item.id + '" data-name="' + (item.name || '') + '">保存</button></td>');
            tbody.append(row);
        });

        // 绑定保存按钮事件
        $('.save-gongxu-btn').click(function() {
            var id = $(this).data('id');
            var name = $(this).data('name');
            var num = $(this).closest('tr').find('.gongxu-num-input').val();
            saveGongxuConfig(id, name, num, $(this));
        });

        // 绑定输入框回车事件
        $('.gongxu-num-input').keydown(function(e) {
            if (e.keyCode === 13) { // Enter键
                var id = $(this).data('id');
                var name = $(this).closest('tr').find('td').eq(1).text();
                var num = $(this).val();
                var $btn = $(this).closest('tr').find('.save-gongxu-btn');
                saveGongxuConfig(id, name, num, $btn);
            }
        });
    } else {
        tbody.append('<tr><td colspan="4" class="text-center">暂无数据</td></tr>');
    }
}

// 保存工序配置
function saveGongxuConfig(id, name, num, $btn) {
    if (!num || num.trim() === '') {
        swal("保存失败", "单价不能为空", "error");
        return;
    }

    // 验证数字格式
    if (isNaN(num)) {
        swal("保存失败", "单价必须是数字", "error");
        return;
    }

    var gongxuData = {
        id: id,
        name: name,
        num: num
    };

    console.log('保存工序配置:', gongxuData);

    // 禁用按钮防止重复点击
    $btn.prop('disabled', true).text('保存中...');

    $.ajax({
        type: 'post',
        url: '/gx/update',
        data: JSON.stringify(gongxuData),
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function(res) {
            if (res.code == 200) {
                swal("保存成功", "工序单价已更新", "success");
                // 重新加载数据确保显示最新值
                loadGongxuConfig();
            } else {
                swal("保存失败", res.msg, "error");
                $btn.prop('disabled', false).text('保存');
            }
        },
        error: function(xhr, status, error) {
            console.error('保存工序配置失败:', error);
            swal("保存失败", "网络错误，请重试", "error");
            $btn.prop('disabled', false).text('保存');
        }
    });
}

// 显示导出设置模态框
function showExportModal() {
    var defaultFileName = '业务查询_' + getCurrentDate();
    $('#export-filename').val(defaultFileName);
    $('#exportModal').modal('show');
}

// 获取当前日期
function getCurrentDate() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    return year + month + day;
}

// 日期格式化函数
function formatDate(date, format) {
    var d = new Date(date);
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');

    switch(format) {
        case 'YYYYMMDD':
            return year + month + day;
        case 'YYYY-MM-DD':
            return year + '-' + month + '-' + day;
        case 'YYYY年MM月DD日':
            return year + '年' + month + '月' + day + '日';
        default:
            return year + month + day;
    }
}

// 导出到Excel功能
function exportToExcel(filename) {
    console.log('开始导出Excel:', filename);

    showExportLoading();

    // 构建查询参数（获取所有数据）
    var name = $('#name').val() || '';
    var hetongZhuangtai = $('#hetongZhuangtai').val() || '';
    var hetongHao = $('#hetonghao').val() || '';
    var renwuHao = $('#renwuhao').val() || '';
    var tuhao = $('#tuhao').val() || '';

    var params = {
        pageNum: 1,
        pageSize: 9999999
    };

    // 添加查询条件
    if (name) params.name = name;
    if (hetongZhuangtai) params.hetongZhuangtai = hetongZhuangtai;
    if (hetongHao) params.hetongHao = hetongHao;
    if (renwuHao) params.renwuHao = renwuHao;
    if (tuhao) params.renwuHao = tuhao;

    $.ajax({
        type: 'post',
        url: '/ywc/getList',
        data: JSON.stringify(params),
        contentType: 'application/json',
        dataType: 'json',
        success: function (res) {
            hideExportLoading();

            if (res.code === 200 && res.data && res.data.list && res.data.list.length > 0) {
                console.log('获取到数据，开始导出:', res.data.list.length, '条记录');
                createExcelFile(res.data.list, filename);
            } else {
                swal('没有数据可以导出');
            }
        },
        error: function (xhr, status, error) {
            hideExportLoading();
            console.error('导出请求失败:', error);
            swal('导出失败: ' + error);
        }
    });
}

// 创建Excel文件
function createExcelFile(data, filename) {
    try {
        // 检查 SheetJS 是否已加载
        if (typeof XLSX === 'undefined') {
            swal('导出功能初始化失败，请刷新页面重试');
            return;
        }

        // 准备Excel数据 - 根据表格列顺序
        var excelData = data.map(function(item) {
            return {
                '业务单位': item.c || '',
                '合同号': item.d || '',
                '任务号': item.e || '',
                '零件号': item.lingjianhao || '',
                '对账状态': item.hetongzhuangtai || '',
                '工序': item.g || '',
                '名称': item.h || '',
                '图号': item.i || '',
                '单位': item.j || '',
                '数量': item.k || '',
                '材质': item.l || '',
                '出库单号': item.au || '',
                '序合计': item.av || '',
                '重量': item.aw || '',
                '工件尺寸': item.ax || '',
                '单价元': item.m || '',
                '合计金额': item.n || '',
                '铣工时': item.o || '',
                '铣单价': item.p || '',
                '铣实际工时': item.xianshiji || '',
                '车工时': item.q || '',
                '车单价': item.r || '',
                '车实际工时': item.cheshiji || '',
                '钳工时': item.s || '',
                '钳单价': item.t || '',
                '钳实际工时': item.qianshiji || '',
                '整件外委工时': item.u || '',
                '整件外委单位': item.v || '',
                '外委工时': item.w || '',
                '外委单价': item.x || '',
                '镗工时': item.y || '',
                '镗单价': item.z || '',
                '镗实际工时': item.tangshiji || '',
                '割工时': item.aa || '',
                '割单价': item.ab || '',
                '割实际工时': item.geshiji || '',
                '磨工时': item.ac || '',
                '磨单价': item.ad || '',
                '磨实际工时': item.moshiji || '',
                '数控铣工时': item.ae || '',
                '数控铣单价': item.af || '',
                '数控铣实际工时': item.skxshiji || '',
                '立车': item.ag || '',
                '立车单价': item.ah || '',
                '立车实际工时': item.licheshiji || '',
                '电火花': item.ai || '',
                '电火花单价': item.aj || '',
                '电火花实际工时': item.dianhuohuashiji || '',
                '中走丝': item.ak || '',
                '中走丝单价': item.al || '',
                '中走丝实际工时': item.zhongzuosishiji || '',
                '精密线切割': item.jingmixianqiege || '',
                '焊接工时': item.hanjiegongshi || '',
                '深孔钻': item.an || '',
                '回厂日期': item.ao || '',
                '登记日期': item.dengjiriqi || '',
                '出厂日期': item.ap || '',
                // '实际交货日期': item.shijijiaohuoriqi || '',
                // '订单要求交货时间': item.ay || '',
                '铣': item.aq || '',
                '车': item.ar || '',
                '登记员': item.aas || '',
                '备注': item.at || ''
            };
        });

        // 创建工作簿
        var wb = XLSX.utils.book_new();

        // 创建工作表
        var ws = XLSX.utils.json_to_sheet(excelData);

        // 设置列宽
        var colWidths = [
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
            { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 8 },
            { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
            { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 10 },
            { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
            { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
            { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
            { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
            { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 10 },
            { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
            { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 8 },
            { wch: 8 }, { wch: 10 },{ wch: 15 }
        ];
        ws['!cols'] = colWidths;

        // 添加工作表
        XLSX.utils.book_append_sheet(wb, ws, '业务查询记录');

        // 导出文件
        XLSX.writeFile(wb, filename);

        console.log('Excel文件导出成功:', filename);

        // 显示成功消息
        setTimeout(function() {
            swal(`导出成功！\n文件名：${filename}`);
        }, 500);

    } catch (error) {
        console.error('创建Excel文件错误:', error);
        swal('导出失败: ' + error.message);
    }
}

// 显示导出加载中
function showExportLoading() {
    $('#export-btn').prop('disabled', true).html('<i class="bi bi-hourglass-split icon"></i> 导出中...');

    // 添加加载提示
    if (!$('#export-loading').length) {
        $('body').append(`
            <div id="export-loading" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 5px; z-index: 9999;">
                <div style="text-align: center;">
                    <i class="bi bi-hourglass-split" style="font-size: 24px;"></i>
                    <div style="margin-top: 10px;">正在准备导出数据，请稍候...</div>
                </div>
            </div>
        `);
    }
}

// 隐藏导出加载中
function hideExportLoading() {
    $('#export-btn').prop('disabled', false).html('<i class="bi bi-file-earmark-excel icon"></i> 导出Excel');
    $('#export-loading').remove();
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

//页面渲染数据
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
        pagination: false, // 关键修改：禁用分页
        clickToSelect: false, // 禁用默认的点击选择
        height: 400,                    // 必须设置高度
        fixedHeader: true,
        locale: 'zh-CN',
        rowStyle: function(row, index) {
            // 检查 biaozhu 字段是否有值
            if (row.biaozhu && row.biaozhu.trim() !== '') {
                // 返回特定样式，例如浅黄色背景
                return {
                    classes: 'highlighted-row'
                };
            }
            return {};
        },
        rowAttributes: function(row, index) {
            return {
                'data-index': index,
                'data-id': row.id
            };
        },
        columns: [
            {
                field: 'biaozhu',
                title: '标注',
                align: 'center',
                sortable: true,
                width: 120,  // 根据内容调整宽度
                class: 'editable'
            },
            {
                field: 'c',
                title: '业务单位',
                align: 'center',
                sortable: true,
                width: 120,  // 根据内容调整宽度
                class: 'editable'
            }, {
                field: 'd',
                title: '合同号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },{
                field: 'e',
                title: '任务号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },
            {
                field: 'lingjianhao',
                title: '零件号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'hetongzhuangtai',
                title: '对账状态',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable',
                formatter: function(value, row, index) {
                    // 显示当前值
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
            },{
                field: 'au',
                title: '出库单号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },  {
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
                field: 'xianshiji',
                title: '铣实际工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },{
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
                field: 'cheshiji',
                title: '车实际工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },{
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
            },{
                field: 'qianshiji',
                title: '钳实际工时',
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
            },{
                field: 'tangshiji',
                title: '镗实际工时',
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
            },{
                field: 'geshiji',
                title: '割实际工时',
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
                field: 'moshiji',
                title: '磨实际工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },{
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
            },{
                field: 'skxshiji',
                title: '数控铣实际工时',
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
                field: 'licheshiji',
                title: '立车实际工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },{
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
                field: 'dianhuohuashiji',
                title: '电火花实际工时',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },{
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
            },{
                field: 'zhongzuosishiji',
                title: '中走丝实际工时',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },{
                field: 'jingmixianqiege',
                title: '精密线切割',
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
            },{
                field: 'hanjiegongshi', // 注意：这里用的是 hanjiegongshi 而不是 am
                title: '焊接工时',
                align: 'center',
                sortable: true,
                width: 100,
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
            console.log('表格渲染完成');
            // 启用单元格编辑
            setTimeout(function() {
                enableCellEditing();
            }, 100);
            // 初始化拖动
            setTimeout(function() {
                initTableDragScroll();
            }, 300);

            // 表格渲染完成后启用单元格编辑
            enableCellEditing();
        },
        onClickRow: function (row, $element) {
            let isSelect = $element.hasClass('selected')
            if (isSelect) {
                $element.removeClass('selected')
            } else {
                $element.addClass('selected')
            }
        },
        onDblClickRow: function(row, $element) {
            handleRowDoubleClick(row);
        }

    });

    // 强制刷新表格视图
    $('#userTable').bootstrapTable('load', data);
    $('#userTable').bootstrapTable('resetView');
}


function calculateSelectedRows() {
    // 获取选中的行
    let rows = getTableSelection("#userTable");
    if (rows.length == 0) {
        swal('请选择要计算的数据！');
        return;
    }

    let requestDataList = [];
    $.each(rows, function (index, row) {
        if (row.data && row.data.id) {
            // 获取整行的所有数据
            let rowData = row.data;

            // 构建请求数据，包含id和所有字段（除了空值）
            let requestData = {
                id: rowData.id
            };

            // 遍历所有字段，添加到请求数据中
            Object.keys(rowData).forEach(function(field) {
                let value = rowData[field];
                // 只添加非空值，减少传输数据量
                if (value !== null && value !== undefined && value !== '') {
                    // 特殊处理：将空对象、空数组转为空字符串
                    if (typeof value === 'object') {
                        if (Object.keys(value).length === 0) {
                            value = '';
                        } else {
                            // 复杂对象转为JSON字符串
                            value = JSON.stringify(value);
                        }
                    }
                    requestData[field] = value;
                }
            });

            console.log('第' + index + '行发送的数据:', requestData);
            requestDataList.push(requestData);
        } else {
            console.warn('第' + index + '行没有找到ID，数据:', row);
        }
    });

    if (requestDataList.length === 0) {
        swal("错误", "未找到有效的行数据", "error");
        return;
    }

    console.log('准备计算的数据（共' + requestDataList.length + '条）:', requestDataList);

    // 显示计算中提示
    swal({
        title: "计算中...",
        text: "正在计算选中的 " + requestDataList.length + " 条记录\n后端将处理所有传入字段",
        icon: "info",
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false
    });

    // 存储成功和失败的数量
    let successCount = 0;
    let failCount = 0;
    let totalCount = requestDataList.length;

    // 使用Promise.all来处理并发请求
    let promises = requestDataList.map(function(data) {
        return new Promise(function(resolve, reject) {
            console.log('发送数据（ID ' + data.id + '）字段数:', Object.keys(data).length);

            $.ajax({
                type: 'post',
                url: '/ywc/updateField',
                data: JSON.stringify(data),  // 传递包含id和所有字段的对象
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                success: function(res) {
                    console.log('ID ' + data.id + ' 计算响应:', res);
                    if (res.code == 200) {
                        successCount++;
                        resolve({ id: data.id, success: true, msg: res.msg });
                    } else {
                        failCount++;
                        resolve({ id: data.id, success: false, msg: res.msg });
                    }
                },
                error: function(xhr, status, error) {
                    console.error('ID ' + data.id + ' 计算请求失败:', error);
                    failCount++;
                    resolve({ id: data.id, success: false, msg: "网络错误" });
                }
            });
        });
    });

    // 所有请求完成后
    Promise.all(promises).then(function(results) {
        // 关闭计算中提示
        swal.close();

        // 重新加载数据
        getList(currentPage);

        // 显示计算结果
        let message = "计算完成！\n\n";
        message += "✓ 成功: " + successCount + " 条\n";
        message += "✗ 失败: " + failCount + " 条\n";
        message += "总计: " + totalCount + " 条\n\n";

        // 显示每个成功处理的字段数
        if (successCount > 0 && requestDataList.length > 0) {
            let firstData = requestDataList[0];
            let fieldCount = Object.keys(firstData).length - 1; // 减去id字段
            message += "每条记录传递了 " + fieldCount + " 个字段\n";
            message += "后端已按照原有逻辑处理所有字段";
        }

        if (failCount === 0) {
            swal({
                title: "计算成功",
                text: message,
                icon: "success",
                timer: 3000,
                buttons: false
            });
        } else {
            swal({
                title: "计算完成（有失败记录）",
                text: message,
                icon: "warning",
                buttons: ["确定", "查看详情"]
            }).then((value) => {
                if (value) {
                    // 显示失败详情
                    let failDetails = results.filter(r => !r.success);
                    let detailMsg = "失败记录详情：\n\n";
                    failDetails.forEach(item => {
                        detailMsg += "ID: " + item.id + " - " + item.msg + "\n";
                    });
                    swal("失败记录详情", detailMsg, "info");
                }
            });
        }
    }).catch(function(error) {
        swal.close();
        console.error('计算过程中出错:', error);
        swal("计算异常", "计算过程中出现异常错误", "error");
    });
}

function loadhth() {
    console.log('开始加载员工列表...');

    $ajax({
        type: 'post',
        url: '/ywc/gethth',
        contentType: 'application/json',
        dataType: 'json'
    }, false, '', function(res) {
        if (res.code === 200) {
            console.log('获取员工列表成功:', res.data);

            var $select = $('#hetonghao');
            $select.empty(); // 清空现有选项
            $select.append('<option value="">请选择合同号</option>');

            if (res.data && Array.isArray(res.data)) {
                // 遍历数据，从m字段获取员工姓名
                res.data.forEach(function(item) {
                    // 安全地获取m字段的值
                    var employeeName = item && item.d;

                    // 检查是否为有效的字符串
                    if (employeeName != null && employeeName !== '') {
                        // 转换为字符串并去除首尾空格
                        var nameStr = String(employeeName).trim();
                        if (nameStr !== '') {
                            $select.append(
                                '<option value="' + nameStr + '">' +
                                nameStr +
                                '</option>'
                            );
                        }
                    }
                });

                console.log('已加载 ' + res.data.length + ' 个员工选项');
            } else {
                console.warn('员工数据格式异常:', res.data);
                $select.append('<option value="">暂无合同号数据</option>');
            }
        } else {
            console.error('获取员工列表失败:', res.msg);
            $('#hetonghao').html('<option value="">加载失败</option>');
        }
    });
}


function loadywdw() {
    console.log('开始加载员工列表...');

    $ajax({
        type: 'post',
        url: '/ywc/getywdw',
        contentType: 'application/json',
        dataType: 'json'
    }, false, '', function(res) {
        if (res.code === 200) {
            console.log('获取员工列表成功:', res.data);

            var $select = $('#name');
            $select.empty(); // 清空现有选项
            $select.append('<option value="">请选择业务单位</option>');

            if (res.data && Array.isArray(res.data)) {
                // 遍历数据，从m字段获取员工姓名
                res.data.forEach(function(item) {
                    // 安全地获取m字段的值
                    var employeeName = item && item.c;

                    // 检查是否为有效的字符串
                    if (employeeName != null && employeeName !== '') {
                        // 转换为字符串并去除首尾空格
                        var nameStr = String(employeeName).trim();
                        if (nameStr !== '') {
                            $select.append(
                                '<option value="' + nameStr + '">' +
                                nameStr +
                                '</option>'
                            );
                        }
                    }
                });

                console.log('已加载 ' + res.data.length + ' 个员工选项');
            } else {
                console.warn('员工数据格式异常:', res.data);
                $select.append('<option value="">暂无业务单位数据</option>');
            }
        } else {
            console.error('获取员工列表失败:', res.msg);
            $('#name').html('<option value="">加载失败</option>');
        }
    });
}


function loadrwh() {
    console.log('开始加载员工列表...');

    $ajax({
        type: 'post',
        url: '/ywc/getrwh',
        contentType: 'application/json',
        dataType: 'json'
    }, false, '', function(res) {
        if (res.code === 200) {
            console.log('获取员工列表成功:', res.data);

            var $select = $('#renwuhao');
            $select.empty(); // 清空现有选项
            $select.append('<option value="">请选择任务号</option>');

            if (res.data && Array.isArray(res.data)) {
                // 遍历数据，从m字段获取员工姓名
                res.data.forEach(function(item) {
                    // 安全地获取m字段的值
                    var employeeName = item && item.e;

                    // 检查是否为有效的字符串
                    if (employeeName != null && employeeName !== '') {
                        // 转换为字符串并去除首尾空格
                        var nameStr = String(employeeName).trim();
                        if (nameStr !== '') {
                            $select.append(
                                '<option value="' + nameStr + '">' +
                                nameStr +
                                '</option>'
                            );
                        }
                    }
                });

                console.log('已加载 ' + res.data.length + ' 个员工选项');
            } else {
                console.warn('员工数据格式异常:', res.data);
                $select.append('<option value="">暂无任务号数据</option>');
            }
        } else {
            console.error('获取员工列表失败:', res.msg);
            $('#renwuhao').html('<option value="">加载失败</option>');
        }
    });
}


function loadth() {
    console.log('开始加载员工列表...');

    $ajax({
        type: 'post',
        url: '/ywc/getth',
        contentType: 'application/json',
        dataType: 'json'
    }, false, '', function(res) {
        if (res.code === 200) {
            console.log('获取员工列表成功:', res.data);

            var $select = $('#tuhao');
            $select.empty(); // 清空现有选项
            $select.append('<option value="">请选择图号</option>');

            if (res.data && Array.isArray(res.data)) {
                // 遍历数据，从m字段获取员工姓名
                res.data.forEach(function(item) {
                    // 安全地获取m字段的值
                    var employeeName = item && item.i;

                    // 检查是否为有效的字符串
                    if (employeeName != null && employeeName !== '') {
                        // 转换为字符串并去除首尾空格
                        var nameStr = String(employeeName).trim();
                        if (nameStr !== '') {
                            $select.append(
                                '<option value="' + nameStr + '">' +
                                nameStr +
                                '</option>'
                            );
                        }
                    }
                });

                console.log('已加载 ' + res.data.length + ' 个员工选项');
            } else {
                console.warn('员工数据格式异常:', res.data);
                $select.append('<option value="">暂无图号数据</option>');
            }
        } else {
            console.error('获取员工列表失败:', res.msg);
            $('#tuhao').html('<option value="">加载失败</option>');
        }
    });
}