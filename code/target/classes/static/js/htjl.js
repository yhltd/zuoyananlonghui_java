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
var currentPage = 1;
var pageSize = 20;
var totalCount = 0;
var totalPages = 0;
// 在 htjl.js 文件中添加
function initTitleInputs() {
    // 初始化标题输入框的代码
    console.log("initTitleInputs 函数被调用");
}

function getList(page, size, searchParams) {
    $('#name').val("");
    $('#power').val("");
    currentPage = page || currentPage;
    pageSize = size || pageSize;
    searchParams = searchParams || {};
    $ajax({
        type: 'post',
        url: '/htjl/getListExcludeThjl',
        contentType: 'application/json',
        data: JSON.stringify({
            pageNum: currentPage,
            pageSize: pageSize,
            C: searchParams.C || '',
            zhuangtai:searchParams.zhuangtai|| ''// 订单号（后端需要但前端没有，传空）
        }),
        dataType: 'json'
    }, false, '', function (res) {
        if (res.code === 200) {
            // 保存数据到全局变量
            setTable(res.data.records);
            totalCount = res.data.total;
            totalPages = res.data.pages;
            updatePagination();
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

    loadReturnNos();
    // 新增：加载客户列表
    loadCustomerList();

    // 确保导入按钮只绑定一次
    $('#import-btn').click(function() {
        // 重置状态
        $('#fileInfo').hide();
        $('#simpleImportBtn').prop('disabled', true);
        $('#importModal').modal('show');
    });

    // 文件选择事件
    $('#simpleExcelFile').change(function(e) {
        var file = e.target.files[0];

        if (!file) {
            $('#fileInfo').hide();
            $('#simpleImportBtn').prop('disabled', true);
            return;
        }

        // 检查文件类型
        var validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/excel',
            'application/x-excel',
            'application/x-msexcel'
        ];

        var fileExt = file.name.split('.').pop().toLowerCase();

        if (!validTypes.includes(file.type) && !['xlsx', 'xls'].includes(fileExt)) {
            swal('文件格式错误', '请选择Excel文件 (.xlsx 或 .xls)', 'error');
            $(this).val('');
            $('#fileInfo').hide();
            $('#simpleImportBtn').prop('disabled', true);
            return;
        }

        // 显示文件信息
        $('#fileName').text(file.name);

        // 格式化文件大小
        var fileSize = file.size;
        var sizeText = fileSize < 1024 ? fileSize + ' B' :
            fileSize < 1024 * 1024 ? (fileSize / 1024).toFixed(1) + ' KB' :
                (fileSize / (1024 * 1024)).toFixed(1) + ' MB';
        $('#fileSize').text(sizeText);

        $('#fileInfo').show();
        $('#simpleImportBtn').prop('disabled', false);
    });

    // 开始导入按钮
    $('#simpleImportBtn').click(function() {
        var fileInput = document.getElementById('simpleExcelFile');

        if (!fileInput.files[0]) {
            swal('请先选择文件', '', 'warning');
            return;
        }

        var file = fileInput.files[0];
        console.log('开始导入文件:', file.name);

        // 禁用按钮显示加载状态
        var $btn = $(this);
        var originalText = $btn.html();
        $btn.prop('disabled', true).html('<i class="bi bi-hourglass-split me-2"></i>导入中...');

        // 显示进度提示
        var progressHtml = `
        <div class="text-center py-3">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="sr-only">导入中...</span>
            </div>
            <h6>正在导入数据...</h6>
            <p class="text-muted small">文件: ${file.name}</p>
            <p class="text-muted small">请稍候，这可能需要几秒钟</p>
        </div>
    `;

        $('.modal-body').html(progressHtml);

        // 读取文件
        var reader = new FileReader();

        reader.onload = function(e) {
            try {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, { type: 'array' });

                if (workbook.SheetNames.length === 0) {
                    showImportResult(false, 'Excel文件中没有工作表');
                    return;
                }

                // 读取第一个工作表
                var worksheet = workbook.Sheets[workbook.SheetNames[0]];

                // 转换为JSON
                var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length <= 1) {
                    showImportResult(false, 'Excel文件中没有有效数据');
                    return;
                }

                // 转换数据格式
                var dataToImport = convertExcelData(jsonData);

                if (dataToImport.length === 0) {
                    showImportResult(false, '没有可导入的数据');
                    return;
                }

                console.log('准备导入数据:', dataToImport.length, '条');

                // 发送到服务器
                sendImportData(dataToImport, file.name);

            } catch (error) {
                console.error('Excel解析错误:', error);
                showImportResult(false, '文件解析失败: ' + error.message);
            }
        };

        reader.onerror = function(error) {
            console.error('文件读取错误:', error);
            showImportResult(false, '文件读取失败');
        };

        reader.readAsArrayBuffer(file);
    });



    $('#goto-return-btn').click(function(e) {
        e.preventDefault();
        console.log('跳转到出库单按钮被点击');
        gotoReturnOrderPage();
    });

    initReturnOrder();

    // 初始化标题输入框
    initTitleInputs();
    // 绑定搜索事件
    $('#select-btn').off('click').on('click', function() {
        searchDdmx();
    });

    // 绑定查询按钮事件 - 放在这里
    $('#sle-row-btn').click(function() {
        // 获取选择的退货单号
        var selectedReturnNo = $('#return-no-select').val();

        if (!selectedReturnNo || selectedReturnNo === '') {
            swal("提示", "请先选择退货单号", "info");
            return;
        }

        // 显示加载状态
        var $btn = $(this);
        var originalText = $btn.html();
        $btn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> 查询中...');

        // 查询退货单
        searchReturnOrder(selectedReturnNo, function() {
            // 查询完成后恢复按钮状态
            $btn.prop('disabled', false).html(originalText);
        });
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

        // 手动构建参数，按照表格字段对应
        let params = {
            c: $('#add-c').val(),              // 业务单位
            d: $('#add-d').val(),              // 合同号
            e: $('#add-e').val(),              // 任务号
            zhuangtai: $('#add-zhuangtai').val(), // 工艺规程状态（修改）
            g: $('#add-g').val(),              // 工序
            h: $('#add-h').val(),              // 名称
            i: $('#add-i').val(),              // 图号
            j: $('#add-j').val(),              // 单位
            k: $('#add-k').val(),              // 数量
            l: $('#add-l').val(),              // 材质
            av: $('#add-av').val(),            // 序合计（修改）
            aw: $('#add-aw').val(),            // 重量（修改）
            ax: $('#add-ax').val(),            // 工件尺寸（修改）
            m: $('#add-m').val(),              // 单价元（修改）
            n: $('#add-n').val(),              // 合计金额（修改）
            o: $('#add-o').val(),              // 铣工时（修改）
            p: $('#add-p').val(),              // 铣单价（修改）
            q: $('#add-q').val(),              // 车工时（修改）
            r: $('#add-r').val(),              // 车单价（修改）
            s: $('#add-s').val(),              // 钳工时（修改）
            t: $('#add-t').val(),              // 钳单价（修改）
            u: $('#add-u').val(),              // 整件外委工时（修改）
            v: $('#add-v').val(),              // 整件外委单位（修改）
            w: $('#add-w').val(),              // 外委工时（修改）
            x: $('#add-x').val(),              // 外委单价（修改）
            y: $('#add-y').val(),              // 镗工时（修改）
            z: $('#add-z').val(),              // 镗单价（修改）
            aa: $('#add-aa').val(),            // 割工时（修改）
            ab: $('#add-ab').val(),            // 割单价（修改）
            ac: $('#add-ac').val(),            // 磨工时（修改）
            ad: $('#add-ad').val(),            // 磨单价（修改）
            ae: $('#add-ae').val(),            // 数控铣工时（修改）
            af: $('#add-af').val(),            // 数控铣单价（修改）
            ag: $('#add-ag').val(),            // 立车（修改）
            ah: $('#add-ah').val(),            // 立车单价（修改）
            ai: $('#add-ai').val(),            // 电火花（修改）
            aj: $('#add-aj').val(),            // 电火花单价（修改）
            ak: $('#add-ak').val(),            // 中走丝（修改）
            al: $('#add-al').val(),            // 中走丝单价（修改）
            am: $('#add-am').val(),            // 下料（修改）
            an: $('#add-an').val(),            // 深孔钻（修改）
            ao: $('#add-ao').val(),            // 回厂日期（修改）
            ap: $('#add-ap').val(),            // 出厂日期（修改）
            ay: $('#add-ay').val(),            // 订单要求交货时间（修改）
            aq: $('#add-aq').val(),            // 铣（修改）
            ar: $('#add-ar').val(),            // 车（修改）
            aas: $('#add-aas').val(),          // 登记员（新增）
            at: $('#add-at').val()             // 备注（修改）
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

    // 延迟初始化表格拖动滚动
    setTimeout(function() {
        initTableDragScroll();
    }, 1000);

    // 监听表格刷新事件
    $(document).on('post-body.bs.table', function(e, data) {
        if ($(e.target).is('#userTable')) {
            console.log('表格已刷新，重新初始化拖动滚动');
            setTimeout(function() {
                initTableDragScroll();
            }, 300);
        }
    });
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
        pagination: false, // 关键修改：禁用分页
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
            // 延迟初始化表格拖动滚动
            setTimeout(function() {
                initTableDragScroll();
            }, 300);
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

        // // 特殊处理工艺规程状态字段 - 使用下拉框
        // if (field === 'zhuangtai') {
        //     createSelectEditor($cell, originalValue, field, rowId, tableData, rowIndex);
        // } else {
            createInputEditor($cell, originalValue, field, rowId, tableData, rowIndex);
        // }
    });
}

// // 创建下拉框编辑器（针对工艺规程状态字段）
// function createSelectEditor($cell, originalValue, field, rowId, tableData, rowIndex) {
//     var $select = $('<select class="form-control cell-edit-select">')
//         .css({
//             width: '100%',
//             height: '100%',
//             border: '1px solid #007bff',
//             borderRadius: '3px',
//             padding: '2px 5px'
//         });
//
//     // 添加工艺规程状态选项
//     $select.append('<option value="">请选择</option>');
//     $select.append('<option value="未创建">未创建</option>');
//     $select.append('<option value="未创建">未创建</option>');
//
//     // 设置当前值
//     $select.val(originalValue);
//
//     // 清空单元格内容并添加下拉框
//     $cell.empty().append($select);
//     $select.focus();
//
//     // 保存编辑
//     function saveEdit() {
//         var newValue = $select.val();
//
//         // 如果值没有变化，则不保存
//         if (newValue === originalValue) {
//             $cell.text(originalValue);
//             return;
//         }
//
//         console.log('发送更新:', { id: rowId, field: field, newValue: newValue });
//
//         // 发送更新请求
//         $.ajax({
//             type: 'post',
//             url: '/htjl/updateField',
//             data: JSON.stringify({
//                 id: rowId,
//                 [field]: newValue
//             }),
//             dataType: 'json',
//             contentType: 'application/json;charset=utf-8',
//             success: function(res) {
//                 if (res.code == 200) {
//                     $cell.text(newValue);
//                     // 更新本地数据
//                     tableData[rowIndex][field] = newValue;
//                     // 注释掉这行，避免重新加载表格中断编辑状态
//                     // getList();
//                 } else {
//                     $cell.text(originalValue);
//                     swal("更新失败", res.msg, "error");
//                 }
//             },
//             error: function(xhr, status, error) {
//                 $cell.text(originalValue);
//                 console.error('更新请求失败:', error);
//                 swal("更新失败", "网络错误，请重试", "error");
//             }
//         });
//     }
//
//     // 绑定事件
//     $select.on('blur', saveEdit);
//     $select.on('change', saveEdit); // 选择即保存
//     $select.on('keydown', function(e) {
//         if (e.keyCode === 27) { // ESC键
//             $cell.text(originalValue);
//         }
//     });
// }

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
// 添加打印按钮事件绑定
    $('#print-btn').off('click').on('click', function() {
        printReturnOrder();
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


        //------------------------

        // 先检查退货单号是否已存在
        checkReturnNoExists(returnNo, function(exists, count) {
            if (exists) {
                // 使用alert对话框提示用户
                var userChoice = confirm(`退货单号 ${returnNo} 在数据库中已有 ${count} 条记录\n\n是否要删除原有数据并保存新数据？`);

                if (userChoice) {
                    // 用户点击"确定" - 先删除已有数据，再保存新数据
                    deleteExistingReturnOrder(returnNo, function() {
                        // 删除成功后保存新数据
                        saveReturnOrderData();
                    });
                } else {
                    // 用户点击"取消" - 清空页面表格
                    clearReturnForm();
                    alert("已清空页面表格，请重新填写数据");
                }
            } else {
                // 直接保存数据
                saveReturnOrderData();
            }
        });
    });

    //-------------------------------------

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
        let customerName = firstRow.c || '';

        // 修改这里：将设置下拉框值改为设置默认值函数
        setTimeout(function() {
            setReturnCustomerDefault(customerName);
        }, 100); // 延迟100ms确保下拉框已加载

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

// 设置退货客户下拉框默认值
function setReturnCustomerDefault(customerName) {
    if (!customerName || customerName.trim() === '') return;
    var $select = $('#return-customer');
    // 检查下拉框是否已加载
    if ($select.length === 0) {
        console.warn('退货客户下拉框未找到');
        return;
    }
    // 检查下拉框中是否存在该客户
    var exists = false;
    $select.find('option').each(function() {
        if ($(this).val() === customerName) {
            exists = true;
            return false; // 退出循环
        }
    });
    if (exists) {
        // 如果存在，直接设置选中
        $select.val(customerName);
        console.log('已设置退货客户:', customerName);
    } else {
        // 如果不存在，先检查是否已经有默认选项
        if ($select.find('option[value=""]').length > 0) {
            // 如果有默认空选项，添加到下拉框并选中
            $select.append('<option value="' + customerName + '">' + customerName + '</option>');
            $select.val(customerName);
            console.log('已添加并设置退货客户:', customerName);
        } else {
            // 没有默认选项，直接添加选中
            $select.append('<option value="' + customerName + '" selected>' + customerName + '</option>');
            console.log('已添加并选中退货客户:', customerName);
        }
    }
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


// 加载退货单号下拉框
function loadReturnNos() {
    console.log('开始加载退货单号...');

    $ajax({
        type: 'post',
        url: '/htjl/gettdh',
        contentType: 'application/json',
        dataType: 'json'
    }, false, '', function(res) {
        if (res.code == 200) {
            console.log('获取退货单号成功:', res);

            var $select = $('#return-no-select');
            $select.empty(); // 清空现有选项

            // 添加默认选项
            $select.append('<option value="">请选择退货单号</option>');

            // 检查数据结构，确保有数据
            if (res.data && Array.isArray(res.data)) {
                // 去重并排序
                var uniqueReturnNos = [...new Set(res.data.map(item => item.f || ''))].filter(Boolean).sort();

                // 添加选项
                uniqueReturnNos.forEach(function(returnNo) {
                    if (returnNo) {
                        $select.append('<option value="' + returnNo + '">' + returnNo + '</option>');
                    }
                });

                console.log('已加载 ' + uniqueReturnNos.length + ' 个退货单号');

            } else if (typeof res.data === 'string') {
                // 如果返回的是单个字符串
                $select.append('<option value="' + res.data + '">' + res.data + '</option>');
            } else {
                console.warn('退货单号数据格式异常:', res.data);
                $select.append('<option value="">暂无数据</option>');
            }

            // 触发change事件（如果有默认选择）
            $select.trigger('change');

        } else {
            console.error('获取退货单号失败:', res.msg);
            $('#return-no-select').html('<option value="">加载失败</option>');
        }
    });
}


// 查询特定退货单
function searchReturnOrder(returnNo, callback) {
    console.log('开始查询退货单:', returnNo);


    $ajax({
        type: 'post',
        url: '/htjl/searchReturnOrder',
        data: {
            returnNo: returnNo
        },
        dataType: 'json'
    }, false, '', function(res) {

        if (callback && typeof callback === 'function') {
            callback();
        }

        if (res.code == 200) {
            console.log('查询退货单成功:', res.data);

            if (res.data && res.data.length > 0) {
                // 填充退货单数据到表格
                fillReturnTable(res.data);

                // 设置退货单信息
                if (res.data[0]) {
                    var firstRecord = res.data[0];
                    $('#return-no').val(firstRecord.f || returnNo);

                    // 修改这里：将设置输入框值改为设置下拉框默认值
                    var customerName = firstRecord.c || '';
                    setTimeout(function() {
                        setReturnCustomerDefault(customerName);
                    }, 100);

                    $('#return-phone').val(firstRecord.d || '');
                    $('#return-date').val(firstRecord.e || getCurrentDate());
                    $('#company-address').val(firstRecord.r || '');
                    $('#company-phone').val(firstRecord.t || '');
                    $('#customer-signature').val(firstRecord.s || '');
                }

                swal("查询成功", "找到 " + res.data.length + " 条退货记录", "success");

                // 显示退货单模态框
                $('#return-modal').modal('show');
            } else {
                swal("查询结果", "未找到退货单号为 " + returnNo + " 的记录", "info");
            }
        } else {
            swal("查询失败", res.msg || "查询退货单失败", "error");
        }
    });
}

// 查询所有退货单
function searchAllReturnOrders() {
    swal("请输入退货单号");
    return;
    showLoading();

    $ajax({
        type: 'post',
        url: '/htjl/getAllReturnOrders',
        contentType: 'application/json',
        dataType: 'json'
    }, false, '', function(res) {

        if (res.code == 200) {
            console.log('查询所有退货单成功:', res.data);

            if (res.data && res.data.length > 0) {
                swal("查询结果", "共找到 " + res.data.length + " 条退货记录", "info");

                // 可以在这里显示所有退货单的统计信息
                displayReturnStatistics(res.data);
            } else {
                swal("查询结果", "暂无退货记录", "info");
            }
        } else {
            swal("查询失败", res.msg || "查询退货单失败", "error");
        }
    });
}


// 填充退货单表格
function fillReturnTable(data) {
    // 清空现有表格
    $('#return-detail-table tbody').empty();

    // 添加数据行
    data.forEach(function(item, index) {
        var rowHtml = `
            <tr data-original-id="${item.v || ''}">
                <td><input type="checkbox" class="row-select"></td>
                <td>${index + 1}</td>
                <td><input type="text" class="form-control form-control-sm" name="contractNo" value="${item.g || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="taskNo" value="${item.h || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="productName" value="${item.i || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="drawingNo" value="${item.j || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="unit" value="${item.k || ''}"></td>
                <td><input type="number" class="form-control form-control-sm" name="quantity" value="${item.l || ''}"></td>
                <td><input type="number" class="form-control form-control-sm" name="unitPrice" value="${item.m || ''}"></td>
                <td><input type="number" class="form-control form-control-sm" name="amount" value="${item.n || ''}" readonly></td>
                <td><input type="text" class="form-control form-control-sm" name="material" value="${item.o || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="weight" value="${item.p || ''}"></td>
                <td><input type="date" class="form-control form-control-sm" name="returnDate" value="${item.w || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="returnReason" value="${item.q || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="remark" value="${item.u || ''}"></td>
            </tr>
        `;
        $('#return-detail-table tbody').append(rowHtml);
    });

    // 计算总金额
    calculateTotalAmount();
}

// 显示退货单统计信息
function displayReturnStatistics(data) {
    var statisticsHtml = `
        <div class="alert alert-info">
            <h5>退货单统计信息</h5>
            <p>总记录数: ${data.length}</p>
            <p>涉及的退货单号: ${[...new Set(data.map(item => item.f || ''))].filter(Boolean).join(', ')}</p>
            <p>退货总金额: ${calculateTotalReturnAmount(data).toFixed(2)}</p>
        </div>
    `;

    // 这里可以根据需要将统计信息显示在页面的适当位置
    console.log('退货单统计:', statisticsHtml);
}


// 计算退货总金额
function calculateTotalReturnAmount(data) {
    return data.reduce(function(total, item) {
        var amount = parseFloat(item.n) || 0;
        return total + amount;
    }, 0);
}

// 添加刷新按钮事件（如果需要刷新退货单号列表）
function addRefreshReturnNoEvent() {
    $('#refresh-return-nos-btn').click(function() {
        loadReturnNos();
        swal("刷新成功", "退货单号列表已刷新", "success");
    });
}


//------------------------------------------------------------
// 检查退货单号是否已存在的函数
function checkReturnNoExists(returnNo, callback) {
    console.log('检查退货单号是否存在:', returnNo);

    $ajax({
        type: 'post',
        url: '/htjl/searchReturnOrder',
        data: {
            returnNo: returnNo
        },
        dataType: 'json'
    }, false, '', function(res) {
        if (res.code == 200) {
            var exists = res.data && res.data.length > 0;
            var count = exists ? res.data.length : 0;
            console.log('检查结果: 存在=' + exists + ', 数量=' + count);
            if (callback) callback(exists, count);
        } else {
            console.error('检查退货单号失败:', res.msg);
            if (callback) callback(false, 0);
        }
    });
}

// 删除已有退货单数据的函数
function deleteExistingReturnOrder(returnNo, callback) {
    console.log('开始删除已有退货单数据:', returnNo);

    $ajax({
        type: 'post',
        url: '/htjl/deleteReturnOrderByNo',
        data: {
            returnNo: returnNo
        },
        dataType: 'json'
    }, false, '', function(res) {
        if (res.code == 200) {
            console.log('删除已有数据成功');
            if (callback) callback();
        } else {
            console.error('删除失败:', res.msg);
            swal("删除失败", "无法删除已有数据，保存已取消", "error");
        }
    });
}


// 保存退货单数据的函数
function saveReturnOrderData() {
    var $btn = $("#save-return-btn");
    if ($btn.data('submitting')) {
        return;
    }
    $btn.data('submitting', true);
    $btn.prop('disabled', true);

    var originalText = $btn.html();
    $btn.html('<i class="bi bi-arrow-clockwise icon"></i>提交中...');

    // 收集所有明细行的数据
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
            e: $('#return-date').val(),
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

    if (details.length === 0) {
        swal("保存失败", "没有需要保存的数据", "error");
        $btn.data('submitting', false);
        $btn.prop('disabled', false);
        $btn.html(originalText);
        return;
    }

    // 遍历发送每个明细
    var successCount = 0;
    var totalCount = details.length;
    var hasError = false;

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

                if (!hasError && res.code == 200) {
                    swal("保存成功", "共插入 " + successCount + " 条数据", "success");
                    // 保存成功后清空表单
                    clearReturnForm();
                    getList();
                } else if (hasError) {
                    swal("保存部分成功", "共插入 " + successCount + " 条数据，部分数据保存失败", "warning");
                } else {
                    swal("保存失败", res.msg || "保存失败", "error");
                }
            }
        }, function(xhr, status, error) {
            successCount++;
            hasError = true;

            if (successCount === totalCount) {
                $btn.data('submitting', false);
                $btn.prop('disabled', false);
                $btn.html(originalText);
                swal("保存部分成功", "共插入 " + successCount + " 条数据，部分数据保存失败", "warning");
            }
        });
    });
}

