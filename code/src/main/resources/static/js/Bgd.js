var idd;

function getList() {
    $ajax({
        type: 'post',
        url: '/bgd/getList',
    }, false, '', function (res) {
        if (res.code == 200) {
            console.log("获取到的数据:", res.data);
            // 检查每条数据的合同ID
            res.data.forEach((item, index) => {
                console.log(`第${index + 1}条数据 - 合同ID:`, item.C, "完整数据:", item);
            });

            setTable(res.data);
            $("#lrTable").colResizable({
                liveDrag: true,
                gripInnerHtml: "<div class='grip'></div>",
                draggingClass: "dragging",
                resizeMode: 'fit'
            });
            if (res.data && res.data.length > 0) {
                idd = Math.max(...res.data.map(item => item.id));
            }
        }
    });
}

// 获取工艺规程详情函数
function getProcessDetail(contractId) {
    $ajax({
        type: 'post',
        url: '/lcd/getDetail',
        data: {
            contractId: contractId
        }
    }, false, '', function (res) {
        swal.close();
        if (res.code == 200) {
            showProcessDetailModal(res.data);
        } else {
            swal("", "获取工艺规程详情失败：" + res.msg, "error");
        }
    });
}

// 显示工艺规程详情模态框
function showProcessDetailModal(data) {
    console.log("详情返回数据", data);

    // 生成工序表格的HTML
    let processTableHtml = '';
    if (data && data.length > 0) {
        processTableHtml = `
        <div class="row mt-4">
            <div class="col-12">
                <h6>工序详情</h6>
                <div class="table-responsive">
                    <table class="table table-bordered table-sm" id="processDetailTable" style="table-layout: fixed; width: 100%;">
                        <thead class="thead-light">
                            <tr>
                                <th style="width: 60px;">序号</th>
                                <th style="min-width: 120px;">工序名称</th>
                                <th style="min-width: 150px;">工序内容</th>
                                <th style="width: 100px;">合计工时</th>
                                <th style="width: 100px;">员工签名</th>
                                <th style="width: 150px;">完工时间</th>
                                <th style="width: 150px;">操作</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        // 遍历数据生成表格行
        data.forEach((item, index) => {
            const hasSignature = item.m && item.m.trim() !== ''; // 判断是否有签名
            processTableHtml += `
                            <tr data-id="${item.id}">
                                <td style="width: 60px;">${index + 1}</td>
                                <td style="min-width: 120px; word-wrap: break-word;">${item.j || ''}</td>
                                <td style="min-width: 150px; word-wrap: break-word;">${item.k || ''}</td>
                                <td style="width: 100px;" class="work-hours">${item.l || '0'}</td>
                                <td style="width: 100px; word-wrap: break-word;" class="employee-sign">${item.m || ''}</td>
                                <td style="width: 150px; word-wrap: break-word;" class="completion-time">${item.n || ''}</td>
                                <td style="width: 150px;">
                                    <div class="btn-group" role="group" style="flex-wrap: nowrap;">
                                        <button type="button" class="btn btn-warning btn-sm deduct-hours-btn" 
                                                data-id="${item.id}" 
                                                data-hours="${item.l || '0'}"
                                                title="扣工时"
                                                style="white-space: nowrap;">
                                            <i class="fas fa-minus"></i> 扣工时
                                        </button>
                                        ${hasSignature ? `
                                        <button type="button" class="btn btn-info btn-sm reset-process-btn" 
                                                data-id="${item.id}"
                                                title="复工（清空签名和完工时间）"
                                                style="white-space: nowrap;">
                                            <i class="fas fa-redo"></i> 复工
                                        </button>
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>
            `;
        });

        processTableHtml += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        `;
    }

    var modalHtml = `
    <div class="modal fade" id="processDetailModal" tabindex="-1" role="dialog" aria-labelledby="processDetailModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="processDetailModalLabel">工艺规程详情</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="container-fluid">
                        <div class="row mb-3">
                            <div class="col-md-6"><strong>业务单位:</strong> <span>${data[0].d || '无'}</span></div>
                            <div class="col-md-6"><strong>数量:</strong> <span>${data[0].e || '无'}</span></div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6"><strong>材质:</strong> <span>${data[0].f || '无'}</span></div>
                            <div class="col-md-6"><strong>零件名称:</strong> <span>${data[0].g || '无'}</span></div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6"><strong>任务号:</strong> <span>${data[0].h || '无'}</span></div>
                            <div class="col-md-6"><strong>图号:</strong> <span>${data[0].i || '无'}</span></div>
                        </div>
                        ${processTableHtml}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>
                </div>
            </div>
        </div>
    </div>
    `;

    if ($('#processDetailModal').length) {
        $('#processDetailModal').remove();
    }

    $('body').append(modalHtml);
    $('#processDetailModal').modal('show');

    // 绑定扣工时按钮点击事件
    $('#processDetailModal').on('click', '.deduct-hours-btn', function() {
        const id = $(this).data('id');
        const currentHours = parseFloat($(this).data('hours')) || 0;
        showDeductHoursModal(id, currentHours);
    });

    // 绑定复工按钮点击事件
    $('#processDetailModal').on('click', '.reset-process-btn', function() {
        const id = $(this).data('id');
        const processName = $(this).closest('tr').find('td:eq(1)').text().trim();
        showResetProcessModal(id, processName);
    });

    $('#processDetailModal').on('hidden.bs.modal', function () {
        $(this).remove();
    });
}

$(function () {
    getList();
    $('#add-close-btn').click(function () {
        $('#add-modal').modal('hide');
    });

    // 添加调试信息
    console.log("页面加载完成，准备初始化表格");
});

function setTable(data) {
    if ($('#lrTable').html != '') {
        $('#lrTable').bootstrapTable('load', data);
    }

    $('#lrTable').bootstrapTable({
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
                field: '',
                title: '序号',
                align: 'center',
                width: 50,
                formatter: function (value, row, index) {
                    return index + 1;
                }
            }, {
                field: 'D',
                title: '业务单位',
                align: 'center',
                sortable: true,
                width: 80,
            }, {
                field: 'C',
                title: '合同ID',
                align: 'center',
                sortable: true,
                width: 80,
            }, {
                field: 'J',
                title: '工序名称',
                align: 'center',
                sortable: true,
                width: 150,
            }, {
                field: 'K',
                title: '工序内容',
                align: 'center',
                sortable: true,
                width: 150,
            },  {
                field: 'operate',
                title: '操作',
                align: 'center',
                width: 150,
                formatter: function (value, row, index) {
                    // 检查合同ID是否存在
                    var contractId = row.C || '';
                    var qrButtonDisabled = !contractId ? 'disabled' : '';
                    var qrButtonTitle = !contractId ? 'title="合同ID为空"' : '';

                    return `
                        <button type="button" class="btn btn-info btn-sm detail-btn" style="margin-right: 5px;">详情</button>
                        <button type="button" class="btn btn-success btn-sm qr-btn" 
                                data-contract-id="${contractId}" 
                                ${qrButtonDisabled}
                                ${qrButtonTitle}>
                            二维码
                        </button>
                    `;
                },
                events: {
                    'click .detail-btn': function (e, value, row, index) {
                        var contractId = row.C;
                        console.log("详情按钮点击，合同ID:", contractId, "行数据:", row);
                        if (contractId && contractId !== '') {
                            swal({
                                title: "加载中...",
                                text: "正在获取工艺规程详情",
                                icon: "info",
                                buttons: false,
                                closeOnClickOutside: false,
                                closeOnEsc: false
                            });
                            getProcessDetail(contractId);
                        } else {
                            swal("", "合同ID不存在，无法查看详情", "error");
                        }
                    },
                    'click .qr-btn': function (e, value, row, index) {
                        var contractId = row.C;
                        console.log("二维码按钮点击，合同ID:", contractId, "行数据:", row);

                        if (!contractId || contractId === '') {
                            swal("", "合同ID为空，无法生成二维码", "error");
                            return;
                        }

                        generateQRCode(contractId);
                    }
                }
            }
        ]
    });
}

// 在 generateQRCode 函数中，确保使用新的URL路径
function generateQRCode(contractId) {
    console.log("生成二维码，合同ID:", contractId);

    if (!contractId || contractId.trim() === '') {
        swal("", "合同ID不能为空", "error");
        return;
    }

    // 显示加载
    swal({
        title: "生成中...",
        text: "正在生成二维码",
        icon: "info",
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false
    });

    $ajax({
        type: 'post',
        url: '/bgd/generateContractQR',
        data: {
            contractId: contractId
        }
    }, false, '', function (res) {
        swal.close();
        console.log("二维码生成响应:", res);
        if (res.code == 200) {
            showQRCodeModal(contractId, res.data);
        } else {
            swal("", "生成二维码失败：" + res.msg, "error");
        }
    }, function(xhr, status, error) {
        swal.close();
        console.error("AJAX错误:", error);
        console.error("状态码:", xhr.status);
        console.error("响应文本:", xhr.responseText);
        swal("", "请求失败: " + error, "error");
    });
}

// 显示二维码模态框
function showQRCodeModal(contractId, qrData) {
    console.log("显示二维码模态框，合同ID:", contractId, "二维码返回数据:", qrData);

    var qrContent = qrData.qrContent;
    console.log("二维码URL:", qrContent);

    if (!qrContent) {
        console.error("二维码内容为空!");
        swal("", "二维码内容生成失败", "error");
        return;
    }

    var modalHtml = `
<div class="modal fade" id="qrCodeModal" tabindex="-1" role="dialog" aria-labelledby="qrCodeModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="qrCodeModalLabel">合同二维码</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-md-6 text-center">
                        <div id="qrcode"></div>
                        <p class="mt-2"><strong>合同ID:</strong> ${contractId}</p>
                        <div class="alert alert-info mt-2">
                            <small>
                                <strong>使用说明:</strong><br>
                                1. 手机扫描二维码<br>
                                2. 自动跳转至合同详情页面<br>
                                3. 显示完整的工艺规程信息<br>
                                4. 无需安装任何APP
                            </small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h6>访问地址:</h6>
                        <p class="small text-break">${qrContent}</p>
                        <div class="mt-3">
                            <button type="button" class="btn btn-outline-info btn-sm" onclick="copyToClipboard('${qrContent}')">
                                复制链接
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>
                <button type="button" class="btn btn-primary" onclick="downloadQRCode('${contractId}')">下载二维码</button>
            </div>
        </div>
    </div>
</div>
`;

    if ($('#qrCodeModal').length) {
        $('#qrCodeModal').remove();
    }

    $('body').append(modalHtml);
    $('#qrCodeModal').modal('show');

    generateQRImage(qrContent);
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        alert("链接已复制到剪贴板");
    }, function(err) {
        console.error('复制失败: ', err);
    });
}

// 生成内容显示HTML
function generateContentHtml(data) {
    if (!data) return '<p class="text-muted">无数据</p>';

    var html = `
        <div class="card mb-2">
            <div class="card-body p-2">
                <h6 class="card-title">基本信息</h6>
                <p><strong>合同ID:</strong> ${data.contractId || ''}</p>
                <p><strong>业务单位:</strong> ${data.businessUnit || ''}</p>
                <p><strong>工序名称:</strong> ${data.processName || ''}</p>
            </div>
        </div>
    `;

    if (data.processes && data.processes.length > 0) {
        html += `
            <div class="card">
                <div class="card-body p-2">
                    <h6 class="card-title">工序列表 (${data.processes.length}条)</h6>
        `;

        data.processes.forEach((process, index) => {
            html += `
                <div class="border-bottom pb-1 mb-1">
                    <small><strong>${index + 1}. ${process.name || ''}</strong></small><br>
                    <small>内容: ${process.content || ''}</small><br>
                    <small>签名: ${process.sign || ''}</small>
                </div>
            `;
        });

        html += `</div></div>`;
    }

    return html;
}

// 使用qrcode.js生成二维码图片
function generateQRImage(content) {
    // 清空之前的二维码
    $('#qrcode').empty();

    try {
        // 检查 QRCode 库是否可用
        if (typeof QRCode === 'undefined') {
            throw new Error('QRCode 库未加载');
        }

        // 使用qrcode.js生成二维码
        new QRCode(document.getElementById("qrcode"), {
            text: content,
            width: 200,
            height: 200,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
        console.log("二维码生成成功");
    } catch (error) {
        console.error("二维码生成失败:", error);
        // 显示错误信息
        $('#qrcode').html(`
            <div class="alert alert-danger">
                <p>二维码生成失败</p>
                <p class="small">${error.message}</p>
                <p class="small">二维码内容: ${content}</p>
            </div>
        `);
    }
}

// 下载二维码
function downloadQRCode(contractId) {
    var canvas = document.querySelector('#qrcode canvas');
    if (canvas) {
        var link = document.createElement('a');
        link.download = 'contract_' + (contractId || 'unknown') + '_qrcode.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        console.log("二维码下载成功");
    } else {
        console.error("找不到二维码canvas元素");
        swal("", "找不到二维码图像", "error");
    }
}

// 显示扣工时弹窗
function showDeductHoursModal(id, currentHours) {
    // 确保currentHours是数字并格式化显示
    const currentHoursNum = parseFloat(currentHours) || 0;
    const formattedCurrentHours = currentHoursNum.toFixed(1); // 格式化为1位小数

    const modalHtml = `
    <div class="modal fade" id="deductHoursModal" tabindex="-1" role="dialog" aria-labelledby="deductHoursModalLabel">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="deductHoursModalLabel">扣工时</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="deductHoursForm">
                        <div class="form-group">
                            <label for="currentHours">当前工时:</label>
                            <input type="text" class="form-control" id="currentHours" value="${formattedCurrentHours}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="deductHours">扣除工时:</label>
                            <input type="number" class="form-control" id="deductHours" 
                                   min="0" max="${currentHoursNum}" step="0.1" 
                                   placeholder="请输入要扣除的工时" required>
                            <small class="form-text text-muted">最大可扣除: ${formattedCurrentHours} 小时</small>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" id="confirmDeductBtn">确认扣除</button>
                </div>
            </div>
        </div>
    </div>
    `;

    if ($('#deductHoursModal').length) {
        $('#deductHoursModal').remove();
    }

    $('body').append(modalHtml);
    $('#deductHoursModal').modal('show');

    // 绑定确认扣除按钮事件
    $('#confirmDeductBtn').off('click').on('click', function() {
        const deductHoursInput = $('#deductHours').val();
        const deductHours = parseFloat(deductHoursInput) || 0;
        const deductReason = "";

        if (deductHours <= 0) {
            alert('请输入有效的扣除工时');
            return;
        }

        if (deductHours > currentHoursNum) {
            alert('扣除工时不能大于当前工时');
            return;
        }

        // 显示加载
        $(this).html('<span class="spinner-border spinner-border-sm" role="status"></span> 处理中...');
        $(this).prop('disabled', true);

        // 调用后端接口更新工时
        deductWorkHours(id, currentHoursNum, deductHours, deductReason);
    });

    $('#deductHoursModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

// 扣工时函数
function deductWorkHours(id, currentHours, deductHours, deductReason) {
    // 使用toFixed来避免浮点数精度问题
    const newHours = parseFloat((currentHours - deductHours).toFixed(1));

    $ajax({
        type: 'post',
        url: '/bgd/deductWorkHours',
        data: {
            id: id,
            newHours: newHours,
            deductHours: deductHours,
            deductReason: deductReason
        }
    }, false, '', function(res) {
        $('#confirmDeductBtn').html('确认扣除');
        $('#confirmDeductBtn').prop('disabled', false);

        if (res.code == 200) {
            $('#deductHoursModal').modal('hide');
            swal("", "扣工时成功", "success");

            // 更新页面显示，使用格式化后的数值
            $(`#processDetailTable tr[data-id="${id}"] .work-hours`).text(newHours.toFixed(1));
            $(`#processDetailTable .deduct-hours-btn[data-id="${id}"]`).data('hours', newHours);

            // 记录扣款日志
            console.log(`扣工时记录: ID=${id}, 原工时=${currentHours}, 扣除=${deductHours}, 新工时=${newHours}, 原因=${deductReason}`);
        } else {
            swal("", "扣工时失败：" + res.msg, "error");
        }
    }, function(xhr, status, error) {
        $('#confirmDeductBtn').html('确认扣除');
        $('#confirmDeductBtn').prop('disabled', false);
        swal("", "请求失败: " + error, "error");
    });
}

