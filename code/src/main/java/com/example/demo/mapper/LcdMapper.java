package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.Lcd;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface LcdMapper extends BaseMapper<Lcd> {

    /**
     * 直接查询工艺规程数据 - 单次SQL完成所有逻辑
     */
    @Select({
            "WITH UncompletedContracts AS (",
            "    SELECT DISTINCT hj.id",
            "    FROM hetong_jilu hj",
            "    LEFT JOIN (",
            "        SELECT C as left_id,",
            "        CASE WHEN SUM(CASE WHEN ISNULL(gg.K, '') != '' THEN 1 ELSE 0 END) > ",
            "                  SUM(CASE WHEN ISNULL(gg.M, '') != '' THEN 1 ELSE 0 END)",
            "             THEN '未完成' ELSE '已完成' END as zhuangtai",
            "        FROM gongyi_guicheng gg",
            "        GROUP BY C",
            "    ) as status_table ON hj.id = status_table.left_id",
            "    LEFT JOIN tuihuo t ON hj.id = t.id",
            "    WHERE ISNULL(hj.hetong_zhuangtai, '') = ''",
            "    AND ISNULL(status_table.zhuangtai, '未创建') = '未完成'",
            "    AND t.id IS NULL",  // 排除退货合同
            ")",
            ", RankedProcess AS (",
            "    SELECT ",
            "        gp.id, gp.C, gp.J, gp.K, gp.M, gp.D,",
            "        ROW_NUMBER() OVER (PARTITION BY gp.C ORDER BY gp.id ASC) as rn",
            "    FROM gongyi_guicheng gp",
            "    INNER JOIN UncompletedContracts uc ON gp.C = CAST(uc.id AS NVARCHAR(50))",
            "    WHERE (ISNULL(gp.M, '') = '' OR gp.M = '')",
            ")",
            "SELECT id, C, J, K, M, D",
            "FROM RankedProcess",
            "WHERE rn = 1"
    })
    List<Lcd> getOptimizedProcessData();

    /**
     * 带条件的优化查询
     */
    @Select({
            "<script>",
            "WITH UncompletedContracts AS (",
            "    SELECT DISTINCT hj.id",
            "    FROM hetong_jilu hj",
            "    LEFT JOIN (",
            "        SELECT C as left_id,",
            "        CASE WHEN SUM(CASE WHEN ISNULL(gg.K, '') != '' THEN 1 ELSE 0 END) > ",
            "                  SUM(CASE WHEN ISNULL(gg.M, '') != '' THEN 1 ELSE 0 END)",
            "             THEN '未完成' ELSE '已完成' END as zhuangtai",
            "        FROM gongyi_guicheng gg",
            "        GROUP BY C",
            "    ) as status_table ON hj.id = status_table.left_id",
            "    LEFT JOIN tuihuo t ON hj.id = t.id",
            "    WHERE ISNULL(hj.hetong_zhuangtai, '') = ''",
            "    AND ISNULL(status_table.zhuangtai, '未创建') = '未完成'",
            "    AND t.id IS NULL",
            "    <if test='additionalWhere != null and additionalWhere != \"\"'>",
            "        ${additionalWhere}",
            "    </if>",
            ")",
            ", RankedProcess AS (",
            "    SELECT ",
            "        gp.id, gp.C, gp.J, gp.K, gp.M, gp.D,",
            "        ROW_NUMBER() OVER (PARTITION BY gp.C ORDER BY gp.id ASC) as rn",
            "    FROM gongyi_guicheng gp",
            "    INNER JOIN UncompletedContracts uc ON gp.C = CAST(uc.id AS NVARCHAR(50))",
            "    WHERE (ISNULL(gp.M, '') = '' OR gp.M = '')",
            ")",
            "SELECT id, C, J, K, M, D",
            "FROM RankedProcess",
            "WHERE rn = 1",
            "</script>"
    })
    List<Lcd> getOptimizedProcessDataWithCondition(@Param("additionalWhere") String additionalWhere);

    // 保留原有方法供其他接口使用
    @Select("SELECT id FROM tuihuo WHERE ISNULL(id, '') != ''")
    List<Integer> selectAllTuihuoIds();

    /**
     * 根据合同ID获取工艺规程详情
     */
    @Select("SELECT * " +
            "FROM gongyi_guicheng " +
            "WHERE C = #{contractId} " +
            "ORDER BY id") // 可以根据需要排序
    List<Lcd> selectDetailByContractId(@Param("contractId") String contractId);
}