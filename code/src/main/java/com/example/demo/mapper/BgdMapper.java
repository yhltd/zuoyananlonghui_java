package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.Bgd;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Mapper
@Repository
public interface BgdMapper extends BaseMapper<Bgd> {

    /**
     * 查询工艺规程数据
     */
//    @Select({
//            "<script>",
//            "WITH AllContracts AS (",
//            "    SELECT DISTINCT hj.id",
//            "    FROM hetong_jilu hj",
//            "    LEFT JOIN (",
//            "        SELECT C left_id,",
//            "        CASE WHEN SUM(CASE WHEN ISNULL(gg.K, '') != '' THEN 1 ELSE 0 END) > ",
//            "                  SUM(CASE WHEN ISNULL(gg.M, '') != '' THEN 1 ELSE 0 END)",
//            "             THEN '未完成' ELSE '已完成' END zhuangtai",
//            "        FROM gongyi_guicheng gg",
//            "        GROUP BY C",
//            "    ) status_table ON hj.id = status_table.left_id",
//            "    WHERE ISNULL(hj.hetong_zhuangtai, '') = ''",
//            "    AND NOT EXISTS (",
//            "        SELECT 1 FROM tuihuo t ",
//            "        WHERE t.v = hj.id",
//            "    )",
//            ")",
//            ", RankedProcess AS (",
//            "    SELECT ",
//            "        gp.id, gp.C, gp.J, gp.K, gp.M, gp.D,",
//            "        ROW_NUMBER() OVER (PARTITION BY gp.C ORDER BY gp.id ASC) rn",
//            "    FROM gongyi_guicheng gp",
//            "    INNER JOIN AllContracts ac ON gp.C = CAST(ac.id AS NVARCHAR(50))",
//            ")",
//            "SELECT id, C, J, K, M, D",
//            "FROM RankedProcess",
//            "WHERE rn = 1",
//            "</script>"
//    })
//    List<Map<String, Object>> getOptimizedProcessData();

    @Select({
            "<script>",
            "WITH AllContracts AS (",
            "    SELECT DISTINCT hj.id",
            "    FROM hetong_jilu hj",
            "    WHERE ISNULL(hj.hetong_zhuangtai, '') = ''",
            "      AND hj.zhuangtai IN ('未完成', '已完成')",
            "      AND NOT EXISTS (",
            "          SELECT 1 FROM tuihuo t ",
            "          WHERE t.v = hj.id",
            "      )",
            ")",
            ", RankedProcess AS (",
            "    SELECT ",
            "        gp.id, gp.C, gp.J, gp.K, gp.M, gp.D,",
            "        ROW_NUMBER() OVER (PARTITION BY gp.C ORDER BY gp.id ASC) rn",
            "    FROM gongyi_guicheng gp",
            "    INNER JOIN AllContracts ac ON gp.C = CAST(ac.id AS NVARCHAR(50))",
            ")",
            "SELECT id, C, J, K, M, D",
            "FROM RankedProcess",
            "WHERE rn = 1",
            "</script>"
    })
    List<Map<String, Object>> getOptimizedProcessData();


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
    List<Bgd> getOptimizedProcessDataWithCondition(@Param("additionalWhere") String additionalWhere);

    /**
     * 查询合同数据 - 返回待完成和已完成的合同（排除退货合同）
     */
    @Select({
            "SELECT ",
            "  hj.id, ",
            "  hj.hetong_name as contractName, ",
            "  hj.hetong_bianhao as contractNumber, ",
            "  hj.hetong_zhuangtai as contractStatus",
            "FROM hetong_jilu hj ",
            "WHERE NOT EXISTS (SELECT 1 FROM tuihuo t WHERE t.id = hj.id) ",
            "AND hj.hetong_zhuangtai IN ('待完成', '已完成') ",
            "ORDER BY hj.id DESC"
    })
    List<Map<String, Object>> getContractList();

    /**
     * 带条件的合同查询
     */
    @Select({
            "<script>",
            "SELECT ",
            "  hj.id, ",
            "  hj.hetong_name as contractName, ",
            "  hj.hetong_bianhao as contractNumber, ",
            "  hj.hetong_zhuangtai as contractStatus",
            "FROM hetong_jilu hj ",
            "WHERE NOT EXISTS (SELECT 1 FROM tuihuo t WHERE t.id = hj.id) ",
            "AND hj.hetong_zhuangtai IN ('待完成', '已完成') ",
            "<if test='additionalWhere != null and additionalWhere != \"\"'>",
            "  AND ${additionalWhere}",
            "</if>",
            "ORDER BY hj.id DESC",
            "</script>"
    })
    List<Map<String, Object>> getContractListWithCondition(@Param("additionalWhere") String additionalWhere);

    @Select("SELECT id FROM tuihuo WHERE ISNULL(id, '') != ''")
    List<Integer> selectAllTuihuoIds();

    @Select("SELECT * FROM gongyi_guicheng WHERE C = #{contractId}")
    List<Map<String, Object>> getContractDetails(@Param("contractId") String contractId);

    @Update("UPDATE gongyi_guicheng SET M = #{employeeSign}, N = #{completionTime} WHERE C = #{contractId} AND J = #{processName} AND id = #{id}")
    int updateProcessSign(@Param("contractId") String contractId,
                          @Param("processName") String processName,
                          @Param("employeeSign") String employeeSign,
                          @Param("completionTime") String completionTime,
                          @Param("id") Integer id);

    @Update("UPDATE gongyi_guicheng SET L = #{newHours} WHERE id = #{id}")
    int updateWorkHours(@Param("id") Integer id, @Param("newHours") Double newHours);

    @Update("UPDATE gongyi_guicheng SET M = NULL, N = NULL WHERE id = #{id}")
    int resetProcessSign(@Param("id") Integer id);
}