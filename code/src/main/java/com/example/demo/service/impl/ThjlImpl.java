package com.example.demo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.Thjl;
import com.example.demo.mapper.ThjlMapper;
import com.example.demo.service.ThjlService;
import com.example.demo.util.PageResult;
import com.example.demo.util.StringUtils;
import com.example.demo.util.ThjlPageRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

/**
 * @author hui
 * @date 2025/11/25 9:34
 */
@Service
public class ThjlImpl extends ServiceImpl<ThjlMapper, Thjl> implements ThjlService {
    @Autowired
    ThjlMapper thjlMapper;


//    @Override
//    public List<Thjl> getList() {  // 方法名必须一致
//        return thjlMapper.getList();
//    }

    @Override
    public PageResult<Thjl> getThjlPage(ThjlPageRequest request) {
        try {
            long start = (long) (request.getPageNum() - 1) * request.getPageSize() + 1;
            long end = (long) request.getPageNum() * request.getPageSize();
            int pageSize = request.getPageSize();

            // 构建查询条件，但不包含 ORDER BY
            LambdaQueryWrapper<Thjl> wrapper = new LambdaQueryWrapper<>();

            // 添加日期范围查询（回厂日期 w 字段）
            if (StringUtils.isNotBlank(request.getKsrq()) && StringUtils.isNotBlank(request.getJsrq())) {
                // 数据库中是 yyyy-MM-dd 字符串，直接进行字符串比较
                String ksrq = formatToHyphenDate(request.getKsrq());
                String jsrq = formatToHyphenDate(request.getJsrq());

                // 使用字符串比较，因为数据库中 w 字段是字符串格式
                wrapper.apply("w >= {0} AND w <= {1}", ksrq, jsrq);
            }

            // 添加其他条件查询
            if (StringUtils.isNotBlank(request.getH())) {
                wrapper.like(Thjl::getG, request.getH());  // h参数对应数据库g字段（合同号）
            }
            if (StringUtils.isNotBlank(request.getI())) {
                wrapper.like(Thjl::getH, request.getI());  // i参数对应数据库h字段（任务号）
            }
            if (StringUtils.isNotBlank(request.getK())) {
                wrapper.like(Thjl::getJ, request.getK());  // k参数对应数据库j字段（图号）
            }
            if (StringUtils.isNotBlank(request.getR())) {
                wrapper.like(Thjl::getQ, request.getR());  // r参数对应数据库q字段（退货原因）
            }

            // 注意：不在wrapper中添加排序，因为SQL中已经有ROW_NUMBER的排序

            // 使用 SQL Server 分页查询数据
            List<Thjl> records = thjlMapper.selectForPage(start, end, wrapper);

            // 查询总记录数
            Long totalCount = thjlMapper.selectCountForPage(wrapper);

            // 计算总页数
            Long totalPages = (totalCount + pageSize - 1) / pageSize;


            return new PageResult<>(records, totalCount, totalPages);
        } catch (Exception e) {
            log.error("退货记录分页查询失败", e);
            throw new RuntimeException("查询失败: " + e.getMessage());
        }
    }

    /**
     * 将日期格式统一转为 yyyy-MM-dd 格式
     */
    private String formatToHyphenDate(String dateStr) {
        try {
            if (StringUtils.isBlank(dateStr)) {
                return "";
            }

            // 移除空格
            dateStr = dateStr.trim();

            // 1. 如果是 yyyy/MM/dd 格式，转为 yyyy-MM-dd
            if (dateStr.contains("/")) {
                String[] parts = dateStr.split("/");
                if (parts.length >= 3) {
                    String year = parts[0];
                    String month = parts[1].length() == 1 ? "0" + parts[1] : parts[1];
                    String day = parts[2].length() == 1 ? "0" + parts[2] : parts[2];
                    return year + "-" + month + "-" + day;
                }
            }

            // 2. 如果是 yyyy-M-d 格式，转为 yyyy-MM-dd
            if (dateStr.contains("-")) {
                String[] parts = dateStr.split("-");
                if (parts.length >= 3) {
                    String year = parts[0];
                    String month = parts[1].length() == 1 ? "0" + parts[1] : parts[1];
                    String day = parts[2].length() == 1 ? "0" + parts[2] : parts[2];
                    return year + "-" + month + "-" + day;
                }
            }

            // 3. 尝试解析常见格式
            try {
                SimpleDateFormat[] formats = {
                        new SimpleDateFormat("yyyy/MM/dd"),
                        new SimpleDateFormat("yyyy-MM-dd"),
                        new SimpleDateFormat("yyyy/MM/d"),
                        new SimpleDateFormat("yyyy-M-d")
                };

                Date date = null;
                for (SimpleDateFormat format : formats) {
                    try {
                        date = format.parse(dateStr);
                        break;
                    } catch (Exception e) {
                        // 继续尝试下一个格式
                    }
                }

                if (date != null) {
                    SimpleDateFormat outputFormat = new SimpleDateFormat("yyyy-MM-dd");
                    return outputFormat.format(date);
                }
            } catch (Exception e) {
                // 解析失败，返回原字符串
            }

            return dateStr;
        } catch (Exception e) {
            return dateStr;
        }
    }


    @Override
    public List<Thjl> queryList(String ksrq, String jsrq, String h, String i, String k, String r) {
        // 确保参数不为null
        ksrq = ksrq != null ? ksrq : "";
        jsrq = jsrq != null ? jsrq : "";
        h = h != null ? h : "";
        i = i != null ? i : "";
        k = k != null ? k : "";
        r = r != null ? r : "";

        return baseMapper.queryList(ksrq, jsrq, h, i, k, r);
    }


    @Override
    public boolean update(Thjl thjl) {
        // 使用MyBatis-Plus的updateById方法
        // ✅ 正确：应该调用自定义的update方法
        return thjlMapper.update(thjl);
    }


    @Override
    public boolean add(Thjl thjl) {
        return thjlMapper.add(thjl);
    }

    @Override
    public boolean delete(List<Integer> idList) {
        return removeByIds(idList);
    }

    @Override
    public List<Thjl> gettdh() {  // 方法名必须一致
        return baseMapper.gettdh();
    }

    @Override
    public List<Thjl> getth(String returnNo ){
        return baseMapper.getth(returnNo);
    }
}






