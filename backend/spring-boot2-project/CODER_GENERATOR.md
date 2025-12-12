# 代码生成器使用指南

本项目提供多种代码生成方式，以快速生成Entity、Mapper、Service、Controller等代码。

## 方式一：MyBatis Plus 在线代码生成器（推荐）

### 访问地址
https://www.mybatisplus.com/center/generator/

### 使用步骤
1. **配置数据库连接**
   - 输入数据库URL、用户名、密码
   - 选择数据库类型：MySQL

2. **选择要生成的表**
   - 多选需要生成代码的表

3. **配置生成选项**
   ```
   模块名: spring-boot2-project
   包名: com.example.springboot2project
   ```

4. **选择生成内容**
   - ✅ Entity（实体类）
   - ✅ Mapper（数据访问层）
   - ✅ Service（业务逻辑层）
   - ✅ ServiceImpl（业务逻辑实现）
   - ✅ Controller（控制器层）
   - ✅ XML（SQL映射文件）

5. **高级配置**
   ```
   Entity命名: 驼峰命名
   字段命名: 驼峰命名
   实体类后缀: Entity（可选）
   Mapper后缀: Mapper
   Service后缀: Service
   Controller后缀: Controller
   ```

6. **生成并下载**
   - 点击"生成代码"按钮
   - 下载zip压缩包
   - 解压到项目中

### 生成的目录结构
```
src/main/java/com/example/springboot2project/
├── pojo/domain/
│   └── User.java                      # 实体类
├── mapper/
│   └── UserMapper.java                # Mapper接口
├── service/
│   ├── UserService.java               # Service接口
│   └── impl/
│       └── UserServiceImpl.java       # Service实现
└── controller/
    └── UserController.java            # 控制器
```

## 方式二：使用MyBatis Plus Generator Maven插件

### 在pom.xml中添加插件
```xml
<build>
    <plugins>
        <plugin>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-generator</artifactId>
            <version>3.5.3.1</version>
            <executions>
                <execution>
                    <phase>generate-sources</phase>
                    <goals>
                        <goal>generate</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

### 创建配置文件 `generator/config.json`
```json
{
  "dbConfig": {
    "dbType": "mysql",
    "url": "jdbc:mysql://localhost:3306/your_database_name?useUnicode=true&characterEncoding=utf8&serverTimezone=GMT%2B8&useSSL=false",
    "username": "root",
    "password": "your_password",
    "driverName": "com.mysql.jdbc.Driver"
  },
  "strategyConfig": {
    "include": ["user", "role"],
    "exclude": [],
    "naming": "underline_to_camel",
    "columnNaming": "underline_to_camel",
    "entityLombokModel": true,
    "restControllerStyle": true
  },
  "packageConfig": {
    "parent": "com.example.springboot2project",
    "moduleName": "",
    "entity": "pojo.domain",
    "mapper": "mapper",
    "service": "service",
    "serviceImpl": "service.impl",
    "controller": "controller"
  },
  "globalConfig": {
    "outputDir": "src/main/java",
    "fileOverride": false,
    "open": false,
    "enableCache": false,
    "author": "Auto Generator",
    "swagger2": true
  }
}
```

### 执行生成命令
```bash
# 使用指定配置文件生成
mvn mybatis-plus-generator:generate -Dmybatis.generator.configFile=generator/config.json
```

## 方式三：使用IDEA插件（MyBatisX）

### 安装插件
1. 打开IDEA
2. 进入 File → Settings → Plugins
3. 搜索 "MyBatisX"
4. 安装插件

### 使用步骤
1. **连接数据库**
   - 在IDEA右侧工具栏找到"Database"
   - 点击"+"，添加MySQL数据源
   - 填写数据库连接信息

2. **生成代码**
   - 连接到数据库后，右键点击表名
   - 选择"MyBatisX-Generator"
   - 配置生成的包名和模块名
   - 选择生成的内容（Entity、Mapper、Service、Controller）
   - 点击生成

3. **选择生成位置**
   ```
   Target Project: spring-boot2-project
   Target Package: com.example.springboot2project
   ```

## 方式四：使用MyBatis-Plus官方CLI

### 安装CLI工具
```bash
npm install -g mybatis-plus-cli
```

### 初始化项目
```bash
mp init
```

### 配置文件 `mp.yml`
```yaml
# 数据源配置
datasource:
  driver: mysql
  url: jdbc:mysql://localhost:3306/your_database_name
  username: root
  password: your_password

# 生成配置
generator:
  parentPackage: com.example.springboot2project
  entity: pojo.domain
  mapper: mapper
  service: service
  controller: controller
  tables:
    - user
    - role
    - permission
```

### 执行生成
```bash
mp generate
```

## 生成的代码说明

### 1. Entity（实体类）
```java
@Data  // Lombok注解，自动生成getter/setter
@TableName("user")  // 指定表名
public class User {
    @TableId(type = IdType.AUTO)  // 主键策略
    private Long id;

    @TableField("username")  // 指定字段名
    private String username;

    @TableField(exist = false)  // 非数据库字段
    private String extraField;
}
```

### 2. Mapper（数据访问层）
```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 自动继承CRUD方法
    // save, saveBatch, remove, removeById, getById, list, page
}
```

### 3. Service（业务逻辑层）
```java
public interface UserService extends IService<User> {
    // 自动继承CRUD方法
}
```

### 4. ServiceImpl（业务逻辑实现）
```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    // 业务逻辑实现
}
```

### 5. Controller（控制器层）
```java
@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) {
        return userService.getById(id);
    }
}
```

## 配置注意事项

### 1. 数据库表设计规范
- **表名使用下划线**：user_info, order_detail
- **字段名使用下划线**：create_time, update_time
- **包含主键字段**：id（建议bigint类型）

### 2. 生成后需手动配置
- **Mapper扫描**：确保Application类上添加了@MapperScan
- **事务管理**：添加@Transactional注解
- **API文档**：配置Swagger

### 3. 自定义模板（可选）
可以自定义代码生成模板，修改生成的代码风格：
- 创建自定义模板文件
- 配置模板引擎（Freemarker、Velocity等）
- 指定模板路径

## 常见问题

### Q: 生成后报注解找不到错误？
A: 确保已添加依赖：
```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

### Q: Mapper接口无法自动注入？
A: 检查Application类上是否添加了@MapperScan：
```java
@SpringBootApplication
@MapperScan("com.example.springboot2project.mapper")
public class SpringBoot2ProjectApplication {
    // ...
}
```

### Q: 如何生成自定义SQL？
A: 在Mapper接口中直接编写：
```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    @Select("SELECT * FROM user WHERE age > #{age}")
    List<User> selectByAge(Integer age);
}
```

## 最佳实践

1. **单表操作**：使用MyBatis Plus的CRUD方法
2. **多表联查**：自定义SQL或使用QueryWrapper
3. **业务逻辑**：在Service层实现
4. **参数校验**：使用@Valid注解
5. **异常处理**：使用GlobalExceptionHandler
6. **日志记录**：使用@Slf4j注解

## 推荐工作流

1. 设计数据库表结构
2. 使用在线生成器快速生成基础代码
3. 根据业务需求修改Entity和DTO
4. 在Service层实现业务逻辑
5. 完善Controller层的API
6. 添加Swagger文档注解
7. 编写单元测试
