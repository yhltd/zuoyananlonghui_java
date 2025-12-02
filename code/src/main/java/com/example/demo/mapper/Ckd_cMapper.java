package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.*;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * @author hui
 * @date 2025/11/25 9:32
 */
@Mapper
@Repository
public interface Ckd_cMapper extends BaseMapper<Ckd_c> {
    // 使用MyBatis Plus的默认方法，不需要额外SQL



    /**
     * 根据出库单号统计数量
     */
    @Select("SELECT COUNT(*) FROM chuku WHERE E = #{chukudanhao}")
    Integer countByChukudanhao(@Param("chukudanhao") String chukudanhao);

    /**
     * 根据出库单号删除数据
     */
    @Delete("DELETE FROM chuku WHERE E = #{chukudanhao}")
    int deleteByChukudanhao(@Param("chukudanhao") String chukudanhao);



    /**
     * 更新合同记录状态
     */
    @Update("UPDATE hetong_jilu SET hetong_zhuangtai = #{status}, AP = #{chukuriqi}, AU = #{chukudanhao} WHERE id = #{contractId}")
    int updateHetongJiluStatus(@Param("contractId") String contractId,
                               @Param("status") String status,
                               @Param("chukuriqi") String chukuriqi,
                               @Param("chukudanhao") String chukudanhao);






    /**
     * 根据合同号查询合同信息
     */
    @Select({
            "<script>",
            "SELECT id, hetong_bianhao, hetong_zhuangtai FROM hetong_jilu WHERE hetong_bianhao IN ",
            "<foreach collection='contractNumbers' item='number' open='(' separator=',' close=')'>",
            "#{number}",
            "</foreach>",
            "</script>"
    })
    List<Map<String, Object>> selectContractInfoByNumbers(@Param("contractNumbers") List<String> contractNumbers);

    @Select("select isnull(max(E),'') from chuku where E like 'LH-' + CONVERT(varchar(8), GETDATE(), 112) + '%'")
    String  getddh();


}



