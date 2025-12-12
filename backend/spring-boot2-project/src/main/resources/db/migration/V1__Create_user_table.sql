-- 创建用户表
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `age` int(11) DEFAULT NULL COMMENT '年龄',
  `deleted` int(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除字段(0:未删除 1:已删除)',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 插入测试数据
INSERT INTO `user` (`id`, `username`, `email`, `age`) VALUES
(1, 'admin', 'admin@example.com', 25),
(2, 'test', 'test@example.com', 30),
(3, 'user', 'user@example.com', 28);