function updatePagination() {
    $('#paginationContainer').remove();

    var paginationHtml = `
        <div id="paginationContainer" class="pagination-container">
            <div class="pagination-info">
                共 <span class="total-count">${totalCount}</span> 条记录，
                第 <span class="current-page">${currentPage}</span> 页 / 共 <span class="total-pages">${totalPages}</span> 页
            </div>
            <div class="pagination-controls">
                <button class="pagination-btn first-page" ${currentPage === 1 ? 'disabled' : ''}>首页</button>
                <button class="pagination-btn prev-page" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>
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
                <button class="pagination-btn next-page" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>
                <button class="pagination-btn last-page" ${currentPage === totalPages ? 'disabled' : ''}>末页</button>
                <div class="page-size-selector">
                    <select class="page-size-select">
                        <option value="10" ${pageSize === 10 ? 'selected' : ''}>10条/页</option>
                        <option value="20" ${pageSize === 20 ? 'selected' : ''}>20条/页</option>
                        <option value="50" ${pageSize === 50 ? 'selected' : ''}>50条/页</option>
                        <option value="100" ${pageSize === 100 ? 'selected' : ''}>100条/页</option>
                    </select>
                </div>
            </div>
        </div>`;

    $('#table1').after(paginationHtml);
    bindPaginationEvents();
}