// 显示复工确认弹窗
function showResetProcessModal(id, processName) {
    const modalHtml = `
    <div class="modal fade" id="resetProcessModal" tabindex="-1" role="dialog" aria-labelledby="resetProcessModalLabel">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="resetProcessModalLabel">工序复工确认</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>注意：</strong>此操作将对此工序归类到重新进行序列中，请确认是否继续？
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" id="confirmResetBtn">确认复工</button>
                </div>
            </div>
        </div>
    </div>
    `;

    if ($('#resetProcessModal').length) {
        $('#resetProcessModal').remove();
    }

    $('body').append(modalHtml);
    $('#resetProcessModal').modal('show');

    // 绑定确认复工按钮事件
    $('#confirmResetBtn').off('click').on('click', function() {
        const resetReason = "";


        // 显示加载
        $(this).html('<span class="spinner-border spinner-border-sm" role="status"></span> 处理中...');
        $(this).prop('disabled', true);

        // 调用后端接口清空签名和完工时间
        resetProcess(id, resetReason, processName);
    });

    $('#resetProcessModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

// 工序复工函数
function resetProcess(id, resetReason, processName) {
    $ajax({
        type: 'post',
        url: '/bgd/resetProcess',
        data: {
            id: id,
            resetReason: resetReason
        }
    }, false, '', function(res) {
        $('#confirmResetBtn').html('确认复工');
        $('#confirmResetBtn').prop('disabled', false);

        if (res.code == 200) {
            $('#resetProcessModal').modal('hide');
            swal("", "工序复工成功", "success");

            // 更新页面显示
            const $row = $(`#processDetailTable tr[data-id="${id}"]`);
            $row.find('.employee-sign').text('');
            $row.find('.completion-time').text('');

            // 隐藏复工按钮（因为现在没有签名了）
            $row.find('.reset-process-btn').remove();

            // 记录复工日志
            console.log(`工序复工记录: ID=${id}, 工序名称=${processName}, 原因=${resetReason}`);
        } else {
            swal("", "工序复工失败：" + res.msg, "error");
        }
    }, function(xhr, status, error) {
        $('#confirmResetBtn').html('确认复工');
        $('#confirmResetBtn').prop('disabled', false);
        swal("", "请求失败: " + error, "error");
    });
}