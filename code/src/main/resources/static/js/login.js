var idd;
function getList() {
    $('#name').val("");
    $('#power').val("");
    $ajax({
        type: 'post',
        url: '/user/getList',
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

    $('#select-btn').click(function () {
        var name = $('#name').val();
        console.log('查询条件 - 姓名:', name);

        $ajax({
            type: 'post',
            url: '/user/queryList',
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

        // 手动构建参数，确保字段映射正确
        let params = {
            c: $('#add-name').val(),      // 姓名
            d: $('#add-username').val(),  // 账号
            e: $('#add-password').val(),  // 密码
            f: $('#add-power').val()      // 权限
        };

        console.log('前端输入的数据:', params); // 调试信息

        if (checkForm('#add-form')) {
            $ajax({
                type: 'post',
                url: '/user/add',
                data: JSON.stringify({
                    addInfo: params
                }),
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
            }, function() {
                // 请求失败时也恢复按钮状态
                $btn.data('submitting', false);
                $btn.prop('disabled', false);
                $btn.html(originalText);
                swal("", "请求失败，请检查网络连接", "error");
            });
        } else {
            // 表单验证失败时恢复按钮状态
            $btn.data('submitting', false);
            $btn.prop('disabled', false);
            $btn.html(originalText);
        }
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
            $('#update-name').val(selectedRow.c || '');
            $('#update-username').val(selectedRow.d || '');
            $('#update-password').val(selectedRow.e || '');
            $('#update-power').val(selectedRow.f || '');
            $('#id').val(selectedRow.id || '');  // 添加这一行！


            console.log('填充后的表单值:');
            console.log('姓名:', $('#update-name').val());
            console.log('账号:', $('#update-username').val());
            console.log('密码:', $('#update-password').val());
            console.log('权限:', $('#update-power').val());


            window.selectedUserData = null;
        }
    });

    //修改弹窗点击提交按钮
    $('#update-submit-btn').click(function () {
        var msg = confirm("确认要修改吗？");
        console.log("msg", msg);
        if (msg) {
            // 详细检查表单状态
            console.log('=== 表单验证详细检查 ===');
            console.log('ID字段值:', $('#id').val());
            console.log('姓名字段值:', $('#update-name').val());
            console.log('账号字段值:', $('#update-username').val());
            console.log('密码字段值:', $('#update-password').val());
            console.log('权限字段值:', $('#update-power').val());

            // 检查表单验证类
            console.log('是否有is-invalid类:', $('.is-invalid').length);
            console.log('表单元素:', $('#update-form')[0]);

            var formCheckResult = checkForm('#update-form');
            console.log('checkForm结果:', formCheckResult);

            // 如果验证失败，显示具体原因
            if (!formCheckResult) {
                console.log('表单验证失败原因:');
                $('.is-invalid').each(function(index) {
                    console.log('无效字段:', $(this).attr('name'), '原因:', $(this).next('.invalid-feedback').text());
                });
            }

            if (formCheckResult) {
                console.log('表单验证通过，开始提交...');
                // 获取表单数据
                let params = {
                    id: $('#id').val(),
                    c: $('#update-name').val(),
                    d: $('#update-username').val(),
                    e: $('#update-password').val(),
                    f: $('#update-power').val()
                };

                console.log('提交的修改数据:', params);

                $.ajax({
                    type: 'POST',
                    url: '/user/update',
                    data: JSON.stringify(params),
                    dataType: 'json',
                    contentType: 'application/json;charset=utf-8',
                    success: function (res) {
                        if (res.code == 200) {
                            swal("", res.msg, "success");
                            $('#update-modal').modal('hide');
                            $('#update-form')[0].reset();
                            getList();
                        } else {
                            swal("", res.msg, "error");
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error('请求失败:', error);
                        swal("", "请求失败，请检查网络连接", "error");
                    }
                });
            } else {
                console.log('表单验证失败，无法提交');
                // 临时绕过验证进行测试
                console.log('=== 测试绕过验证 ===');
                let testParams = {
                    id: $('#id').val(),
                    c: $('#update-name').val(),
                    d: $('#update-username').val(),
                    e: $('#update-password').val(),
                    f: $('#update-power').val()
                };
                console.log('测试提交数据:', testParams);
            }
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
                url: '/user/delete',
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
                    field: 'c',  // 小写 c - 对应姓名
                    title: '姓名',
                    align: 'center',
                    sortable: true,
                    width: 100,
                }, {
                    field: 'd',  // 小写 d - 对应用户名
                    title: '账号',
                    align: 'center',
                    sortable: true,
                    width: 100,
                }, {
                    field: 'e',  // 小写 e - 对应密码
                    title: '密码',
                    align: 'center',
                    sortable: true,
                    width: 100,
                }, {
                    field: 'f',  // 小写 f - 对应权限
                    title: '权限',
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






// var idd;
//
// function getList() {
//     $('#name').val("");
//     $('#power').val("");
//     $ajax({
//         type: 'post',
//         url: '/Login/getList',
//     }, false, '', function (res) {
//         if (res.code == 200) {
//             setTable(res.data);
//             $("#userTable").colResizable({
//                 liveDrag: true,
//                 gripInnerHtml: "<div class='grip'></div>",
//                 draggingClass: "dragging",
//                 resizeMode: 'fit'
//             });
//             // 修正循环逻辑
//             if (res.data && res.data.length > 0) {
//                 idd = res.data[res.data.length - 1].id; // 获取最后一个ID
//             }
//         }
//     })
// }
//
// $(function () {
//     getList();
//
//     $ajax({
//         type: 'post',
//         url: '/Login/getName',
//     }, false, '', function (res) {
//         var this_name = res.data
//         document.getElementById("dlm").innerText = this_name;
//     })
//
//     $('#select-btn').click(function () {
//         var name = $('#name').val();
//         var power = $('#power').val();
//         $ajax({
//             type: 'post',
//             url: '/user/queryList',
//             data: {
//                 name: name,
//                 power: power,
//             }
//         }, true, '', function (res) {
//             if (res.code == 200) {
//                 setTable(res.data);
//             }
//         })
//     });
//
//     //刷新
//     $("#refresh-btn").click(function () {
//         getList();
//     });
//
//     // 点击新增按钮显示弹窗
//     $("#add-btn").click(function () {
//         $('#add-modal').modal('show');
//     });
//
//     // 新增弹窗里点击关闭按钮
//     $('#add-close-btn').click(function () {
//         $('#add-modal').modal('hide');
//     });
//
//     // 新增弹窗里点击提交按钮
//     $("#add-submit-btn").click(function () {
//         let params = formToJson("#add-form");
//         if (checkForm('#add-form')) {
//             $ajax({
//                 type: 'post',
//                 url: '/user/add',
//                 data: JSON.stringify({
//                     addInfo: params
//                 }),
//                 dataType: 'json',
//                 contentType: 'application/json;charset=utf-8'
//             }, false, '', function (res) {
//                 if (res.code == 200) {
//                     swal("", res.msg, "success");
//                     $('#add-form')[0].reset();
//                     getList();
//                     $('#add-close-btn').click();
//                 }
//             })
//         }
//     });
//
//     // 点击修改按钮显示弹窗
//     $('#update-btn').click(function () {
//         let rows = getTableSelection('#userTable');
//         if (rows.length > 1 || rows.length == 0) {
//             swal('请选择一条数据修改!');
//             return;
//         }
//         $('#update-modal').modal('show');
//         setForm(rows[0], '#update-form');
//         $('#update-name').val(rows[0].name);
//         $('#update-username').val(rows[0].username);
//         $('#update-password').val(rows[0].password);
//         $('#update-power').val(rows[0].power);
//         $('#update-caozuoquanxian').val(rows[0].caozuoquanxian);
//     });
//
//     // 修改弹窗点击关闭按钮
//     $('#update-close-btn').click(function () {
//         $('#update-form')[0].reset();
//         $('#update-modal').modal('hide');
//     });
//
//     // 修改弹窗里点击提交按钮
//     $('#update-submit-btn').click(function () {
//         var msg = confirm("确认要修改吗？");
//         if (msg) {
//             if (checkForm('#update-form')) {
//                 let params = formToJson('#update-form');
//                 $ajax({
//                     type: 'post',
//                     url: '/user/update',
//                     data: {
//                         updateJson: JSON.stringify(params)
//                     },
//                     dataType: 'json',
//                     contentType: 'application/json;charset=utf-8'
//                 }, false, '', function (res) {
//                     if (res.code == 200) {
//                         swal("", res.msg, "success");
//                         $('#update-close-btn').click();
//                         $('#update-modal').modal('hide');
//                         getList();
//                     } else {
//                         swal("", res.msg, "error");
//                     }
//                 })
//             }
//         }
//     });
//
//     // 点击删除按钮
//     $('#delete-btn').click(function () {
//         var msg = confirm("确认要删除吗？");
//         if (msg) {
//             let rows = getTableSelection("#userTable");
//             if (rows.length == 0) {
//                 swal('请选择要删除的数据！');
//                 return;
//             }
//             let idList = [];
//             $.each(rows, function (index, row) {
//                 idList.push(row.id)
//             });
//             $ajax({
//                 type: 'post',
//                 url: '/user/delete',
//                 data: JSON.stringify({
//                     idList: idList
//                 }),
//                 dataType: 'json',
//                 contentType: 'application/json;charset=utf-8'
//             }, false, '', function (res) {
//                 if (res.code == 200) {
//                     swal("", res.msg, "success");
//                     getList();
//                 } else {
//                     swal("", res.msg, "error");
//                 }
//             })
//         }
//     });
//
//     // 更新时间显示
//     updateTime();
//     setInterval(updateTime, 1000);
// });
//
// function setTable(data) {
//     // 先销毁表格（如果已存在）
//     if ($('#userTable').hasClass('bootstrap-table')) {
//         $('#userTable').bootstrapTable('destroy');
//     }
//
//     $('#userTable').bootstrapTable({
//         data: data,
//         sortStable: true,
//         classes: 'table table-hover text-nowrap table table-bordered',
//         idField: 'id',
//         pagination: true,
//         pageSize: 15,
//         clickToSelect: true,
//         locale: 'zh-CN',
//         toolbar: '#table-toolbar',
//         toolbarAlign: 'left',
//         theadClasses: "thead-light",
//         style: 'table-layout: fixed',
//         columns: [
//             {
//                 field: 'name',
//                 title: '姓名',
//                 align: 'center',
//                 sortable: true,
//                 width: 80,
//             }, {
//                 field: 'username',
//                 title: '账号',
//                 align: 'center',
//                 sortable: true,
//                 width: 80,
//             }, {
//                 field: 'password',
//                 title: '密码',
//                 align: 'center',
//                 sortable: true,
//                 width: 80,
//             }, {
//                 field: 'power',
//                 title: '权限',
//                 align: 'center',
//                 sortable: true,
//                 width: 130,
//             }
//         ],
//         onClickRow: function (row, el) {
//             let isSelect = $(el).hasClass('selected')
//             if (isSelect) {
//                 $(el).removeClass('selected')
//             } else {
//                 $(el).addClass('selected')
//             }
//         }
//     });
// }
//
// // 更新时间函数
// function updateTime() {
//     const now = new Date();
//     const timeString = now.toLocaleString('zh-CN', {
//         year: 'numeric',
//         month: '2-digit',
//         day: '2-digit',
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//         hour12: false
//     });
//     $('#now_time').text(timeString);
// }