// 绑定分页事件
function bindPaginationEvents() {
    $('.first-page').click(function() {
        if (!$(this).prop('disabled')) {
            currentPage = 1;
            getList(currentPage, pageSize, getSearchParams());
        }
    });

    $('.prev-page').click(function() {
        if (!$(this).prop('disabled')) {
            currentPage--;
            getList(currentPage, pageSize, getSearchParams());
        }
    });

    $('.next-page').click(function() {
        if (!$(this).prop('disabled')) {
            currentPage++;
            getList(currentPage, pageSize, getSearchParams());
        }
    });

    $('.last-page').click(function() {
        if (!$(this).prop('disabled')) {
            currentPage = totalPages;
            getList(currentPage, pageSize, getSearchParams());
        }
    });

    $('.page-number').click(function() {
        var page = parseInt($(this).text());
        if (page !== currentPage) {
            currentPage = page;
            getList(currentPage, pageSize, getSearchParams());
        }
    });

    $('.page-size-select').change(function() {
        pageSize = parseInt($(this).val());
        currentPage = 1;
        getList(currentPage, pageSize, getSearchParams());
    });

    $('.jump-btn').click(function() {
        var targetPage = parseInt($('.page-jump-input').val());
        if (targetPage && targetPage >= 1 && targetPage <= totalPages) {
            currentPage = targetPage;
            getList(currentPage, pageSize, getSearchParams());
        } else {
            swal('请输入有效的页码（1-' + totalPages + '）');
        }
    });

    $('.page-jump-input').keypress(function(e) {
        if (e.which === 13) {
            $('.jump-btn').click();
        }
    });
}

