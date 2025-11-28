var idd;

function getList() {
    $ajax({
        type: 'post',
        url: '/lcd/getList',
    }, false, '', function (res) {
        if (res.code == 200) {
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
                    <table class="table table-bordered table-sm">
                        <thead class="thead-light">
                            <tr>
                                <th>序号</th>
                                <th>工序名称</th>
                                <th>工序内容</th>
                                <th>合计工时</th>
                                <th>员工签名</th>
                                <th>完工时间</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        // 遍历数据生成表格行
        data.forEach((item, index) => {
            processTableHtml += `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${item.j || ''}</td>
                                <td>${item.k || ''}</td>
                                <td>${item.l || ''}</td>
                                <td>${item.m || ''}</td>
                                <td>${item.n || ''}</td>
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

    $('#processDetailModal').on('hidden.bs.modal', function () {
        $(this).remove();
    });
}

$(function () {
    getList();
    $('#add-close-btn').click(function () {
        $('#add-modal').modal('hide');
    });
});

function setTable(data) {
    if ($('#lrTable').html != '') {
        $('#lrTable').bootstrapTable('load', data);
    }

    $('#lrTable').bootstrapTable({
        data: data,
        sortStable: true,
        classes: 'table table-hover text-nowrap table table-bordered',
        idField: 'id',
        pagination: true,
        pageSize: 15,
        clickToSelect: true,
        locale: 'zh-CN',
        toolbar: '#table-toolbar',
        toolbarAlign: 'left',
        theadClasses: "thead-light",
        style: 'table-layout:fixed',
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
                field: 'd',
                title: '业务单位',
                align: 'center',
                sortable: true,
                width: 80,
            }, {
                field: 'c',
                title: '合同ID',
                align: 'center',
                sortable: true,
                width: 80,
            }, {
                field: 'j',
                title: '工序名称',
                align: 'center',
                sortable: true,
                width: 150,
            }, {
                field: 'k',
                title: '工序内容',
                align: 'center',
                sortable: true,
                width: 150,
            }, {
                field: 'operate',
                title: '操作',
                align: 'center',
                width: 100,
                formatter: function (value, row, index) {
                    // 直接使用row.c获取合同ID，不使用data属性
                    return '<button type="button" class="btn btn-info btn-sm detail-btn">详情</button>';
                },
                events: {
                    'click .detail-btn': function (e, value, row, index) {
                        // 直接从行数据获取合同ID
                        var contractId = row.c;
                        console.log("点击详情，合同ID:", contractId, "行数据:", row);

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
                    }
                }
            }
        ],
        onClickRow: function (row, el) {
            let isSelect = $(el).hasClass('selected');
            if (isSelect) {
                $(el).removeClass('selected');
            } else {
                $(el).addClass('selected');
            }
        }
    });
}