// 获取搜索参数
function getSearchParams() {
    return {
        C: $('#name').val() || '',    // 订单号
        zhuangtai: $('#department').val() || '',
    };
}

function searchDdmx() {
    var searchParams = getSearchParams();
    currentPage = 1;
    getList(currentPage, pageSize, searchParams);
}

// 清空退货单表单的函数
function clearReturnForm() {
    // 清空输入字段
    $('#return-customer').val('');
    $('#return-phone').val('');
    $('#return-reason').val('');
    $('#customer-signature').val('');
    $('#company-address').val('');
    $('#company-phone').val('');

    // 重新生成新的退货单号
    generateReturnNo();

    // 清空表格，只保留第一行
    $('#return-detail-table tbody tr:gt(0)').remove();
    if ($('#return-detail-table tbody tr').length === 0) {
        addReturnRow(); // 确保至少有一行
    } else {
        // 清空第一行的数据
        var $firstRow = $('#return-detail-table tbody tr:first');
        $firstRow.find('input[name="contractNo"]').val('');
        $firstRow.find('input[name="taskNo"]').val('');
        $firstRow.find('input[name="productName"]').val('');
        $firstRow.find('input[name="drawingNo"]').val('');
        $firstRow.find('input[name="unit"]').val('');
        $firstRow.find('input[name="quantity"]').val('1');
        $firstRow.find('input[name="unitPrice"]').val('0');
        $firstRow.find('input[name="amount"]').val('0');
        $firstRow.find('input[name="material"]').val('');
        $firstRow.find('input[name="weight"]').val('');
        $firstRow.find('input[name="returnDate"]').val('');
        $firstRow.find('input[name="returnReason"]').val('');
        $firstRow.find('input[name="remark"]').val('');
        $firstRow.removeData('original-id'); // 移除原表id
    }

    // 设置当前日期
    $('#return-date').val(getCurrentDate());

    // 重新计算总金额
    calculateTotalAmount();

    console.log('退货单表单已清空');
}




// 显示导出设置模态框
function showExportModal() {
    var defaultFileName = '合同记录_' + getCurrentDate();
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

    // 获取所有数据（注意：这里需要根据实际接口调整）
    $ajax({
        type: 'post',
        url: '/htjl/getListExcludeThjl', // 需要后端提供获取所有数据的接口
        contentType: 'application/json',
        data: JSON.stringify({
            pageNum: 1,
            pageSize: 9999999,
        }),
        dataType: 'json'
    }, false, '', function (res) {
        hideExportLoading();

        if (res.code === 200 && res.data && res.data.records && res.data.records.length > 0) {
            console.log('获取到数据，开始导出:', res.data.records.length, '条记录');
            createExcelFile(res.data.records, filename);
        } else {
            swal('没有数据可以导出');
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
                '工艺规程状态': item.zhuangtai || calculateProcessStatus(item),
                '工序': item.g || '',
                '名称': item.h || '',
                '图号': item.i || '',
                '单位': item.j || '',
                '数量': item.k || '',
                '材质': item.l || '',
                '序合计': item.av || '',
                '重量': item.aw || '',
                '工件尺寸': item.ax || '',
                '单价元': item.m || '',
                '合计金额': item.n || '',
                '铣工时': item.o || '',
                '铣单价': item.p || '',
                '车工时': item.q || '',
                '车单价': item.r || '',
                '钳工时': item.s || '',
                '钳单价': item.t || '',
                '整件外委工时': item.u || '',
                '整件外委单位': item.v || '',
                '外委工时': item.w || '',
                '外委单价': item.x || '',
                '镗工时': item.y || '',
                '镗单价': item.z || '',
                '割工时': item.aa || '',
                '割单价': item.ab || '',
                '磨工时': item.ac || '',
                '磨单价': item.ad || '',
                '数控铣工时': item.ae || '',
                '数控铣单价': item.af || '',
                '立车': item.ag || '',
                '立车单价': item.ah || '',
                '电火花': item.ai || '',
                '电火花单价': item.aj || '',
                '中走丝': item.ak || '',
                '中走丝单价': item.al || '',
                '下料': item.am || '',
                '深孔钻': item.an || '',
                '回厂日期': item.ao || '',
                '出厂日期': item.ap || '',
                '订单要求交货时间': item.ay || '',
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
            { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 8 },
            { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 10 },
            { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
            { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
            { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
            { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
            { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
            { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
            { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 8 },
            { wch: 8 }, { wch: 10 }, { wch: 15 }
        ];
        ws['!cols'] = colWidths;

        // 添加工作表
        XLSX.utils.book_append_sheet(wb, ws, '合同记录');

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

// 计算工艺规程状态（与表格中一致）
function calculateProcessStatus(row) {
    var zhuangtaiValue = row.zhuangtai;

    // 1. 如果zhuangtai字段为空字符串，返回"未创建"
    if (zhuangtaiValue === '' || zhuangtaiValue === null || zhuangtaiValue === undefined) {
        return '未创建';
    }

    // 2. 如果zhuangtai有值且不是"未创建"，则直接返回该值
    if (zhuangtaiValue && zhuangtaiValue !== '未创建') {
        return zhuangtaiValue;
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

// ==================== Excel导入功能 ====================

// 数据库字段定义（根据您的表结构调整）
var databaseFields = [
    { field: 'c', name: '退货客户', description: '退货客户名称' },
    { field: 'd', name: '退货电话', description: '联系电话' },
    { field: 'e', name: '退货日期', description: '退货日期' },
    { field: 'f', name: '退货单号', description: '退货单编号' },
    { field: 'g', name: '合同号', description: '合同编号' },
    { field: 'h', name: '任务号', description: '任务编号' },
    { field: 'i', name: '产品名称', description: '产品名称' },
    { field: 'j', name: '图号', description: '图纸编号' },
    { field: 'k', name: '单位', description: '计量单位' },
    { field: 'l', name: '数量', description: '产品数量' },
    { field: 'm', name: '单价', description: '产品单价' },
    { field: 'n', name: '金额', description: '总金额' },
    { field: 'o', name: '材质', description: '材料材质' },
    { field: 'p', name: '重量', description: '产品重量' },
    { field: 'q', name: '退货原因', description: '退货原因说明' },
    { field: 'r', name: '地址', description: '客户地址' },
    { field: 's', name: '客户签字', description: '客户签名' },
    { field: 't', name: '电话', description: '联系电话' },
    { field: 'u', name: '备注', description: '备注信息' },
    { field: 'v', name: '回厂日期', description: '返回工厂日期' }
    // 根据您的需求添加更多字段...
];

// 导入数据对象
var importData = {
    excelData: null,
    columnHeaders: [],
    columnData: []
};

// 导入按钮点击事件
$('#import-btn').click(function() {
    resetImportModal();
    $('#importModal').modal('show');
});

// 文件选择变化
$('#excelFile').change(function(e) {
    var fileName = e.target.files[0] ? e.target.files[0].name : '选择文件';
    $('#fileLabel').text(fileName);
    $('#btn-analyze-file').prop('disabled', !e.target.files[0]);
});

// 分析Excel文件
$('#btn-analyze-file').click(function() {
    var fileInput = document.getElementById('excelFile');

    if (!fileInput.files[0]) {
        swal('请选择Excel文件');
        return;
    }

    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        try {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });

            if (workbook.SheetNames.length === 0) {
                swal('Excel文件中没有工作表');
                return;
            }

            // 读取第一个工作表
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];

            // 获取范围（A2:BDxxx）
            var range = XLSX.utils.decode_range(worksheet['!ref']);

            // 调整从第二行开始（跳过表头）
            range.s.r = 1;

            // 限制列数：A到BD（BD是第56列）
            var maxCol = Math.min(range.e.c, 55); // A=0, BD=55

            // 收集列数据
            importData.columnHeaders = [];
            importData.columnData = [];
            importData.excelData = [];

            // 首先读取表头（第一行）
            for (var col = 0; col <= maxCol; col++) {
                var cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                var cell = worksheet[cellAddress];
                var header = cell ? (cell.v || `列${getColumnLetter(col)}`) : `列${getColumnLetter(col)}`;
                importData.columnHeaders.push(header);
                importData.columnData[col] = [];
            }

            // 读取数据（从第二行开始）
            var rowCount = 0;
            for (var row = 1; row <= range.e.r; row++) {
                var rowData = {};
                var hasData = false;

                for (var col = 0; col <= maxCol; col++) {
                    var cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                    var cell = worksheet[cellAddress];
                    var cellValue = cell ? cell.v : '';

                    if (cellValue !== '' && cellValue !== null && cellValue !== undefined) {
                        hasData = true;
                        rowData[col] = cellValue;
                        importData.columnData[col].push(cellValue);
                    }
                }

                if (hasData) {
                    importData.excelData.push(rowData);
                    rowCount++;

                    // 限制最大行数
                    if (rowCount >= 1000) {
                        break;
                    }
                }
            }

            if (rowCount === 0) {
                swal('Excel文件中没有有效数据');
                return;
            }

            // 显示预览信息
            showImportPreview(rowCount);

        } catch (error) {
            console.error('Excel解析错误:', error);
            swal('Excel文件解析失败: ' + error.message);
        }
    };

    reader.onerror = function(error) {
        swal('文件读取失败: ' + error);
    };

    reader.readAsArrayBuffer(file);
});

// 显示导入预览信息
function showImportPreview(rowCount) {
    $('#import-step-1').hide();
    $('#import-step-3').show();

    // 显示预览信息
    var previewHtml = `
        <div class="alert alert-success">
            <h6><i class="bi bi-file-earmark-excel me-2"></i>Excel文件分析完成</h6>
            <p>共发现 <strong>${rowCount}</strong> 行数据</p>
            <p>共 <strong>${importData.columnHeaders.length}</strong> 列</p>
            <p class="mt-2">
                <small class="text-muted">
                    将按照预定义映射关系导入数据：A列→业务单位，B列→合同号，C列→任务号...
                </small>
            </p>
        </div>
        
        <div class="alert alert-info">
            <h6><i class="bi bi-lightbulb me-2"></i>字段映射预览</h6>
            <div class="table-responsive mt-2">
                <table class="table table-sm table-bordered">
                    <thead class="thead-light">
                        <tr>
                            <th width="80">Excel列</th>
                            <th width="120">Excel列名</th>
                            <th width="120">映射字段</th>
                            <th width="180">数据库字段说明</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    // 显示前20列的映射关系
    var maxPreviewCols = Math.min(importData.columnHeaders.length, 20);
    for (var col = 0; col < maxPreviewCols; col++) {
        var colLetter = getColumnLetter(col);
        var header = importData.columnHeaders[col];
        var dbField = excelToDbMapping[col] || '未映射';

        // 获取字段说明
        var fieldDescription = getFieldDescription(dbField);

        previewHtml += `
            <tr>
                <td><strong>${colLetter}</strong></td>
                <td>${header}</td>
                <td>${dbField}</td>
                <td><small class="text-muted">${fieldDescription}</small></td>
            </tr>
        `;
    }

    if (importData.columnHeaders.length > 20) {
        previewHtml += `
            <tr>
                <td colspan="4" class="text-center">
                    <small class="text-muted">... 还有 ${importData.columnHeaders.length - 20} 列</small>
                </td>
            </tr>
        `;
    }

    previewHtml += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="text-center mt-4">
            <button type="button" class="btn btn-secondary mr-2" id="btn-back-to-file">
                <i class="bi bi-arrow-left me-2"></i>
                返回文件选择
            </button>
            <button type="button" class="btn btn-success" id="btn-direct-import">
                <i class="bi bi-cloud-upload me-2"></i>
                直接导入数据
            </button>
        </div>
    `;

    $('#import-step-3').html(previewHtml);

    // 绑定返回按钮事件
    $('#btn-back-to-file').click(function() {
        $('#import-step-3').hide();
        $('#import-step-1').show();
    });

    // 绑定直接导入按钮事件
    $('#btn-direct-import').click(function() {
        startDirectImport();
    });
}

// 获取字段说明
function getFieldDescription(field) {
    var descriptions = {
        'c': '业务单位',
        'd': '合同号',
        'e': '任务号',
        'zhuangtai': '工艺规程状态',
        'g': '工序',
        'h': '名称',
        'i': '图号',
        'j': '单位',
        'k': '数量',
        'l': '材质',
        'av': '序合计',
        'aw': '重量',
        'ax': '工件尺寸',
        'm': '单价元',
        'n': '合计金额',
        'o': '铣工时',
        'p': '铣单价',
        'q': '车工时',
        'r': '车单价',
        's': '钳工时',
        't': '钳单价',
        'u': '整件外委工时',
        'v': '整件外委单位',
        'w': '外委工时',
        'x': '外委单价',
        'y': '镗工时',
        'z': '镗单价',
        'aa': '割工时',
        'ab': '割单价',
        'ac': '磨工时',
        'ad': '磨单价',
        'ae': '数控铣工时',
        'af': '数控铣单价',
        'ag': '立车',
        'ah': '立车单价',
        'ai': '电火花',
        'aj': '电火花单价',
        'ak': '中走丝',
        'al': '中走丝单价',
        'am': '下料',
        'an': '深孔钻',
        'ao': '回厂日期',
        'ap': '出厂日期',
        'ay': '订单要求交货时间',
        'aq': '铣',
        'ar': '车',
        'aas': '登记员',
        'at': '备注'
    };

    return descriptions[field] || '未知字段';
}

// 开始直接导入
function startDirectImport() {
    // 转换数据格式
    var dataToImport = convertDataForImport();

    if (dataToImport.length === 0) {
        swal('没有可导入的数据');
        return;
    }

    // 显示导入进度
    showImportProgressBar(dataToImport.length);

    // 开始导入数据
    startDataImport(dataToImport);
}

// 显示导入进度条
function showImportProgressBar(totalRows) {
    var progressHtml = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
                <span class="sr-only">导入中...</span>
            </div>
            <h5>正在导入数据...</h5>
            <p class="text-muted" id="import-progress-text">准备导入 ${totalRows} 条记录...</p>
            <div class="progress mb-3" style="height: 20px;">
                <div id="import-progress-bar" class="progress-bar progress-bar-striped progress-bar-animated" 
                     role="progressbar" style="width: 0%"></div>
            </div>
            <div id="import-details" class="text-left"></div>
        </div>
    `;

    $('#import-step-3').html(progressHtml);
}

// 显示字段映射配置
function showFieldMapping(rowCount) {
    $('#import-step-1').hide();
    $('#import-step-2').show();

    var tbody = $('#mapping-tbody');
    tbody.empty();

    // 为每一列生成映射行
    for (var col = 0; col < importData.columnHeaders.length; col++) {
        var colLetter = getColumnLetter(col);
        var header = importData.columnHeaders[col];
        var sampleData = importData.columnData[col].slice(0, 3).join(', ');
        if (importData.columnData[col].length > 3) {
            sampleData += '...';
        }

        var fieldOptions = '<option value="">-- 请选择 --</option>';
        databaseFields.forEach(function(field) {
            fieldOptions += `<option value="${field.field}">${field.name} (${field.field})</option>`;
        });

        var row = `<tr>
            <td>${col + 1}</td>
            <td><strong>${colLetter}</strong></td>
            <td>${header}</td>
            <td>
                <select class="form-control form-control-sm field-mapping" data-col="${col}">
                    ${fieldOptions}
                </select>
            </td>
            <td>
                <small class="text-muted">${sampleData || '无数据'}</small>
            </td>
        </tr>`;

        tbody.append(row);
    }

    // 添加信息提示
    tbody.prepend(`<tr class="table-info">
        <td colspan="5" class="text-center">
            <i class="bi bi-info-circle me-2"></i>
            共发现 ${rowCount} 行数据，${importData.columnHeaders.length} 列
        </td>
    </tr>`);
}

// 获取列字母（A, B, C, ..., Z, AA, AB, ...）
function getColumnLetter(columnIndex) {
    var letter = '';
    while (columnIndex >= 0) {
        letter = String.fromCharCode(65 + (columnIndex % 26)) + letter;
        columnIndex = Math.floor(columnIndex / 26) - 1;
    }
    return letter;
}

// 返回第一步
$('#btn-back-step1').click(function() {
    $('#import-step-2').hide();
    $('#import-step-1').show();
});

// 开始导入
$('#btn-start-import').click(function() {
    // 收集映射配置
    importData.mappingConfig = {};
    $('.field-mapping').each(function() {
        var col = $(this).data('col');
        var field = $(this).val();
        if (field) {
            importData.mappingConfig[col] = field;
        }
    });

    // 检查是否有映射
    if (Object.keys(importData.mappingConfig).length === 0) {
        swal('请至少配置一个字段映射');
        return;
    }

    // 转换数据格式
    var dataToImport = convertDataForImport();

    if (dataToImport.length === 0) {
        swal('没有可导入的数据');
        return;
    }

    // 显示导入进度
    showImportProgress(dataToImport.length);

    // 根据模式选择导入方式
    var importMode = $('#import-mode').val();
    if (importMode === 'preview') {
        previewImportData(dataToImport);
    } else {
        startDataImport(dataToImport);
    }
});

// 转换数据格式（使用硬编码映射）
function convertDataForImport() {
    var result = [];

    importData.excelData.forEach(function(rowData) {
        var record = {};

        // 根据硬编码映射配置转换数据
        Object.keys(excelToDbMapping).forEach(function(col) {
            var field = excelToDbMapping[col];
            var value = rowData[col];

            if (value !== undefined && value !== null && value !== '') {
                // 特殊字段处理（日期等）
                if (field === 'ao' || field === 'ap') {
                    // 日期字段处理
                    if (value instanceof Date) {
                        record[field] = formatDateForServer(value);
                    } else {
                        record[field] = value.toString();
                    }
                } else {
                    record[field] = value.toString();
                }
            }
        });

        // 只有有数据的记录才添加
        if (Object.keys(record).length > 0) {
            result.push(record);
        }
    });

    return result;
}

// 显示导入进度
function showImportProgress(totalRows) {
    $('#import-step-2').hide();
    $('#import-step-3').show();
    $('#import-progress-text').text(`准备导入 ${totalRows} 条记录...`);
}

// 预览导入数据
function previewImportData(data) {
    // 在控制台预览数据
    console.log('=== 导入数据预览 ===');
    console.log('总记录数:', data.length);
    console.log('前5条记录:', data.slice(0, 5));
    console.log('字段映射:', importData.mappingConfig);

    // 显示预览信息
    var detailsHtml = `
        <div class="alert alert-info">
            <h6><i class="bi bi-eye me-2"></i>数据预览</h6>
            <p>总记录数: <strong>${data.length}</strong></p>
            <p>映射字段数: <strong>${Object.keys(importData.mappingConfig).length}</strong></p>
            <div class="mt-2">
                <button class="btn btn-sm btn-outline-info" onclick="showSampleData()">
                    <i class="bi bi-table me-1"></i>查看示例数据
                </button>
            </div>
        </div>
    `;

    $('#import-details').html(detailsHtml);

    // 继续导入
    startDataImport(data);
}

// 开始导入数据
function startDataImport(data) {
    var total = data.length;
    var batchSize = 50; // 每批导入50条
    var successCount = 0;
    var errorCount = 0;
    var errorDetails = [];

    // 分批导入函数
    function importBatch(startIndex) {
        var endIndex = Math.min(startIndex + batchSize, total);
        var batchData = data.slice(startIndex, endIndex);

        // 更新进度
        var progress = Math.round((startIndex / total) * 100);
        $('#import-progress-bar').css('width', progress + '%');
        $('#import-progress-text').text(`正在导入 ${startIndex + 1}-${endIndex} / ${total} 条记录...`);

        // 发送导入请求
        $ajax({
            type: 'post',
            url: '/htjl/importExcel',
            contentType: 'application/json',
            data: JSON.stringify({
                records: batchData,
                total: total,
                batch: Math.floor(startIndex / batchSize) + 1,
                totalBatches: Math.ceil(total / batchSize)
            }),
            dataType: 'json'
        }, false, '', function(res) {
            if (res.code == 200) {
                successCount += res.data.successCount || batchData.length;
                if (res.data.errors && res.data.errors.length > 0) {
                    errorCount += res.data.errors.length;
                    errorDetails = errorDetails.concat(res.data.errors);
                }
            } else {
                errorCount += batchData.length;
                batchData.forEach(function(record, index) {
                    errorDetails.push(`第${startIndex + index + 1}行: ${res.msg}`);
                });
            }

            // 继续下一批或完成
            if (endIndex < total) {
                setTimeout(function() {
                    importBatch(endIndex);
                }, 500); // 延迟500ms，避免服务器压力过大
            } else {
                completeImport(successCount, errorCount, errorDetails);
            }
        }, function(xhr, status, error) {
            // 请求失败，记录所有错误
            errorCount += batchData.length;
            batchData.forEach(function(record, index) {
                errorDetails.push(`第${startIndex + index + 1}行: 网络错误 - ${error}`);
            });

            // 继续下一批或完成
            if (endIndex < total) {
                setTimeout(function() {
                    importBatch(endIndex);
                }, 1000);
            } else {
                completeImport(successCount, errorCount, errorDetails);
            }
        });
    }

    // 开始第一批导入
    importBatch(0);
}

// 完成导入
function completeImport(successCount, errorCount, errorDetails) {
    $('#import-step-3').hide();
    $('#import-step-4').show();
    $('#import-progress-bar').css('width', '100%');

    if (errorCount === 0) {
        // 完全成功
        $('#import-success-icon').show();
        $('#import-result-title').text('导入成功！');
        $('#import-result-message').html(`
            <p>成功导入 <strong class="text-success">${successCount}</strong> 条记录</p>
            <p class="text-muted">数据已保存到数据库</p>
        `);
    } else if (successCount > 0) {
        // 部分成功
        $('#import-success-icon').show();
        $('#import-result-title').text('导入完成！');
        $('#import-result-message').html(`
            <p>导入结果：</p>
            <p>✓ 成功：<strong class="text-success">${successCount}</strong> 条</p>
            <p>✗ 失败：<strong class="text-danger">${errorCount}</strong> 条</p>
        `);

        if (errorDetails.length > 0) {
            var errorHtml = '<div class="mt-3"><h6>失败详情：</h6><ul class="list-unstyled">';
            errorDetails.slice(0, 10).forEach(function(error) {
                errorHtml += `<li class="text-danger"><small>${error}</small></li>`;
            });
            if (errorDetails.length > 10) {
                errorHtml += `<li><small>... 还有 ${errorDetails.length - 10} 个错误</small></li>`;
            }
            errorHtml += '</ul></div>';
            $('#import-result-details').html(errorHtml).addClass('alert-warning').show();
        }
    } else {
        // 完全失败
        $('#import-error-icon').show();
        $('#import-result-title').text('导入失败！');
        $('#import-result-message').html(`
            <p>所有记录导入失败</p>
            <p class="text-muted">请检查Excel文件格式和数据</p>
        `);

        if (errorDetails.length > 0) {
            var errorHtml = '<div class="mt-3"><h6>错误详情：</h6><ul class="list-unstyled">';
            errorDetails.slice(0, 5).forEach(function(error) {
                errorHtml += `<li class="text-danger"><small>${error}</small></li>`;
            });
            errorHtml += '</ul></div>';
            $('#import-result-details').html(errorHtml).addClass('alert-danger').show();
        }
    }
}

// 查看数据按钮
$('#btn-view-data').click(function() {
    $('#importModal').modal('hide');
    getList(currentPage); // 刷新数据
});

// 关闭导入按钮
$('#btn-close-import').click(function() {
    $('#importModal').modal('hide');
    getList(currentPage); // 刷新数据
});

// 简化导入模态框重置函数
function resetImportModal() {
    $('#import-step-1').show();
    $('#import-step-3').hide();
    $('#import-step-4').hide();
    $('#excelFile').val('');
    $('#fileLabel').text('选择文件');
    $('#btn-analyze-file').prop('disabled', true);

    importData = {
        excelData: null,
        columnHeaders: [],
        columnData: []
    };
}

// 日期格式化（用于服务器）
function formatDateForServer(date) {
    if (!(date instanceof Date)) {
        return date;
    }

    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);

    return year + '-' + month + '-' + day;
}

// 显示示例数据（调试用）
function showSampleData() {
    if (importData.excelData && importData.excelData.length > 0) {
        var sample = importData.excelData[0];
        var html = '<table class="table table-sm table-bordered"><thead><tr><th>Excel列</th><th>值</th><th>映射字段</th></tr></thead><tbody>';

        Object.keys(sample).forEach(function(col) {
            var field = importData.mappingConfig[col] || '未映射';
            var letter = getColumnLetter(parseInt(col));
            html += `<tr>
                <td>${letter}</td>
                <td>${sample[col]}</td>
                <td>${field}</td>
            </tr>`;
        });

        html += '</tbody></table>';

        swal({
            title: '示例数据',
            html: html,
            width: '800px'
        });
    }
}

var excelToDbMapping = {
    // 0: 'c',    // A列 → 业务单位
    0: 'd',    // B列 → 合同号
    1: 'e',    // C列 → 任务号
    // 3: 'zhuangtai', // D列 → 工艺规程状态
    3: 'g',    // E列 → 工序
    4: 'h',    // F列 → 名称
    5: 'i',    // G列 → 图号
    6: 'j',    // H列 → 单位
    7: 'k',    // I列 → 数量
    8: 'l',    // J列 → 材质
    9: 'av',  // K列 → 序合计
    // 11: 'aw',  // L列 → 重量
    // 12: 'ax',  // M列 → 工件尺寸
    10: 'm',   // N列 → 单价元
    11: 'n',   // O列 → 合计金额
    12: 'o',   // P列 → 铣工时
    13: 'p',   // Q列 → 铣单价
    15: 'q',   // R列 → 车工时
    16: 'r',   // S列 → 车单价
    18: 's',   // T列 → 钳工时
    19: 't',   // U列 → 钳单价
    21: 'u',   // V列 → 整件外委工时
    22: 'v',   // W列 → 整件外委单位
    23: 'w',   // X列 → 外委工时
    24: 'x',   // Y列 → 外委单价
    25: 'y',   // Z列 → 镗工时
    26: 'z',   // AA列 → 镗单价
    28: 'aa',  // AB列 → 割工时
    29: 'ab',  // AC列 → 割单价
    31: 'ac',  // AD列 → 磨工时
    32: 'ad',  // AE列 → 磨单价
    34: 'ae',  // AF列 → 数控铣工时
    35: 'af',  // AG列 → 数控铣单价
    37: 'ag',  // AH列 → 立车
    38: 'ah',  // AI列 → 立车单价
    40: 'ai',  // AJ列 → 电火花
    41: 'aj',  // AK列 → 电火花单价
    43: 'ak',  // AL列 → 中走丝
    44: 'al',  // AM列 → 中走丝单价
    47: 'am',  // AN列 → 下料
    48: 'an',  // AO列 → 深孔钻
    50: 'ao',  // AP列 → 回厂日期
    51: 'ap',  // AQ列 → 出厂日期
    // 43: 'ay',  // AR列 → 订单要求交货时间
    52: 'aq',  // AS列 → 铣
    53: 'ar',  // AT列 → 车
    54: 'aas', // AU列 → 登记员
    55: 'at'   // AV列 → 备注
};

// 文件选择变化 - 确保这个事件绑定正确
$('#excelFile').on('change', function(e) {
    var fileName = e.target.files[0] ? e.target.files[0].name : '选择文件';
    $('#fileLabel').text(fileName);
    $('#btn-analyze-file').prop('disabled', !e.target.files[0]);
    console.log('文件已选择:', fileName);
});

// 分析Excel文件按钮
$('#btn-analyze-file').on('click', function() {
    var fileInput = document.getElementById('excelFile');

    if (!fileInput.files || !fileInput.files[0]) {
        swal('请选择Excel文件');
        return;
    }

    var file = fileInput.files[0];
    console.log('开始分析文件:', file.name);

    // 显示加载状态
    var $btn = $(this);
    var originalText = $btn.html();
    $btn.prop('disabled', true).html('<i class="bi bi-hourglass-split me-2"></i>分析中...');

    var reader = new FileReader();

    reader.onload = function(e) {
        try {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });

            if (workbook.SheetNames.length === 0) {
                swal('Excel文件中没有工作表');
                $btn.prop('disabled', false).html(originalText);
                return;
            }

            // 读取第一个工作表
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];
            var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length <= 1) {
                swal('Excel文件中没有有效数据');
                $btn.prop('disabled', false).html(originalText);
                return;
            }

            // 获取表头和数据
            var headers = jsonData[0];
            var dataRows = jsonData.slice(1);

            // 存储导入数据
            importData = {
                excelData: dataRows,
                headers: headers,
                rowCount: dataRows.length,
                columnCount: headers.length
            };

            // 显示预览
            showImportPreview(dataRows.length);
            $btn.prop('disabled', false).html(originalText);

        } catch (error) {
            console.error('Excel解析错误:', error);
            swal('Excel文件解析失败: ' + error.message);
            $btn.prop('disabled', false).html(originalText);
        }
    };

    reader.onerror = function(error) {
        console.error('文件读取错误:', error);
        swal('文件读取失败: ' + error);
        $btn.prop('disabled', false).html(originalText);
    };

    reader.readAsArrayBuffer(file);
});

function convertExcelData(jsonData) {
    var result = [];

    // 跳过表头（第一行）
    for (var i = 1; i < jsonData.length; i++) {
        var row = jsonData[i];
        if (!row || row.length === 0) continue;

        var record = {};

        // 根据预定义的映射转换数据
        for (var col = 0; col < row.length; col++) {
            if (col > 55) break; // 限制到BD列

            var field = excelToDbMapping[col];
            var value = row[col];

            if (field && value !== undefined && value !== null && value !== '') {
                // 简单处理：转换为字符串
                record[field] = String(value).trim();
            }
        }

        // 只有有数据的记录才添加
        if (Object.keys(record).length > 0) {
            result.push(record);
        }
    }

    return result;
}

// 发送数据到服务器
function sendImportData(data, fileName) {
    var totalRows = data.length;

    $ajax({
        type: 'post',
        url: '/htjl/importExcel',
        contentType: 'application/json',
        data: JSON.stringify({
            records: data,
            fileName: fileName,
            totalRows: totalRows
        }),
        dataType: 'json'
    }, false, '', function(res) {
        if (res.code == 200) {
            var successCount = res.data.successCount || totalRows;
            var errorCount = res.data.errorCount || 0;

            if (errorCount === 0) {
                showImportResult(true, `成功导入 ${successCount} 条数据`);
            } else {
                showImportResult(true, `导入完成：成功 ${successCount} 条，失败 ${errorCount} 条`);
            }

            // 如果有错误信息，显示详细错误
            if (res.data.errors && res.data.errors.length > 0) {
                console.log('导入错误详情:', res.data.errors);
            }
        } else {
            showImportResult(false, '导入失败: ' + (res.msg || '服务器错误'));
        }
    }, function(xhr, status, error) {
        console.error('导入请求失败:', error);
        showImportResult(false, '网络错误: ' + error);
    });
}

// 显示导入结果
function showImportResult(isSuccess, message) {
    var icon = isSuccess ?
        '<i class="bi bi-check-circle-fill text-success" style="font-size: 48px;"></i>' :
        '<i class="bi bi-x-circle-fill text-danger" style="font-size: 48px;"></i>';

    var title = isSuccess ? '导入成功' : '导入失败';

    var resultHtml = `
        <div class="text-center py-4">
            ${icon}
            <h4 class="mt-3">${title}</h4>
            <p>${message}</p>
            <div class="mt-4">
                <button type="button" class="btn btn-primary" id="refreshDataBtn" data-dismiss="modal">
                    <i class="bi bi-arrow-clockwise me-2"></i>
                    刷新数据
                </button>
                <button type="button" class="btn btn-secondary" id="closeImportBtn" data-dismiss="modal">
                    <i class="bi bi-x me-2"></i>
                    关闭
                </button>
            </div>
        </div>
    `;

    $('.modal-body').html(resultHtml);

    // 绑定刷新按钮事件
    $('#refreshDataBtn').click(function() {
        getList();
    });
}

// 简化版打印函数
function printReturnOrder() {
    console.log('开始打印退货单...');

    // 创建一个打印样式
    var printStyle = `
        <style>
            @media print {
                body * {
                    visibility: hidden;
                }
                #return-print-section, #return-print-section * {
                    visibility: visible;
                }
                #return-print-section {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    padding: 20px;
                }
                .no-print {
                    display: none !important;
                }
                /* 表格样式 */
                .print-table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-top: 20px;
                }
                .print-table th, .print-table td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: center;
                    font-size: 12px;
                }
                .print-table th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
                .print-info {
                    margin-bottom: 15px;
                    line-height: 2;
                }
                .print-title {
                    text-align: center;
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
            }
        </style>
    `;

    // 添加打印样式到页面
    $('head').append(printStyle);

    // 构建打印内容
    var printContent = buildReturnOrderPrintContent();

    // 创建打印区域
    var printSection = $('<div id="return-print-section"></div>').html(printContent);
    $('body').append(printSection);

    // 执行打印
    window.print();

    // 清理打印区域
    setTimeout(function() {
        $('#return-print-section').remove();
        $('head style:last-child').remove();
    }, 100);
}

function buildReturnOrderPrintContent() {
    // 构建表格行
    var tableRows = '';
    var rowNumber = 1;

    $('#return-detail-table tbody tr').each(function() {
        var $row = $(this);
        var contractNo = $row.find('input[name="contractNo"]').val();

        // 只显示有数据的行
        if (contractNo && contractNo.trim() !== '') {
            tableRows += `
                <tr>
                    <td>${rowNumber++}</td>
                    <td>${contractNo}</td>
                    <td>${$row.find('input[name="taskNo"]').val() || ''}</td>
                    <td>${$row.find('input[name="productName"]').val() || ''}</td>
                    <td>${$row.find('input[name="drawingNo"]').val() || ''}</td>
                    <td>${$row.find('input[name="unit"]').val() || ''}</td>
                    <td>${$row.find('input[name="quantity"]').val() || ''}</td>
                    <td>${$row.find('input[name="unitPrice"]').val() || ''}</td>
                    <td>${$row.find('input[name="amount"]').val() || ''}</td>
                    <td>${$row.find('input[name="material"]').val() || ''}</td>
                    <td>${$row.find('input[name="weight"]').val() || ''}</td>
                    <td>${$row.find('input[name="returnDate"]').val() || ''}</td>
                    <td>${$row.find('input[name="returnReason"]').val() || ''}</td>
                    <td>${$row.find('input[name="remark"]').val() || ''}</td>
                </tr>
            `;
        }
    });

    // 如果没有数据
    if (tableRows === '') {
        tableRows = '<tr><td colspan="14" style="text-align: center;">暂无退货明细</td></tr>';
    }

    return `
        <div class="print-container">
            <div class="print-title">退货单</div>
            
            <div class="print-info">
                <div><strong>退货客户：</strong>${$('#return-customer').val() || ''}</div>
                <div><strong>退货电话：</strong>${$('#return-phone').val() || ''}</div>
                <div><strong>退货单号：</strong>${$('#return-no').val() || ''}</div>
                <div><strong>退货日期：</strong>${$('#return-date').val() || ''}</div>
            </div>
            
            <table class="print-table">
                <thead>
                    <tr>
                        <th>序号</th>
                        <th>合同号</th>
                        <th>任务号</th>
                        <th>产品名称</th>
                        <th>图号</th>
                        <th>单位</th>
                        <th>数量</th>
                        <th>单价</th>
                        <th>金额</th>
                        <th>材质</th>
                        <th>重量</th>
                        <th>回厂日期</th>
                        <th>退货原因</th>
                        <th>备注</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            
            <div class="print-info" style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #000;">
                <div><strong>合计金额(大写)：</strong>${$('#total-amount-chinese').text()}</div>
                <div><strong>合计金额：</strong>${$('#total-amount').text()}</div>
            </div>
            
            <div class="print-info" style="margin-top: 30px;">
                <div style="display: flex; justify-content: space-between;">
                    <div><strong>地址：</strong>${$('#company-address').val() || ''}</div>
                    <div><strong>电话：</strong>${$('#company-phone').val() || ''}</div>
                    <div><strong>客户签字：</strong>${$('#customer-signature').val() || ''}</div>
                </div>
            </div>
        </div>
    `;
}


function loadCustomerList() {
    console.log('开始加载客户列表...');

    $ajax({
        type: 'post',
        url: '/htjl/getCustomerList',
        contentType: 'application/json',
        dataType: 'json'
    }, false, '', function(res) {
        if (res.code === 200) {
            console.log('获取客户列表成功:', res.data);

            var $select = $('#return-customer');
            $select.empty(); // 清空现有选项

            // 添加默认选项
            $select.append('<option value="">请选择退货客户</option>');

            // 检查数据结构
            if (res.data && Array.isArray(res.data)) {
                // 遍历客户数据 - 现在客户名称在 c 字段中
                res.data.forEach(function(customer) {
                    // 从c字段获取客户名称
                    var customerName = customer.c || '';

                    if (customerName && customerName.trim() !== '') {
                        // 只使用客户名称，不存储电话和ID
                        $select.append(
                            '<option value="' + customerName + '">' +
                            customerName +
                            '</option>'
                        );
                    }
                });

                console.log('已加载 ' + res.data.length + ' 个客户');
            } else {
                console.warn('客户数据格式异常:', res.data);
                $select.append('<option value="">暂无客户数据</option>');
            }
        } else {
            console.error('获取客户列表失败:', res.msg);
            $('#return-customer').html('<option value="">加载失败</option>');
        }
    });
}


// 表格鼠标拖动滚动功能
// 表格鼠标拖动滚动功能 - 修复版
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




